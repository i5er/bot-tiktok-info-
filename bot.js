const TelegramBot = require('node-telegram-bot-api');
const { Downloader, StalkUser } = require('@tobyg74/tiktok-api-dl');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// قراءة التوكن من متغير البيئة أو استخدام القيمة الافتراضية
const BOT_TOKEN = process.env.BOT_TOKEN || '8583406610:AAHyQilOKjNFTs3_9sEy1Wg522SSx8P9SUY';

// إنشاء البوت
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 البوت شغال الحين...');

// رسالة الترحيب
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎬 مرحباً بك في بوت تحميل فيديوهات تيك توك!

📝 كيف تستخدم البوت:
1️⃣ انسخ رابط أي فيديو من تيك توك
2️⃣ أرسله هنا
3️⃣ انتظر شوي وبينزل لك الفيديو بدون علامة مائية! ✨

جرب الحين! 🚀
  `;
    bot.sendMessage(chatId, welcomeMessage);
});

// التعامل مع الرسائل
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // تجاهل أوامر البوت
    if (text && text.startsWith('/')) {
        return;
    }

    // التحقق من وجود رابط تيك توك
    if (text && (text.includes('tiktok.com') || text.includes('vm.tiktok.com') || text.includes('vt.tiktok.com'))) {
        try {
            // إرسال رسالة انتظار
            const waitMsg = await bot.sendMessage(chatId, '⏳ جاري تحميل الفيديو... انتظر شوي');

            console.log('🔍 محاولة تحميل الرابط:', text);

            // تحميل الفيديو - استخدام v1 للحصول على الإحصائيات الكاملة
            const result = await Downloader(text, { version: 'v1' });

            console.log('📦 نتيجة API:', JSON.stringify(result, null, 2));

            if (result.status === 'success' && result.result) {
                const videoData = result.result;

                // حذف رسالة الانتظار
                await bot.deleteMessage(chatId, waitMsg.message_id);

                // معلومات الفيديو
                const formatNumber = (num) => {
                    if (!num) return '0';
                    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                    return num.toString();
                };

                const stats = videoData.statistics || {};
                const author = videoData.author || {};

                const caption = `
✅ تم التحميل بنجاح!

👤 الناشر: ${author.nickname || 'غير معروف'}
📝 الوصف: ${(videoData.desc || 'لا يوجد').substring(0, 100)}${videoData.desc && videoData.desc.length > 100 ? '...' : ''}

