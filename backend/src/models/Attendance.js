// backend/src/models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Absent' },
    checkInTime: { type: Date }
}, { timestamps: true });

// لضمان وجود سجل واحد فقط لكل عضو في كل حدث
AttendanceSchema.index({ eventId: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);