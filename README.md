# 🤖 TikTok Info Bot

بوت تيليجرام لتحميل فيديوهات تيك توك بدون علامة مائية وعرض معلومات الحسابات.

## ✨ المميزات

- 📹 **تحميل الفيديوهات** - تحميل فيديوهات تيك توك بدون علامة مائية
- 👤 **معلومات الحسابات** - عرض معلومات تفصيلية عن أي حساب تيك توك
- 🌍 **كشف الدولة** - استخراج دولة المستخدم من البايو أو الاسم
- 📊 **الإحصائيات** - عرض المتابعين، الإعجابات، عدد الفيديوهات، وغيرها
- 🔍 **بحث مرن** - قبول اليوزر نيم مع أو بدون @

## 🚀 التثبيت

### المتطلبات
- Node.js (v14 أو أحدث)
- npm أو yarn

### الخطوات

1. **استنساخ المشروع**
```bash
git clone https://github.com/3zoz121/bot-tiktok-info-.git
cd bot-tiktok-info-
```

2. **تثبيت المكتبات**
```bash
npm install
```

3. **إعداد البوت**
- انسخ ملف `.env.example` إلى `.env`
```bash
cp .env.example .env
```
- افتح ملف `.env` وضع توكن البوت الخاص بك من [@BotFather](https://t.me/BotFather)

4. **تشغيل البوت**
```bash
node bot.js
```

## 🌐 استضافة مجانية 24/7

يمكنك استضافة البوت مجاناً على أحد هذه المنصات:

### 1. **Render.com** (موصى به ⭐)
- سجل حساب على [Render.com](https://render.com)
- اضغط "New" → "Web Service"
- اربط حساب GitHub واختر هذا المشروع
- اختر الإعدادات:
  - **Environment**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `node bot.js`
- أضف متغير البيئة `BOT_TOKEN` في قسم Environment
- اضغط "Create Web Service"

### 2. **Railway.app**
- سجل حساب على [Railway.app](https://railway.app)
- اضغط "New Project" → "Deploy from GitHub repo"
- اختر المشروع
- أضف متغير البيئة `BOT_TOKEN`
- سيبدأ التشغيل تلقائياً

### 3. **Fly.io**
```bash
# ثبت Fly CLI
curl -L https://fly.io/install.sh | sh

# سجل دخول
flyctl auth login

# انشر البوت
flyctl launch
flyctl secrets set BOT_TOKEN=your_token_here
flyctl deploy
```

## 📝 الاستخدام

### تحميل فيديو
أرسل رابط فيديو تيك توك للبوت:
```
https://www.tiktok.com/@username/video/1234567890
```

### معلومات حساب
أرسل يوزر نيم (مع أو بدون @):
```
username
@username
```

## 🛠️ التقنيات المستخدمة

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API
- [@tobyg74/tiktok-api-dl](https://github.com/TobyG74/tiktok-api-dl) - TikTok API
- [axios](https://axios-http.com/) - HTTP client

## 📄 الترخيص

MIT License - استخدم المشروع بحرية!

## 🤝 المساهمة

المساهمات مرحب بها! افتح Pull Request أو Issue.

## 📞 الدعم

إذا واجهت أي مشكلة، افتح [Issue](https://github.com/3zoz121/bot-tiktok-info-/issues) على GitHub.

---

صنع بـ ❤️ في السعودية
