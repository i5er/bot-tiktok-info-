# 🚀 دليل رفع البوت على Render

## ✨ نظام Keep-Alive المدمج

البوت الآن يحتوي على نظام **Keep-Alive** مدمج يمنع Render من إيقافه:

- ✅ **HTTP Server** على المنفذ 3000
- ✅ **Self-Ping** كل 60 ثانية تلقائياً
- ✅ **Health Check** endpoints
- ✅ **يعمل 24/7** بدون توقف

---

## 📋 خطوات النشر على Render

### 1️⃣ إنشاء حساب على Render

1. اذهب إلى 👉 [render.com](https://render.com)
2. اضغط **"Get Started for Free"**
3. سجل دخول بحساب GitHub
4. وافق على الصلاحيات

---

### 2️⃣ إنشاء Web Service جديد

1. في Dashboard، اضغط **"New +"**
2. اختر **"Web Service"**
3. اختر **"Connect a repository"**
4. ابحث عن مشروعك `bot-tiktok-info-` واضغط **"Connect"**

---

### 3️⃣ إعدادات المشروع

املأ الحقول التالية:

#### أ. معلومات أساسية:
- **Name:** `tiktok-bot` (أو أي اسم)
- **Region:** اختر الأقرب لك
- **Branch:** `main`
- **Runtime:** `Node`

#### ب. أوامر البناء والتشغيل:
- **Build Command:** `npm install`
- **Start Command:** `node bot.js`

#### ج. الخطة:
- اختر **"Free"** 💰

---

### 4️⃣ إضافة Environment Variables

في قسم **"Environment Variables"**، أضف:

1. **BOT_TOKEN**
   ```
   Key: BOT_TOKEN
   Value: [توكن البوت من BotFather]
   ```

2. **RENDER_URL** (مهم جداً للـ Keep-Alive!)
   ```
   Key: RENDER_URL
   Value: https://tiktok-bot.onrender.com
   ```
   > ⚠️ **ملاحظة:** استبدل `tiktok-bot` باسم مشروعك الفعلي في Render

---

### 5️⃣ النشر

1. اضغط **"Create Web Service"**
2. انتظر حتى ينتهي البناء (2-5 دقائق)
3. عند رؤية **"Live"** → البوت يعمل! ✅

---

## 🔍 التحقق من عمل البوت

### طريقة 1: Logs
1. في Render Dashboard، اضغط على مشروعك
2. اذهب لـ **"Logs"**
3. يجب أن ترى:
   ```
   🌐 Keep-Alive server running on port 3000
   ✅ Bot is running...
   ⏰ Keep-alive ping sent
   ```

### طريقة 2: Health Check
افتح المتصفح واذهب إلى:
```
https://your-app-name.onrender.com/health
```
يجب أن ترى:
```json
{"status":"ok","uptime":123.45}
```

### طريقة 3: اختبار البوت
1. افتح Telegram
2. ابحث عن البوت
3. أرسل `/start`
4. إذا رد = **يعمل!** ✅

---

## ⏰ كيف يعمل Keep-Alive؟

### 1. HTTP Server
- البوت يشغل Express server على المنفذ 3000
- يستجيب لطلبات Render للتحقق من أنه نشط

### 2. Self-Ping (كل 60 ثانية)
```javascript
// البوت يرسل طلب لنفسه كل دقيقة
setInterval(() => {
    axios.get(RENDER_URL);
}, 60000);
```

### 3. النتيجة
- ✅ Render يعتبر البوت نشطاً دائماً
- ✅ لا يتم إيقافه بسبب عدم النشاط
- ✅ يعمل 24/7 بدون توقف

---

## 🔄 تحديث البوت

عند تعديل الكود:

```bash
git add .
git commit -m "وصف التعديل"
git push
```

Render سيقوم بالنشر **تلقائياً** خلال دقائق! ⚡

---

## 💡 نصائح مهمة

### ⚠️ الخطة المجانية:
- ✅ مجانية تماماً
- ⚠️ قد تنام بعد 15 دقيقة من عدم النشاط
- ✅ **نظام Keep-Alive يحل هذه المشكلة!**
- ⚠️ 750 ساعة مجانية شهرياً (كافية لـ 31 يوم)

### 🔒 حماية التوكن:
- ✅ لا ترفع ملف `.env` على GitHub
- ✅ استخدم **Environment Variables** في Render فقط
- ✅ اجعل Repository **Private**

### ⚡ الأداء:
- البوت يعمل 24/7 مع نظام Keep-Alive
- أول استجابة قد تكون بطيئة (cold start)
- بعدها يعمل بسرعة عادية

---

## ❌ حل المشاكل

### 🔴 البوت لا يعمل

**الحل:**
1. تحقق من Logs في Render
2. تأكد من `BOT_TOKEN` صحيح
3. تأكد من `RENDER_URL` صحيح
4. جرب الكود محلياً: `npm start`

### 🔴 "Build Failed"

**الحل:**
1. تحقق من `package.json`
2. تأكد من جميع dependencies موجودة
3. راجع Logs للخطأ

### 🔴 البوت يتوقف بعد فترة

**الحل:**
1. تحقق من `RENDER_URL` في Environment Variables
2. تأكد من أن الـ URL صحيح
3. راجع Logs - يجب أن ترى "Keep-alive ping sent"

### 🔴 Keep-Alive لا يعمل

**الحل:**
1. تأكد من إضافة `RENDER_URL` في Environment Variables
2. تأكد من أن الـ URL بالصيغة: `https://your-app.onrender.com`
3. راجع Logs للتأكد من إرسال الـ pings

---

## 📊 مراقبة البوت

### في Render Dashboard:
- **Logs:** لمشاهدة نشاط البوت
- **Metrics:** لمراقبة الأداء
- **Events:** لمتابعة عمليات النشر

### Health Check:
زر الرابط كل فترة للتحقق:
```
https://your-app-name.onrender.com/health
```

---

## 🎯 خلاصة سريعة

```
1. حساب Render ← Sign up with GitHub
2. New Web Service ← Connect repository
3. إعدادات ← Build & Start commands
4. Environment Variables ← BOT_TOKEN + RENDER_URL
5. Deploy ← انتظر... ✅
6. استمتع بالبوت 24/7! 🎉
```

**⏱️ الوقت الكلي: 5-10 دقائق فقط!**

---

## 🔗 روابط مفيدة

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)

---

## ✅ مميزات نظام Keep-Alive المدمج

- ✅ **تلقائي بالكامل** - لا يحتاج إعداد إضافي
- ✅ **Self-ping كل 60 ثانية** - يمنع النوم
- ✅ **Health check endpoints** - للمراقبة
- ✅ **Logging واضح** - تتبع سهل
- ✅ **يعمل مع Render مجاناً** - بدون تكلفة

---

صنع بـ ❤️ للمجتمع العربي
