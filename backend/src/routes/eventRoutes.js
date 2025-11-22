// backend/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');

// **********************************************
// 1. مسار تسجيل الحضور (الضغط على السهم) - 핵심 الواجهة
// **********************************************
router.post('/:eventId/attend', async (req, res) => {
    const { memberId } = req.body;
    const eventId = req.params.eventId;

    try {
        let attendanceRecord = await Attendance.findOne({ eventId, memberId });

        if (!attendanceRecord) {
            // إذا لم يكن هناك سجل، افترض أنه حاضر الآن
            attendanceRecord = await Attendance.create({
                eventId,
                memberId,
                status: 'Present',
                checkInTime: new Date()
            });
        } else if (attendanceRecord.status === 'Absent') {
            // إذا كان غائباً، قم بتسجيل حضوره الآن
            attendanceRecord.status = 'Present';
            attendanceRecord.checkInTime = new Date();
            await attendanceRecord.save();
        } else if (attendanceRecord.status === 'Present') {
            // هذا الجزء اختياري: إذا كان حاضراً، يمكنك تسجيل غيابه (للإلغاء)
            attendanceRecord.status = 'Absent';
            attendanceRecord.checkInTime = null;
            await attendanceRecord.save();
        }

        // إرجاع السجل المحدث
        res.status(200).json({ msg: 'Attendance status updated', record: attendanceRecord });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error during attendance update' });
    }
});

// **********************************************
// 2. جلب قائمة الحضور لصفحة الحدث (لإنشاء الأقسام الثلاثة)
// **********************************************
router.get('/:eventId/attendance', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const attendance = await Attendance.find({ eventId })
            .populate('memberId', 'name mobile') // جلب بيانات العضو
            .sort({ checkInTime: -1 });

        // حساب الإحصائيات
        const total = attendance.length;
        const present = attendance.filter(rec => rec.status === 'Present');
        const absent = attendance.filter(rec => rec.status === 'Absent');

        // ملاحظة: يمكنك جلب قائمة بجميع الأعضاء ثم فلترتها هنا إذا كان هناك قائمة أعضاء شاملة مسبقة

        res.json({
            total: total,
            presentCount: present.length,
            absentCount: absent.length,
            presentMembers: present,
            absentMembers: absent
        });

    } catch (error) {
        res.status(500).json({ msg: 'Server error fetching attendance' });
    }
});

// **********************************************
// 3. البحث عن عضو
// **********************************************
router.get('/:eventId/search', async (req, res) => {
    const eventId = req.params.eventId;
    const { query } = req.query; // يمكن أن يكون اسم أو موبايل

    if (!query) {
        return res.status(400).json({ msg: 'Search query is required' });
    }

    try {
        // البحث عن عضو يطابق الاسم أو رقم الموبايل
        const members = await Member.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // بحث غير حساس لحالة الأحرف
                { mobile: query }
            ]
        });

        if (members.length === 0) {
            return res.json([]);
        }

        // جلب حالة الحضور لهذا الحدث لكل عضو تم العثور عليه
        const memberIds = members.map(m => m._id);
        const attendance = await Attendance.find({ eventId, memberId: { $in: memberIds } });

        // دمج البيانات لإظهار حالة الحضور والبيانات للعضو
        const results = members.map(member => {
            const statusRecord = attendance.find(att => att.memberId.equals(member._id));
            return {
                _id: member._id,
                name: member.name,
                mobile: member.mobile,
                status: statusRecord ? statusRecord.status : 'Absent' // افترض غائب إذا لم يكن له سجل بعد
            };
        });

        res.json(results);

    } catch (error) {
        res.status(500).json({ msg: 'Server error during search' });
    }
});

module.exports = router;