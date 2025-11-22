// backend/src/models/Member.js
const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    qrCodeData: { type: String, unique: true } // يستخدم لـ QR code
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);