📊 الإحصائيات:
❤️ الإعجابات: ${formatNumber(stats.likeCount)}
💖 المفضلة: ${formatNumber(stats.favoriteCount || stats.collectCount)}
💬 التعليقات: ${formatNumber(stats.commentCount)}
👁 المشاهدات: ${formatNumber(stats.playCount)}
🔄 المشاركات: ${formatNumber(stats.shareCount)}
        `.trim();

                // إرسال الفيديو
                console.log('🔍 فحص بيانات الفيديو:', {
                    hasVideo: !!videoData.video,
                    hasPlayAddr: !!(videoData.video && videoData.video.playAddr),
                    hasVideoHD: !!videoData.videoHD,
                    hasVideoSD: !!videoData.videoSD
                });
                let videoUrl;
                // v1 API structure
                if (videoData.video && videoData.video.playAddr && videoData.video.playAddr.length > 0) {
                    videoUrl = videoData.video.playAddr[0];
                    console.log('🎬 رابط الفيديو (v1):', videoUrl);
                }
                // v3 API structure
                else if (videoData.videoHD) {
                    videoUrl = videoData.videoHD;
                    console.log('🎬 رابط الفيديو HD:', videoUrl);
                } else if (videoData.videoSD) {
                    videoUrl = videoData.videoSD;
                    console.log('🎬 رابط الفيديو SD:', videoUrl);
                } else if (videoData.video && videoData.video.length > 0) {
                    // fallback
                    videoUrl = videoData.video[0];
                    console.log('🎬 رابط الفيديو:', videoUrl);
                } else if (videoData.images && videoData.images.length > 0) {
                    // إذا كان slideshow (صور)
                    console.log('📸 محتوى صور، عدد الصور:', videoData.images.length);
                    await bot.sendMessage(chatId, '📸 هذا المحتوى عبارة عن صور (slideshow)، جاري إرسال الصور...');
                    for (let i = 0; i < Math.min(videoData.images.length, 10); i++) {
                        await bot.sendPhoto(chatId, videoData.images[i]);
                    }
                    return;
                }

                if (videoUrl) {
                    try {
                        console.log('📥 تحميل الفيديو من الرابط...');

                        // تحميل الفيديو بإعدادات محسّنة
                        const response = await axios({
                            method: 'GET',
                            url: videoUrl,
                            responseType: 'stream',
                            timeout: 60000, // 60 ثانية
                            maxRedirects: 5,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        // إنشاء مجلد temp إذا لم يكن موجود
                        const tempDir = path.join(__dirname, 'temp');
                        if (!fs.existsSync(tempDir)) {
                            fs.mkdirSync(tempDir);
                        }

                        // حفظ الفيديو مؤقتاً
                        const videoPath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
                        const writer = fs.createWriteStream(videoPath);

                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });

                        console.log('📤 إرسال الفيديو...');

                        // إرسال الفيديو من الملف المحلي
                        await bot.sendVideo(chatId, videoPath, { caption });

                        console.log('✅ تم إرسال الفيديو بنجاح');

                        // حذف الملف المؤقت
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
                console.log('❌ فشل التحميل - الحالة:', result.status);
                console.log('📋 التفاصيل الكاملة:', JSON.stringify(result, null, 2));
                await bot.deleteMessage(chatId, waitMsg.message_id);
                await bot.sendMessage(chatId, '❌ عذراً، ما قدرت أحمل الفيديو. تأكد من الرابط وجرب مرة ثانية.');
            }

        } catch (error) {
            console.error('❌ خطأ في تحميل الفيديو:', error);
            console.error('📋 تفاصيل الخطأ:', error.message);
            console.error('📋 Stack trace:', error.stack);
            await bot.sendMessage(chatId, '❌ حدث خطأ أثناء تحميل الفيديو. جرب مرة ثانية أو جرب رابط ثاني.');
        }
    }
    // التحقق من وجود يوزر نيم (مع أو بدون @)
    else if (text && !text.includes('http') && text.length > 2 && text.length < 30) {
        try {
            // إزالة @ إذا كانت موجودة
            const username = text.startsWith('@') ? text.substring(1) : text;
            const waitMsg = await bot.sendMessage(chatId, '⏳ جاري البحث عن الحساب... انتظر شوي');

            console.log('🔍 البحث عن اليوزر:', username);

            // جلب معلومات الحساب - تجربة v3 للحصول على معلومات أكثر
            const result = await StalkUser(username, { version: 'v3' });

            console.log('📦 نتيجة البحث (v3):', JSON.stringify(result, null, 2));

            if (result.status === 'success' && result.result) {
                const data = result.result;
                await bot.deleteMessage(chatId, waitMsg.message_id);

                // طباعة البيانات الكاملة للتشخيص
                console.log('📊 بيانات المستخدم الكاملة:', JSON.stringify(data, null, 2));

                // استخراج بيانات المستخدم من الـ structure الصحيح
                const user = data.user || data;
                const stats = data.stats || data.statsV2 || {};

                // تنسيق الأرقام
                const formatNumber = (num) => {
                    if (!num || num === 0) return '0';
                    // تحويل string إلى number إذا لزم الأمر
                    const numValue = typeof num === 'string' ? parseInt(num) : num;
                    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
                    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
                    return numValue.toString();
                };

                // تنسيق التاريخ
                const formatDate = (timestamp) => {
                    if (!timestamp) return 'غير متوفر';
                    const date = new Date(timestamp * 1000);
                    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
                };

                // استخراج البيانات مع دعم أسماء مختلفة للحقول
                const followerCount = stats.followerCount || stats.followers || user.follower || 0;
                const followingCount = stats.followingCount || stats.following || user.following || 0;
                const likesCount = stats.heartCount || stats.heart || stats.likeCount || user.likes || 0;
                const videoCount = stats.videoCount || stats.video || user.video || 0;

                console.log('📈 الإحصائيات المستخرجة:', {
                    followers: followerCount,
                    following: followingCount,
                    likes: likesCount,
                    videos: videoCount
                });

                // استخراج الدولة من مصادر مختلفة
                let region = user.region || user.country || data.region || null;

                // محاولة استخراج الدولة من البايو أو التوقيع
                if (!region && user.signature) {
                    const sig = user.signature.toLowerCase();
                    if (sig.includes('🇸🇦') || sig.includes('saudi') || sig.includes('السعودية') || sig.includes('ksa')) region = '🇸🇦 السعودية';
                    else if (sig.includes('🇦🇪') || sig.includes('uae') || sig.includes('الإمارات') || sig.includes('emirates')) region = '🇦🇪 الإمارات';
                    else if (sig.includes('🇰🇼') || sig.includes('kuwait') || sig.includes('الكويت')) region = '🇰🇼 الكويت';
                    else if (sig.includes('🇶🇦') || sig.includes('qatar') || sig.includes('قطر')) region = '🇶🇦 قطر';
                    else if (sig.includes('🇧🇭') || sig.includes('bahrain') || sig.includes('البحرين')) region = '🇧🇭 البحرين';
                    else if (sig.includes('🇴🇲') || sig.includes('oman') || sig.includes('عمان')) region = '🇴🇲 عمان';
                    else if (sig.includes('🇪🇬') || sig.includes('egypt') || sig.includes('مصر')) region = '🇪🇬 مصر';
                    else if (sig.includes('🇮🇶') || sig.includes('iraq') || sig.includes('العراق')) region = '🇮🇶 العراق';
                    else if (sig.includes('🇯🇴') || sig.includes('jordan') || sig.includes('الأردن')) region = '🇯🇴 الأردن';
                    else if (sig.includes('🇱🇧') || sig.includes('lebanon') || sig.includes('لبنان')) region = '🇱🇧 لبنان';
                    else if (sig.includes('🇸🇾') || sig.includes('syria') || sig.includes('سوريا')) region = '🇸🇾 سوريا';
                    else if (sig.includes('🇾🇪') || sig.includes('yemen') || sig.includes('اليمن')) region = '🇾🇪 اليمن';
                    else if (sig.includes('🇲🇦') || sig.includes('morocco') || sig.includes('المغرب')) region = '🇲🇦 المغرب';
                    else if (sig.includes('🇩🇿') || sig.includes('algeria') || sig.includes('الجزائر')) region = '🇩🇿 الجزائر';
                    else if (sig.includes('🇹🇳') || sig.includes('tunisia') || sig.includes('تونس')) region = '🇹🇳 تونس';
                    else if (sig.includes('🇱🇾') || sig.includes('libya') || sig.includes('ليبيا')) region = '🇱🇾 ليبيا';
                    else if (sig.includes('🇸🇩') || sig.includes('sudan') || sig.includes('السودان')) region = '🇸🇩 السودان';
                    else if (sig.includes('🇵🇸') || sig.includes('palestine') || sig.includes('فلسطين')) region = '🇵🇸 فلسطين';
                    else if (sig.includes('🇺🇸') || sig.includes('usa') || sig.includes('america') || sig.includes('أمريكا')) region = '🇺🇸 أمريكا';
                    else if (sig.includes('🇬🇧') || sig.includes('uk') || sig.includes('britain') || sig.includes('بريطانيا')) region = '🇬🇧 بريطانيا';
                }

                // محاولة استخراج الدولة من الاسم (nickname)
                if (!region && user.nickname) {
                    const name = user.nickname.toLowerCase();
                    if (name.includes('🇸🇦') || name.includes('السعودية') || name.includes('سعودي')) region = '🇸🇦 السعودية';
                    else if (name.includes('🇦🇪') || name.includes('الإمارات') || name.includes('إماراتي')) region = '🇦🇪 الإمارات';
                    else if (name.includes('🇰🇼') || name.includes('الكويت') || name.includes('كويتي')) region = '🇰🇼 الكويت';
                    else if (name.includes('🇶🇦') || name.includes('قطر') || name.includes('قطري')) region = '🇶🇦 قطر';
                    else if (name.includes('🇧🇭') || name.includes('البحرين') || name.includes('بحريني')) region = '🇧🇭 البحرين';
                    else if (name.includes('🇴🇲') || name.includes('عمان') || name.includes('عماني')) region = '🇴🇲 عمان';
                    else if (name.includes('🇪🇬') || name.includes('مصر') || name.includes('مصري')) region = '🇪🇬 مصر';
                    else if (name.includes('🇮🇶') || name.includes('العراق') || name.includes('عراقي')) region = '🇮🇶 العراق';
                    else if (name.includes('🇯🇴') || name.includes('الأردن') || name.includes('أردني')) region = '🇯🇴 الأردن';
                    else if (name.includes('🇱🇧') || name.includes('لبنان') || name.includes('لبناني')) region = '🇱🇧 لبنان';
                    else if (name.includes('🇸🇾') || name.includes('سوريا') || name.includes('سوري')) region = '🇸🇾 سوريا';
                    else if (name.includes('🇾🇪') || name.includes('اليمن') || name.includes('يمني')) region = '🇾🇪 اليمن';
                    else if (name.includes('🇲🇦') || name.includes('المغرب') || name.includes('مغربي')) region = '🇲🇦 المغرب';
                    else if (name.includes('🇩🇿') || name.includes('الجزائر') || name.includes('جزائري')) region = '🇩🇿 الجزائر';
                    else if (name.includes('🇹🇳') || name.includes('تونس') || name.includes('تونسي')) region = '🇹🇳 تونس';
                    else if (name.includes('🇵🇸') || name.includes('فلسطين') || name.includes('فلسطيني')) region = '🇵🇸 فلسطين';
                }

                // استخراج تاريخ الإنشاء
                let createTime = user.createTime || user.created || user.nicknameModifyTime || data.createTime;
                // إذا التاريخ 0 أو null، نخليه null
                if (!createTime || createTime === 0) createTime = null;

                // بناء رسالة المعلومات
                let profileInfo = `
