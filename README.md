# 🤖 بوت تيك توك - TikTok Bot

بوت تيليجرام متطور لتحميل فيديوهات TikTok بدون علامة مائية والبحث عن معلومات المستخدمين.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-ISC-blue.svg)]()

---

## 📋 جدول المحتويات

- [المميزات](#-المميزات)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [هيكل المشروع](#-هيكل-المشروع)
- [التثبيت المحلي](#-التثبيت-المحلي)
- [الاستضافة المجانية](#-الاستضافة-المجانية)
- [استخدام البوت](#-استخدام-البوت)
- [نظام Keep-Alive](#-نظام-keep-alive)
- [المتغيرات البيئية](#-المتغيرات-البيئية)
- [حل المشاكل](#-حل-المشاكل)
- [المساهمة](#-المساهمة)

---

## ✨ المميزات

### 📥 تحميل الفيديوهات
- ✅ تحميل فيديوهات TikTok **بدون علامة مائية**
- ✅ دعم روابط مختصرة (`vm.tiktok.com`, `vt.tiktok.com`)
- ✅ تحميل الصور المتعددة (Slideshows)
- ✅ عرض إحصائيات الفيديو (إعجابات، تعليقات، مشاهدات، مشاركات)
- ✅ معلومات الناشر والوصف

### 👤 البحث عن المستخدمين
- ✅ البحث بـ username (مع أو بدون @)
- ✅ عرض معلومات الحساب الكاملة
- ✅ الإحصائيات (متابعين، متابَعين، إعجابات، فيديوهات)
- ✅ صورة البروفايل والبايو
- ✅ الحسابات الموثقة (Verified)
- ✅ تحديد الدولة من البايو أو الاسم

### 🚀 مميزات تقنية
- ✅ **نظام Keep-Alive** - يعمل 24/7 على Render
- ✅ **Self-Ping** كل 60 ثانية لمنع النوم
- ✅ **Health Check Endpoints** للمراقبة
- ✅ **منع التكرار** - معالجة ذكية للرسائل
- ✅ **دعم كامل للغة العربية**
- ✅ **معالجة أخطاء متقدمة**

---

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - HTTP Server للـ Keep-Alive
- **node-telegram-bot-api** - التعامل مع Telegram API
- **@tobyg74/tiktok-api-dl** - تحميل فيديوهات TikTok
- **Axios** - طلبات HTTP

### استضافة
- **Render** - استضافة مجانية مع Keep-Alive
- **Railway** - بديل مجاني (500 ساعة/شهر)
- **GitHub** - إدارة الكود والنشر التلقائي

---

## 📁 هيكل المشروع

```
bot_tik/
├── bot.js                  # الملف الرئيسي للبوت
├── package.json            # معلومات المشروع والحزم
├── package-lock.json       # قفل إصدارات الحزم
├── .env                    # المتغيرات البيئية (غير مرفوع على Git)
├── .env.example            # مثال للمتغيرات البيئية
├── .gitignore              # ملفات مستثناة من Git
│
├── render.yaml             # إعدادات Render
├── railway.json            # إعدادات Railway
├── Procfile                # إعدادات تشغيل Railway
│
├── README.md               # هذا الملف
├── RENDER_GUIDE.md         # دليل النشر على Render
├── RAILWAY_GUIDE.md        # دليل النشر على Railway
│
├── temp/                   # مجلد مؤقت للفيديوهات
│
└── website/                # موقع تحميل الفيديوهات (اختياري)
    ├── server.js           # خادم الموقع
    ├── package.json        # حزم الموقع
    ├── tiktok-automation.js # أتمتة TikTok
    ├── sessions.json       # جلسات المستخدمين
    ├── COOKIE_GUIDE.md     # دليل الكوكيز
    ├── README.md           # توثيق الموقع
    └── public/             # الملفات العامة
        ├── index.html      # الصفحة الرئيسية
        ├── style.css       # التنسيقات
        └── script.js       # السكريبتات
```

---

## 💻 التثبيت المحلي

### المتطلبات
- Node.js 16 أو أحدث
- npm أو yarn
- توكن بوت Telegram من [@BotFather](https://t.me/BotFather)

### الخطوات

#### 1. استنساخ المشروع
```bash
git clone https://github.com/3zoz121/bot-tiktok-info-.git
cd bot_tik
```

#### 2. تثبيت الحزم
```bash
npm install
```

#### 3. إعداد ملف البيئة
```bash
cp .env.example .env
```

#### 4. إضافة التوكن
افتح ملف `.env` وأضف توكن البوت:
```env
BOT_TOKEN=your_telegram_bot_token_here
RENDER_URL=https://your-app-name.onrender.com
```

#### 5. تشغيل البوت
```bash
npm start
# أو
npm run bot
```

#### 6. تشغيل الموقع (اختياري)
```bash
npm run dev
# أو
npm run website
```

---

## 🌐 الاستضافة المجانية

### خيار 1: Render (موصى به) ⭐

**المميزات:**
- ✅ مجاني تماماً
- ✅ 750 ساعة/شهر (كافية لـ 31 يوم)
- ✅ نظام Keep-Alive مدمج
- ✅ يعمل 24/7

**الخطوات:**
1. اذهب إلى [render.com](https://render.com)
2. سجل دخول بحساب GitHub
3. أنشئ **Web Service** جديد
4. اختر المشروع من GitHub
5. أضف Environment Variables:
   - `BOT_TOKEN` = توكن البوت
   - `RENDER_URL` = رابط المشروع على Render
6. اضغط **Deploy**

📖 **دليل مفصل:** [RENDER_GUIDE.md](./RENDER_GUIDE.md)

---

### خيار 2: Railway

**المميزات:**
- ✅ 500 ساعة مجانية/شهر
- ✅ سهل جداً
- ✅ نشر تلقائي من GitHub

**الخطوات:**
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول بحساب GitHub
3. اختر **Deploy from GitHub repo**
4. أضف `BOT_TOKEN` في Variables
5. انتظر النشر

📖 **دليل مفصل:** [RAILWAY_GUIDE.md](./RAILWAY_GUIDE.md)

---

## 🤖 استخدام البوت

### الأوامر المتاحة

#### `/start`
بدء البوت وعرض رسالة الترحيب

#### إرسال رابط TikTok
```
https://www.tiktok.com/@username/video/1234567890
https://vm.tiktok.com/xxxxx
https://vt.tiktok.com/xxxxx
```
**النتيجة:** تحميل الفيديو بدون علامة مائية + الإحصائيات

#### إرسال Username
```
@username
username
```
**النتيجة:** معلومات الحساب الكاملة + الإحصائيات

---

### أمثلة الاستخدام

#### مثال 1: تحميل فيديو
```
المستخدم: https://www.tiktok.com/@user/video/123456
البوت: ⏳ جاري تحميل الفيديو... انتظر شوي
البوت: [يرسل الفيديو مع المعلومات]
      ✅ تم التحميل بنجاح!
      👤 الناشر: اسم الناشر
      📝 الوصف: وصف الفيديو
      📊 الإحصائيات:
      ❤️ الإعجابات: 1.2M
      💬 التعليقات: 5.3K
      👁 المشاهدات: 10.5M
```

#### مثال 2: البحث عن مستخدم
```
المستخدم: @username
البوت: ⏳ جاري البحث عن الحساب... انتظر شوي
البوت: [يرسل صورة البروفايل مع المعلومات]
      👤 معلومات الحساب
      🎯 الاسم: الاسم الكامل
      📍 اليوزر: @username
      🌍 الدولة: 🇸🇦 السعودية
      📝 البايو: البايو الخاص بالمستخدم
      📊 الإحصائيات:
      👥 المتابعين: 500K
      ⭐ يتابع: 100
      ❤️ الإعجابات: 5.2M
      🎬 الفيديوهات: 250
```

---

## ⚡ نظام Keep-Alive

### كيف يعمل؟

البوت يحتوي على نظام **Keep-Alive** مدمج يمنع Render من إيقافه:

#### 1. HTTP Server
```javascript
// Express server على المنفذ 3000
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        bot: 'TikTok Bot',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
```

#### 2. Self-Ping (كل 60 ثانية)
```javascript
// البوت يرسل طلب لنفسه كل دقيقة
setInterval(async () => {
    await axios.get(RENDER_URL + '/health');
    console.log('⏰ Keep-alive ping sent');
}, 60000);
```

### Health Check Endpoints

#### `GET /`
```json
{
  "status": "active",
  "bot": "TikTok Bot",
  "uptime": 123.45,
  "timestamp": "2025-12-26T16:53:07.257Z"
}
```

#### `GET /health`
```json
{
  "status": "ok",
  "uptime": 123.45
}
```

### التحقق من عمل Keep-Alive

في Logs يجب أن ترى:
```
🌐 Health check server running on port 3000
⏰ Keep-Alive system activated!
🤖 البوت شغال الحين...
⏰ Keep-alive ping sent at [الوقت]
```

---

## 🔐 المتغيرات البيئية

### `BOT_TOKEN` (مطلوب)
توكن البوت من [@BotFather](https://t.me/BotFather)
```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### `RENDER_URL` (مطلوب للـ Keep-Alive)
رابط المشروع على Render
```env
RENDER_URL=https://your-app-name.onrender.com
```

### `PORT` (اختياري)
المنفذ الذي يعمل عليه HTTP Server (افتراضي: 3000)
```env
PORT=3000
```

---

## 🔧 السكريبتات المتاحة

### `npm start` أو `npm run bot`
تشغيل البوت الرئيسي

### `npm run dev`
تشغيل موقع تحميل الفيديوهات

### `npm run website`
تشغيل الموقع من مجلد website

### `npm test`
تشغيل الاختبارات (غير متوفر حالياً)

---

## ❌ حل المشاكل

### البوت لا يستجيب

**الأسباب المحتملة:**
- ❌ التوكن غير صحيح
- ❌ البوت غير مشغل
- ❌ مشكلة في الاتصال بالإنترنت

**الحل:**
1. تحقق من صحة `BOT_TOKEN`
2. تأكد من تشغيل البوت: `npm start`
3. راجع اللوقات للأخطاء

---

### فشل تحميل الفيديو

**الأسباب المحتملة:**
- ❌ الرابط غير صحيح
- ❌ الفيديو خاص (Private)
- ❌ الفيديو محذوف

**الحل:**
1. تحقق من صحة الرابط
2. تأكد من أن الفيديو عام (Public)
3. جرب رابط آخر

---

### البوت يتوقف على Render

**الأسباب المحتملة:**
- ❌ `RENDER_URL` غير مضاف
- ❌ الـ URL غير صحيح
- ❌ Keep-Alive لا يعمل

**الحل:**
1. تحقق من `RENDER_URL` في Environment Variables
2. تأكد من الـ URL: `https://your-app.onrender.com`
3. راجع Logs - يجب أن ترى "Keep-alive ping sent"

---

### "Conflict: terminated by other getUpdates request"

**السبب:**
فيه instance ثاني من البوت شغال

**الحل:**
1. أوقف جميع instances الأخرى
2. أعد تشغيل البوت
3. تأكد من عدم تشغيل البوت في أكثر من مكان

---

## 📊 الإحصائيات

- **اللغة:** JavaScript (Node.js)
- **الحزم:** 6 حزم رئيسية
- **الملفات:** 20+ ملف
- **الأسطر:** 500+ سطر برمجي
- **الدعم:** العربية 100%

---

## 🤝 المساهمة

المساهمات مرحب بها! إذا كان لديك اقتراح أو تحسين:

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت **ISC License**

---

## 📞 الدعم

إذا واجهت أي مشكلة:
- 📖 راجع [RENDER_GUIDE.md](./RENDER_GUIDE.md)
- 📖 راجع [RAILWAY_GUIDE.md](./RAILWAY_GUIDE.md)
- 🐛 افتح Issue على GitHub
- 💬 تواصل معي

---

## 🙏 شكر خاص

- [@BotFather](https://t.me/BotFather) - لإنشاء بوتات Telegram
- [@tobyg74](https://github.com/TobyG74) - لمكتبة TikTok API
- [Render](https://render.com) - للاستضافة المجانية
- [Railway](https://railway.app) - للاستضافة المجانية

---

## 🌟 المميزات القادمة

- [ ] دعم تحميل Stories
- [ ] دعم تحميل Live Videos
- [ ] إحصائيات متقدمة للمستخدمين
- [ ] دعم لغات إضافية
- [ ] واجهة ويب محسّنة
- [ ] قاعدة بيانات للمستخدمين
- [ ] نظام Premium

---

<div align="center">

**صنع بـ ❤️ للمجتمع العربي**

⭐ إذا أعجبك المشروع، لا تنسى تعطيه نجمة على GitHub!

[![GitHub stars](https://img.shields.io/github/stars/3zoz121/bot-tiktok-info-?style=social)](https://github.com/3zoz121/bot-tiktok-info-)
[![GitHub forks](https://img.shields.io/github/forks/3zoz121/bot-tiktok-info-?style=social)](https://github.com/3zoz121/bot-tiktok-info-)

</div>
