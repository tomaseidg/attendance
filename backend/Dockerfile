# استخدام صورة Node.js رسمية
FROM node:20-alpine

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملفات package.json و package-lock.json
COPY package*.json ./

# تثبيت التبعيات
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# تعرض الخدمة على المنفذ 5000
EXPOSE 5000

# أمر التشغيل الافتراضي (سيتم تجاوزه بواسطة docker-compose في وضع التطوير)
CMD [ "npm", "start" ]