👤 معلومات الحساب

🎯 الاسم: ${user.nickname || user.name || 'غير متوفر'}
📍 اليوزر: @${user.username || user.uniqueId || username}`;

                // إضافة الدولة فقط إذا لقيناها في البايو أو الاسم
                if (region) {
                    profileInfo += `\n🌍 الدولة: ${region}`;
                }

                profileInfo += `
📝 البايو: ${user.signature || user.bio || 'لا يوجد'}

📊 الإحصائيات:
👥 المتابعين: ${formatNumber(followerCount)}
⭐ يتابع: ${formatNumber(followingCount)}
❤️ الإعجابات: ${formatNumber(likesCount)}
🎬 الفيديوهات: ${formatNumber(videoCount)}`;

                // إضافة تاريخ الإنشاء فقط إذا كان موجود
                if (createTime) {
                    profileInfo += `\n\n📅 تاريخ الإنشاء: ${formatDate(createTime)}`;
                }

                if (user.verified) {
                    profileInfo += `\n✅ حساب موثق`;
                }

                profileInfo = profileInfo.trim();

                // إرسال صورة البروفايل مع المعلومات
                if (user.avatarLarger || user.avatar) {
                    await bot.sendPhoto(chatId, user.avatarLarger || user.avatar, { caption: profileInfo });
                } else {
                    await bot.sendMessage(chatId, profileInfo);
                }

            } else {
                await bot.deleteMessage(chatId, waitMsg.message_id);
                await bot.sendMessage(chatId, '❌ ما قدرت ألقى الحساب. تأكد من اليوزر نيم وجرب مرة ثانية.');
            }

        } catch (error) {
            console.error('❌ خطأ في البحث عن الحساب:', error);
            console.error('📋 تفاصيل الخطأ:', error.message);
            await bot.sendMessage(chatId, '❌ حدث خطأ أثناء البحث. جرب مرة ثانية.');
        }
    }
    else if (text) {
        // رسالة للمستخدم إذا أرسل شيء غير رابط تيك توك أو يوزر نيم
        await bot.sendMessage(chatId, `⚠️ أرسل لي:
📹 رابط فيديو من تيك توك عشان أحمله لك
👤 أو يوزر نيم (مع أو بدون @) عشان أجيب لك معلومات الحساب!`);
    }
});

// التعامل مع الأخطاء
bot.on('polling_error', (error) => {
    console.error('خطأ في الاتصال:', error);
});