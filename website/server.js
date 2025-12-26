const express = require('express');
const cors = require('cors');
const { Downloader, StalkUser } = require('@tobyg74/tiktok-api-dl');
const path = require('path');
const fs = require('fs');
const { TikTokAutomation, parseCookies } = require('./tiktok-automation');

const app = express();
const PORT = process.env.PORT || 3000;

// Session storage (in-memory for simplicity, can be replaced with database)
const sessions = new Map();

// Load sessions from file if exists
const sessionsFile = path.join(__dirname, 'sessions.json');
if (fs.existsSync(sessionsFile)) {
    try {
        const data = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
        Object.entries(data).forEach(([key, value]) => sessions.set(key, value));
        console.log('📂 Loaded sessions from file');
    } catch (error) {
        console.error('❌ Error loading sessions:', error.message);
    }
}

// Save sessions to file
const saveSessions = () => {
    try {
        const data = Object.fromEntries(sessions);
        fs.writeFileSync(sessionsFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving sessions:', error.message);
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to format numbers
const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    const numValue = typeof num === 'string' ? parseInt(num) : num;
    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
    return numValue.toString();
};

// Helper function to detect region/country from IP address
const detectRegion = async (req) => {
    try {
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress;

        console.log(`🌍 Detecting country for IP: ${clientIP}`);

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://api.country.is/${clientIP}`);
        const data = await response.json();

        if (data && data.country) {
            const countryCode = data.country.toUpperCase();
            console.log(`✅ Detected country code: ${countryCode}`);

            const countryMap = {
                'SA': '🇸🇦 السعودية', 'AE': '🇦🇪 الإمارات', 'KW': '🇰🇼 الكويت',
                'QA': '🇶🇦 قطر', 'BH': '🇧🇭 البحرين', 'OM': '🇴🇲 عمان',
                'EG': '🇪🇬 مصر', 'IQ': '🇮🇶 العراق', 'JO': '🇯🇴 الأردن',
                'LB': '🇱🇧 لبنان', 'SY': '🇸🇾 سوريا', 'YE': '🇾🇪 اليمن',
                'MA': '🇲🇦 المغرب', 'DZ': '🇩🇿 الجزائر', 'TN': '🇹🇳 تونس',
                'LY': '🇱🇾 ليبيا', 'SD': '🇸🇩 السودان', 'PS': '🇵🇸 فلسطين',
                'US': '🇺🇸 أمريكا', 'GB': '🇬🇧 بريطانيا', 'FR': '🇫🇷 فرنسا',
                'DE': '🇩🇪 ألمانيا', 'TR': '🇹🇷 تركيا', 'IN': '🇮🇳 الهند',
                'PK': '🇵🇰 باكستان', 'ID': '🇮🇩 إندونيسيا', 'MY': '🇲🇾 ماليزيا',
                'CN': '🇨🇳 الصين', 'JP': '🇯🇵 اليابان', 'KR': '🇰🇷 كوريا الجنوبية',
                'BR': '🇧🇷 البرازيل', 'MX': '🇲🇽 المكسيك', 'CA': '🇨🇦 كندا',
                'AU': '🇦🇺 أستراليا', 'RU': '🇷🇺 روسيا'
            };

            return countryMap[countryCode] || `🌍 ${data.country}`;
        }

        return '🌍 دولي';
    } catch (error) {
        console.error('❌ Error detecting region:', error.message);
        return '🌍 دولي';
    }
};

// API endpoint to download TikTok video
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('vt.tiktok.com'))) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال رابط تيك توك صحيح'
            });
        }

        console.log('🔍 Downloading video from:', url);

        // Download video using v1 API
        const result = await Downloader(url, { version: 'v1' });

        if (result.status === 'success' && result.result) {
            const videoData = result.result;
            const stats = videoData.statistics || {};
            const author = videoData.author || {};

            // Extract video URL
            let videoUrl;
            if (videoData.video && videoData.video.playAddr && videoData.video.playAddr.length > 0) {
                videoUrl = videoData.video.playAddr[0];
            } else if (videoData.videoHD) {
                videoUrl = videoData.videoHD;
            } else if (videoData.videoSD) {
                videoUrl = videoData.videoSD;
            } else if (videoData.video && videoData.video.length > 0) {
                videoUrl = videoData.video[0];
            }

            // Check if it's a slideshow
            if (!videoUrl && videoData.images && videoData.images.length > 0) {
                return res.json({
                    success: true,
                    type: 'slideshow',
                    images: videoData.images.slice(0, 10),
                    author: author.nickname || 'غير معروف',
                    description: videoData.desc || 'لا يوجد وصف'
                });
            }

            if (videoUrl) {
                return res.json({
                    success: true,
                    type: 'video',
                    videoUrl: videoUrl,
                    author: author.nickname || 'غير معروف',
                    description: videoData.desc || 'لا يوجد وصف',
                    stats: {
                        likes: formatNumber(stats.likeCount),
                        favorites: formatNumber(stats.favoriteCount || stats.collectCount),
                        comments: formatNumber(stats.commentCount),
                        views: formatNumber(stats.playCount),
                        shares: formatNumber(stats.shareCount)
                    }
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'لم يتم العثور على رابط الفيديو'
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                message: 'فشل تحميل الفيديو. تأكد من الرابط وحاول مرة أخرى'
            });
        }
    } catch (error) {
        console.error('❌ Error downloading video:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحميل الفيديو. حاول مرة أخرى'
        });
    }
});

