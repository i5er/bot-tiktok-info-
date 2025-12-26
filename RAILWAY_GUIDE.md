# 🚀 دليل رفع البوت على Railway

## ✨ لماذا Railway؟

Railway هو **الأسهل والأفضل** للمبتدئين:

- ✅ **500 ساعة مجانية شهرياً** (≈ 20 يوم تشغيل متواصل)
- ✅ **سهل جداً** - 5 دقائق فقط للإعداد
- ✅ **نشر تلقائي** من GitHub
- ✅ **لا يحتاج بطاقة ائتمان**
- ✅ **يعمل 24/7** بدون توقف

---

## 📋 الخطوات (3 خطوات فقط!)

### 1️⃣ إنشاء حساب على Railway

1. اذهب إلى 👉 [railway.app](https://railway.app)
2. اضغط **"Login with GitHub"**
3. سجل دخول بحساب GitHub
4. وافق على الصلاحيات

✅ **تم! حسابك جاهز**

---

### 2️⃣ رفع المشروع على GitHub

#### إذا كان مشروعك على GitHub بالفعل ⏭️ انتقل للخطوة 3

#### أ. إنشاء Repository جديد:

1. اذهب إلى 👉 [github.com/new](https://github.com/new)
2. اسم المشروع: `tiktok-bot`
3. اجعله **Private** 🔒
4. اضغط **"Create repository"**

#### ب. رفع الكود:

افتح Terminal في مجلد المشروع:

```bash
# تهيئة Git
git init
git add .
git commit -m "Initial commit"

# ربط GitHub (استبدل USERNAME و tiktok-bot باسمك ومشروعك)
git remote add origin https://github.com/USERNAME/tiktok-bot.git
git branch -M main
git push -u origin main
```

✅ **تم! الكود على GitHub**

---

### 3️⃣ نشر على Railway

1. **في Railway Dashboard:**
   - اضغط **"New Project"**
   - اختر **"Deploy from GitHub repo"**

2. **اختر المشروع:**
   - ابحث عن `tiktok-bot`
   - اضغط عليه

3. **إضافة التوكن:**
   - بعد إنشاء المشروع، اضغط على **"Variables"**
   - اضغط **"New Variable"**
   - أضف:
     ```
     Name: BOT_TOKEN
     Value: [توكن البوت من BotFather]
     ```
   - اضغط **"Add"**

4. **انتظر النشر:**
   - سترى **"Deploying..."**
   - بعد دقيقة أو دقيقتين: **"Success ✅"**

✅ **تم! البوت يعمل الآن 24/7** 🎉

---

## 🎯 التحقق من عمل البوت

### طريقة 1: اللوقات (Logs)
1. في Railway، اضغط على مشروعك
2. اذهب لـ **"Deployments"**
3. اضغط على آخر Deployment
4. شاهد اللوقات - يجب أن ترى:
   ```
   ✅ Bot is running...
   ```

### طريقة 2: اختبار البوت
1. افتح Telegram
2. ابحث عن البوت
3. أرسل `/start`
4. إذا رد عليك = **يعمل!** ✅

---

## 🔄 تحديث البوت

عند تعديل الكود:

```bash
git add .
git commit -m "وصف التعديل"
git push
```

Railway سيقوم بالنشر **تلقائياً** خلال دقائق! ⚡

---

## 💡 نصائح مهمة

### ⏰ الحد المجاني (500 ساعة/شهر):
- كافية لـ **20 يوم** تشغيل متواصل
- إذا نفذت، البوت يتوقف حتى الشهر القادم
- **الحل:** استخدم **Koyeb** (مجاني تماماً) كبديل

### 🔒 حماية التوكن:
- ✅ **لا ترفع** ملف `.env` على GitHub
- ✅ استخدم **Variables** في Railway فقط
- ✅ اجعل Repository **Private**

### ⚡ الأداء:
- البوت يعمل 24/7 تلقائياً
- لا حاجة لأي إعدادات إضافية

---

## ❌ حل المشاكل

### 🔴 البوت لا يعمل

**الحل:**
1. تحقق من اللوقات في Railway
2. تأكد من `BOT_TOKEN` صحيح في Variables
3. جرب الكود محلياً أولاً: `npm start`

### 🔴 "Build Failed"

**الحل:**
1. تحقق من `package.json`
2. تأكد من تثبيت جميع الحزم: `npm install`
3. راجع اللوقات للخطأ

### 🔴 البوت يتوقف بعد فترة

**الحل:**
1. تحقق من الساعات المتبقية في Railway
2. إذا نفذت الساعات، استخدم **Koyeb** كبديل

---

## 🎁 بدائل مجانية (إذا نفذت ساعات Railway)

### Koyeb ⭐ (الأفضل - مجاني تماماً)
- 🔗 [koyeb.com](https://koyeb.com)
- نفس الخطوات تقريباً
- **مجاني بدون حدود**

### Cyclic
- 🔗 [cyclic.sh](https://cyclic.sh)
- سهل جداً
- مجاني

---

## ✅ خلاصة سريعة

```
1. حساب Railway ← Login with GitHub
2. رفع على GitHub ← git push
3. Deploy on Railway ← اختر المشروع
4. أضف BOT_TOKEN ← Variables
5. استمتع! 🎉
```

**⏱️ الوقت الكلي: 5-10 دقائق فقط!**

---

## 📞 تحتاج مساعدة؟

- راجع [Railway Docs](https://docs.railway.app)
- شاهد اللوقات في Railway
- اسألني وسأساعدك! 😊

---

صنع بـ ❤️ للمجتمع العربي
