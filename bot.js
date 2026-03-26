const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ========================================
// دالة تحميل فيديو/صور تيك توك عبر tikwm API
// ========================================
async function tikwmDownload(url) {
    const resp = await axios.post('https://tikwm.com/api/', new URLSearchParams({ url, hd: 1 }), {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 20000
    });
    return resp.data;
}

// ========================================
// دالة جلب معلومات حساب تيك توك عبر tikwm API
// ========================================
async function tikwmUserInfo(username) {
    const resp = await axios.post('https://tikwm.com/api/user/info', new URLSearchParams({ unique_id: username }), {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000
    });
    return resp.data;
}

// قراءة التوكن من متغير البيئة أو استخدام القيمة الافتراضية
const BOT_TOKEN = process.env.BOT_TOKEN || '8583406610:AAHyQilOKjNFTs3_9sEy1Wg522SSx8P9SUY';
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME || ''; // ضع معرف قناتك هنا مثل @i5err

// إنشاء البوت مع إعدادات محسّنة لمنع التكرار
const bot = new TelegramBot(BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// تخزين الرسائل المعالجة لمنع التكرار
const processedMessages = new Set();
const MESSAGE_CACHE_TIME = 60000; // دقيقة واحدة

// تنظيف الـ cache كل دقيقة
setInterval(() => {
    processedMessages.clear();
}, MESSAGE_CACHE_TIME);

// نظام حفظ المستخدمين للـ broadcast
const USERS_FILE = path.join(__dirname, 'users.json');

// تحميل المستخدمين
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
    return new Set();
}

// حفظ المستخدمين
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify([...users]), 'utf8');
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

const botUsers = loadUsers();

// معرف الأدمن (ضع معرفك هنا)
const ADMIN_ID = process.env.ADMIN_ID || 'YOUR_TELEGRAM_ID'; // غيره لمعرفك

// إنشاء Express server للـ health checks (مطلوب للاستضافة المجانية)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'active',
        bot: 'TikTok Bot',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
});

// ========================================
// 🚀 Keep-Alive System for Render
// Self-ping every 60 seconds to prevent sleep
// ========================================
const RENDER_URL = process.env.RENDER_URL; // أضف هذا في متغيرات Render
if (RENDER_URL) {
    console.log('⏰ Keep-Alive system activated!');
    setInterval(async () => {
        try {
            await axios.get(RENDER_URL + '/health');
            console.log('⏰ Keep-alive ping sent at', new Date().toLocaleTimeString('ar-SA'));
        } catch (error) {
            console.log('⚠️ Keep-alive ping failed:', error.message);
        }
    }, 60000); // كل 60 ثانية
}
// ========================================

console.log('🤖 البوت شغال الحين...');

// رسالة الترحيب
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userId = msg.from.id.toString();

    // حفظ المستخدم
    if (!botUsers.has(userId)) {
        botUsers.add(userId);
        saveUsers(botUsers);
        console.log(`✅ New user: ${userId} (Total: ${botUsers.size})`);
    }

    if (CHANNEL_USERNAME) {
        try {
            const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
            if (!['member', 'administrator', 'creator'].includes(chatMember.status)) {
                const channelUrl = CHANNEL_USERNAME.startsWith('@') ? `https://t.me/${CHANNEL_USERNAME.substring(1)}` : CHANNEL_USERNAME;
                await bot.sendMessage(chatId, `⚠️ عذراً، يجب عليك الاشتراك في قناة البوت أولاً لتتمكن من استخدامه.\n\nاشترك من هنا 👇 ثم أرسل /start`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'اشترك في القناة 📢', url: channelUrl }]]
                    }
                });
                return;
            }
        } catch (error) {
            console.error('Error checking subscription on /start:', error.message);
        }
    }

    // تحقق من عدم معالجة الرسالة مسبقاً
    const messageKey = `${chatId}_${messageId}`;
    if (processedMessages.has(messageKey)) return;
    processedMessages.add(messageKey);

    const welcomeMessage = `
🎬 مرحباً بك في بوت تحميل فيديوهات تيك توك!

📝 الميزات المتاحة:

📥 تحميل الفيديوهات:
• انسخ رابط أي فيديو من تيك توك
• أرسله هنا وبينزل لك بدون علامة مائية! ✨

👤 معلومات الحسابات:
• أرسل اليوزر نيم (مع أو بدون @)
• بيجيب لك كل معلومات الحساب

جرب الحين! 🚀
  `;
    bot.sendMessage(chatId, welcomeMessage);
});