// API endpoint to verify session
app.post('/api/verify-session', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId || sessionId.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال اسم مستخدم تيك توك صحيح'
            });
        }

        console.log('🔑 Verifying session:', sessionId.substring(0, 10) + '...');

        // Check if session exists in cache
        if (sessions.has(sessionId)) {
            const profile = sessions.get(sessionId);
            return res.json({
                success: true,
                profile: profile
            });
        }

        // Treat sessionId as TikTok username and fetch real profile
        const username = sessionId.startsWith('@') ? sessionId.substring(1) : sessionId;

        console.log('🔍 Fetching TikTok profile for:', username);

        try {
            // Get user profile using v3 API
            const result = await StalkUser(username, { version: 'v3' });

            if (result.status === 'success' && result.result) {
                const data = result.result;
                const user = data.user || data;

                // Create profile from real TikTok data
                const newProfile = {
                    username: user.username || user.uniqueId || username,
                    nickname: user.nickname || user.name || 'مستخدم تيك توك',
                    bio: user.signature || user.bio || 'لا يوجد بايو',
                    avatar: user.avatarLarger || user.avatar || 'https://via.placeholder.com/150'
                };

                // Cache the profile
                sessions.set(sessionId, newProfile);
                saveSessions();

                console.log('✅ Profile fetched successfully:', newProfile.nickname);

                return res.json({
                    success: true,
                    profile: newProfile
                });
            } else {
                // If profile not found, return error
                return res.status(404).json({
                    success: false,
                    message: 'لم يتم العثور على حساب تيك توك بهذا الاسم'
                });
            }
        } catch (apiError) {
            console.error('❌ Error fetching TikTok profile:', apiError.message);
            return res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء جلب معلومات الحساب من تيك توك'
            });
        }
    } catch (error) {
        console.error('❌ Error verifying session:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من الجلسة'
        });
    }
});

// API endpoint to update nickname (with browser automation)
app.post('/api/update-nickname', async (req, res) => {
    try {
        const { sessionId, nickname, cookies } = req.body;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({
                success: false,
                message: 'جلسة غير صالحة'
            });
        }

        if (!nickname || nickname.length < 2 || nickname.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال اسم صحيح (2-30 حرف)'
            });
        }

        if (!cookies || cookies.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال cookies للمصادقة'
            });
        }

        console.log('📝 Updating nickname with automation:', sessionId.substring(0, 10) + '...');

        // Use browser automation to update TikTok profile
        const automation = new TikTokAutomation();
        try {
            await automation.init(cookies);
            const result = await automation.updateNickname(nickname);
            await automation.cleanup();

            if (result.success) {
                // Update local cache
                const profile = sessions.get(sessionId);
                profile.nickname = nickname;
                sessions.set(sessionId, profile);
                saveSessions();
            }

            return res.json(result);
        } catch (error) {
            await automation.cleanup();
            throw error;
        }
    } catch (error) {
        console.error('❌ Error updating nickname:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الاسم: ' + error.message
        });
    }
});

