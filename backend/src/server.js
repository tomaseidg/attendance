// backend/src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// تحميل متغيرات البيئة
dotenv.config({ path: '../.env' }); // تأكد من المسار الصحيح لملف .env

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // لقبول بيانات JSON في الـ body

// استخدام مسارات الـ API (سننشئها لاحقاً)
app.use('/api/events', require('./routes/eventRoutes'));
// يمكنك إضافة مسارات أخرى للمستخدمين والأعضاء هنا

const { protect } = require('./middleware/authMiddleware'); // استيراد الـ middleware
// ...

// استخدام مسارات الـ API
app.use('/api/users', require('./routes/userRoutes'));
// تطبيق الحماية على مسارات الأحداث
app.use('/api/events', protect, require('./routes/eventRoutes')); // الآن لا يمكن الوصول للأحداث بدون تسجيل دخول

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));