// أمر البث للأدمن
bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (userId !== ADMIN_ID) {
        await bot.sendMessage(chatId, '❌ هذا الأمر للأدمن فقط!');
        return;
    }

    const message = match[1];
    const statusMsg = await bot.sendMessage(chatId, `📢 جاري الإرسال لـ ${botUsers.size} مستخدم...`);

    let sent = 0, failed = 0;

    for (const user of botUsers) {
        try {
            await bot.sendMessage(user, `📢 إعلان:\n\n${message}`);
            sent++;
            await new Promise(r => setTimeout(r, 50));
        } catch (error) {
            failed++;
        }
    }

    await bot.editMessageText(
        `✅ تم!\n\n✅ نجح: ${sent}\n❌ فشل: ${failed}\n📊 المجموع: ${botUsers.size}`,
        { chat_id: chatId, message_id: statusMsg.message_id }
    );
});

// إحصائيات
bot.onText(/\/stats/, async (msg) => {
    const userId = msg.from.id.toString();
    if (userId !== ADMIN_ID) return;
    await bot.sendMessage(msg.chat.id, `📊 عدد المستخدمين: ${botUsers.size}`);
});

// معرف المستخدم
bot.onText(/\/myid/, async (msg) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `🆔 معرفك:\n\`${userId}\`\n\nانسخه وضعه في ADMIN_ID`, { parse_mode: 'Markdown' });
});

// ========================================
// ========================================
bot.onText(/\/cancel/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    userStates.delete(userId);
    pendingDeletions.delete(userId);

    await bot.sendMessage(chatId, '✅ تم إلغاء العملية');
});