// API endpoint to update avatar (with browser automation)
app.post('/api/update-avatar', async (req, res) => {
    try {
        const { sessionId, avatar, cookies } = req.body;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({
                success: false,
                message: 'جلسة غير صالحة'
            });
        }

        if (!avatar || !avatar.startsWith('http')) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال رابط صورة صحيح'
            });
        }

        if (!cookies || cookies.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال cookies للمصادقة'
            });
        }

        console.log('🖼️ Updating avatar with automation:', sessionId.substring(0, 10) + '...');

        // Note: Avatar update requires downloading the image first
        return res.json({
            success: false,
            message: 'تحديث الصورة غير مدعوم حالياً - يتطلب رفع ملف'
        });
    } catch (error) {
        console.error('❌ Error updating avatar:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الصورة'
        });
    }
});

// API endpoint to update bio (with browser automation)
app.post('/api/update-bio', async (req, res) => {
    try {
        const { sessionId, bio, cookies } = req.body;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({
                success: false,
                message: 'جلسة غير صالحة'
            });
        }

        if (!bio || bio.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال بايو صحيح (حتى 200 حرف)'
            });
        }

        if (!cookies || cookies.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال cookies للمصادقة'
            });
        }

        console.log('📄 Updating bio with automation:', sessionId.substring(0, 10) + '...');

        // Use browser automation to update TikTok profile
        const automation = new TikTokAutomation();
        try {
            await automation.init(cookies);
            const result = await automation.updateBio(bio);
            await automation.cleanup();

            if (result.success) {
                // Update local cache
                const profile = sessions.get(sessionId);
                profile.bio = bio;
                sessions.set(sessionId, profile);
                saveSessions();
            }

            return res.json(result);
        } catch (error) {
            await automation.cleanup();
            throw error;
        }
    } catch (error) {
        console.error('❌ Error updating bio:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث البايو: ' + error.message
        });
    }
});

// API endpoint to get user profile
app.post('/api/profile', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || username.length < 2 || username.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال اسم مستخدم صحيح'
            });
        }

        // Remove @ if present
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

        console.log('🔍 Looking up user:', cleanUsername);

        // Get user profile using v3 API
        const result = await StalkUser(cleanUsername, { version: 'v3' });

        if (result.status === 'success' && result.result) {
            const data = result.result;
            const user = data.user || data;
            const stats = data.stats || data.statsV2 || {};

            const followerCount = stats.followerCount || stats.followers || user.follower || 0;
            const followingCount = stats.followingCount || stats.following || user.following || 0;
            const likesCount = stats.heartCount || stats.heart || stats.likeCount || user.likes || 0;
            const videoCount = stats.videoCount || stats.video || user.video || 0;

            // Detect region/country from IP
            const region = await detectRegion(req);

            return res.json({
                success: true,
                profile: {
                    username: user.username || user.uniqueId || cleanUsername,
                    nickname: user.nickname || user.name || 'غير متوفر',
                    bio: user.signature || user.bio || 'لا يوجد',
                    avatar: user.avatarLarger || user.avatar || null,
                    verified: user.verified || false,
                    region: region,
                    stats: {
                        followers: formatNumber(followerCount),
                        following: formatNumber(followingCount),
                        likes: formatNumber(likesCount),
                        videos: formatNumber(videoCount)
                    }
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الحساب. تأكد من اسم المستخدم'
            });
        }
    } catch (error) {
        console.error('❌ Error looking up profile:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء البحث. حاول مرة أخرى'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`🚀 TikTok Downloader Website running on http://localhost:${PORT}`);
});