// التعامل مع الرسائل
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const messageId = msg.message_id;

    // تجاهل أوامر البوت
    if (text && text.startsWith('/')) {
        return;
    }

    const userId = msg.from.id.toString();

    if (CHANNEL_USERNAME) {
        try {
            const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
            if (!['member', 'administrator', 'creator'].includes(chatMember.status)) {
                const channelUrl = CHANNEL_USERNAME.startsWith('@') ? `https://t.me/${CHANNEL_USERNAME.substring(1)}` : CHANNEL_USERNAME;
                await bot.sendMessage(chatId, `⚠️ عذراً، يجب عليك الاشتراك في قناة البوت أولاً لتتمكن من استخدامه.\n\nاشترك من هنا 👇`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'اشترك في القناة 📢', url: channelUrl }]]
                    }
                });
                return;
            }
        } catch (error) {
            console.error('Error checking subscription on message:', error.message);
        }
    }

    // تحقق من عدم معالجة الرسالة مسبقاً
    const messageKey = `${chatId}_${messageId}`;
    if (processedMessages.has(messageKey)) {
        console.log(`⏭️ تخطي رسالة مكررة: ${messageKey}`);
        return;
    }
    processedMessages.add(messageKey);



    // التحقق من وجود رابط تيك توك
    if (text && (text.includes('tiktok.com') || text.includes('vm.tiktok.com') || text.includes('vt.tiktok.com'))) {
        try {
            const waitMsg = await bot.sendMessage(chatId, '⏳ جاري تحميل المحتوى... انتظر شوي');
            console.log('🔍 محاولة تحميل الرابط:', text);

            // استخدام tikwm API
            const apiResult = await tikwmDownload(text);
            console.log('📦 نتيجة tikwm:', JSON.stringify(apiResult).substring(0, 500));

            if (apiResult.code === 0 && apiResult.data) {
                const d = apiResult.data;
                await bot.deleteMessage(chatId, waitMsg.message_id);

                const formatNumber = (num) => {
                    if (!num) return '0';
                    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                    return num.toString();
                };

                const caption = `
✅ تم التحميل بنجاح!

👤 الناشر: ${d.author?.nickname || 'غير معروف'}
📝 الوصف: ${(d.title || 'لا يوجد').substring(0, 100)}${d.title && d.title.length > 100 ? '...' : ''}

📊 الإحصائيات:
❤️ الإعجابات: ${formatNumber(d.digg_count)}
💬 التعليقات: ${formatNumber(d.comment_count)}
👁 المشاهدات: ${formatNumber(d.play_count)}
🔄 المشاركات: ${formatNumber(d.share_count)}
🔖 المفضلة: ${formatNumber(d.collect_count)}
                `.trim();

                // التحقق إذا كان صور (slideshow)
                if (d.images && d.images.length > 0) {
                    console.log('📸 محتوى صور، عدد الصور:', d.images.length);
                    await bot.sendMessage(chatId, `📸 هذا المحتوى عبارة عن ${d.images.length} صور (slideshow)، جاري إرسالها...`);
                    for (let i = 0; i < Math.min(d.images.length, 10); i++) {
                        try {
                            await bot.sendPhoto(chatId, d.images[i], {
                                caption: i === 0 ? caption : undefined
                            });
                        } catch (imgErr) {
                            console.error(`❌ خطأ في إرسال الصورة ${i + 1}:`, imgErr.message);
                        }
                    }
                    return;
                }

                // تحميل الفيديو - نستخدم play (H.264) بدل hdplay (H.265) لأن تلقرام ما يدعم H.265 كويس
                const videoUrl = d.play || d.hdplay;
                if (videoUrl) {
                    try {
                        console.log('📥 تحميل الفيديو...');
                        const fullUrl = videoUrl.startsWith('http') ? videoUrl : 'https://tikwm.com' + videoUrl;

                        const response = await axios({
                            method: 'GET',
                            url: fullUrl,
                            responseType: 'stream',
                            timeout: 60000,
                            maxRedirects: 5,
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                        });

                        const tempDir = path.join(__dirname, 'temp');
                        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

                        const videoPath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
                        const writer = fs.createWriteStream(videoPath);
                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });

                        console.log('📤 إرسال الفيديو...');
                        await bot.sendVideo(chatId, videoPath, { caption, supports_streaming: true });
                        console.log('✅ تم إرسال الفيديو بنجاح');

                        fs.unlinkSync(videoPath);
                        console.log('🗑️ تم حذف الملف المؤقت');
                    } catch (error) {
                        console.error('❌ خطأ في تحميل أو إرسال الفيديو:', error.message);
                        await bot.sendMessage(chatId, '❌ حدث خطأ أثناء معالجة الفيديو. جرب مرة ثانية.');
                    }
                } else {
                    console.log('❌ لم يتم العثور على رابط فيديو');
                    await bot.sendMessage(chatId, '❌ عذراً، ما قدرت أحصل على رابط الفيديو. جرب رابط ثاني.');
                }
            } else {
                console.log('❌ فشل tikwm:', apiResult.msg);
                await bot.deleteMessage(chatId, waitMsg.message_id);
                await bot.sendMessage(chatId, '❌ عذراً، ما قدرت أحمل المحتوى. تأكد من الرابط وجرب مرة ثانية.');
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل المحتوى:', error.message);
            await bot.sendMessage(chatId, '❌ حدث خطأ أثناء التحميل. جرب مرة ثانية أو جرب رابط ثاني.');
        }
    }
    // التحقق من وجود يوزر نيم (يجب أن يبدأ بـ @)
    else if (text && text.startsWith('@') && !text.includes('http') && text.length > 2 && text.length < 30) {
        try {
            const username = text.substring(1);
            const waitMsg = await bot.sendMessage(chatId, '⏳ جاري البحث عن الحساب... انتظر شوي');
            console.log('🔍 البحث عن اليوزر:', username);

            const apiResult = await tikwmUserInfo(username);
            console.log('📦 نتيجة tikwm user:', JSON.stringify(apiResult).substring(0, 500));

            if (apiResult.code === 0 && apiResult.data) {
                const user = apiResult.data;
                await bot.deleteMessage(chatId, waitMsg.message_id);

                const formatNumber = (num) => {
                    if (!num || num === 0) return '0';
                    const numValue = typeof num === 'string' ? parseInt(num) : num;
                    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
                    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
                    return numValue.toString();
                };

                const formatDate = (timestamp) => {
                    if (!timestamp) return 'غير متوفر';
                    const date = new Date(timestamp * 1000);
                    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
                };

                const stats = user.stats || {};
                const followerCount = stats.followerCount || user.followers || 0;
                const followingCount = stats.followingCount || user.following || 0;
                const likesCount = stats.heartCount || stats.heart || user.digg_count || 0;
                const videoCount = stats.videoCount || user.video_count || 0;

                // استخراج الدولة
                let region = user.region || user.country || null;
                if (!region && user.signature) {
                    const sig = user.signature.toLowerCase();
                    if (sig.includes('🇸🇦') || sig.includes('saudi') || sig.includes('السعودية') || sig.includes('ksa')) region = '🇸🇦 السعودية';
                    else if (sig.includes('🇦🇪') || sig.includes('uae') || sig.includes('الإمارات')) region = '🇦🇪 الإمارات';
                    else if (sig.includes('🇰🇼') || sig.includes('kuwait') || sig.includes('الكويت')) region = '🇰🇼 الكويت';
                    else if (sig.includes('🇶🇦') || sig.includes('qatar') || sig.includes('قطر')) region = '🇶🇦 قطر';
                    else if (sig.includes('🇪🇬') || sig.includes('egypt') || sig.includes('مصر')) region = '🇪🇬 مصر';
                    else if (sig.includes('🇮🇶') || sig.includes('iraq') || sig.includes('العراق')) region = '🇮🇶 العراق';
                    else if (sig.includes('🇯🇴') || sig.includes('jordan') || sig.includes('الأردن')) region = '🇯🇴 الأردن';
                    else if (sig.includes('🇱🇧') || sig.includes('lebanon') || sig.includes('لبنان')) region = '🇱🇧 لبنان';
                    else if (sig.includes('🇸🇾') || sig.includes('سوريا')) region = '🇸🇾 سوريا';
                    else if (sig.includes('🇾🇪') || sig.includes('اليمن')) region = '🇾🇪 اليمن';
                    else if (sig.includes('🇲🇦') || sig.includes('المغرب')) region = '🇲🇦 المغرب';
                    else if (sig.includes('🇩🇿') || sig.includes('الجزائر')) region = '🇩🇿 الجزائر';
                    else if (sig.includes('🇹🇳') || sig.includes('تونس')) region = '🇹🇳 تونس';
                    else if (sig.includes('🇵🇸') || sig.includes('فلسطين')) region = '🇵🇸 فلسطين';
                }

                let profileInfo = `
👤 معلومات الحساب

🎯 الاسم: ${user.nickname || 'غير متوفر'}
📍 اليوزر: @${user.uniqueId || username}`;

                if (region) profileInfo += `\n🌍 الدولة: ${region}`;

                profileInfo += `
📝 البايو: ${user.signature || 'لا يوجد'}

📊 الإحصائيات:
👥 المتابعين: ${formatNumber(followerCount)}
⭐ يتابع: ${formatNumber(followingCount)}
❤️ الإعجابات: ${formatNumber(likesCount)}
🎬 الفيديوهات: ${formatNumber(videoCount)}`;

                if (user.createTime && user.createTime !== 0) {
                    profileInfo += `\n\n📅 تاريخ الإنشاء: ${formatDate(user.createTime)}`;
                }
                if (user.verified) profileInfo += `\n✅ حساب موثق`;

                profileInfo = profileInfo.trim();

                const avatar = user.avatarLarger || user.avatarMedium || user.avatarThumb;
                if (avatar) {
                    await bot.sendPhoto(chatId, avatar, { caption: profileInfo });
                } else {
                    await bot.sendMessage(chatId, profileInfo);
                }
            } else {
                await bot.deleteMessage(chatId, waitMsg.message_id);
                await bot.sendMessage(chatId, '❌ ما قدرت ألقى الحساب. تأكد من اليوزر نيم وجرب مرة ثانية.');
            }
        } catch (error) {
            console.error('❌ خطأ في البحث عن الحساب:', error.message);
            await bot.sendMessage(chatId, '❌ حدث خطأ أثناء البحث. جرب مرة ثانية.');
        }
    }
    else if (text && msg.chat.type === 'private') {
        // رسالة للمستخدم إذا أرسل شيء غير رابط تيك توك أو يوزر نيم
        // يتم إرسالها فقط في المحادثات الخاصة لتجنب الإزعاج في المجموعات
        await bot.sendMessage(chatId, `⚠️ أرسل لي:
📹 رابط فيديو من تيك توك عشان أحمله لك
👤 أو يوزر نيم (مثل @user) عشان أجيب لك معلومات الحساب!`);
    }
});

// التعامل مع الأخطاء
bot.on('polling_error', (error) => {
    console.error('❌ خطأ في الاتصال:', error.message);

    // إذا كان الخطأ بسبب instance ثاني، أوقف هذا البوت
    if (error.message.includes('409') || error.message.includes('Conflict')) {
        console.error('⚠️ فيه instance ثاني شغال! إيقاف هذا البوت...');
        process.exit(1);
    }
});

// معالجة إيقاف البوت بشكل صحيح
process.on('SIGINT', () => {
    console.log('\n👋 إيقاف البوت...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 إيقاف البوت...');
    bot.stopPolling();
    process.exit(0);
});