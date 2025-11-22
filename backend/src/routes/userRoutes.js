// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route   POST /api/users/login
// @desc    تسجيل دخول المستخدم والحصول على الرمز المميز
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// @route   POST /api/users
// @desc    تسجيل مستخدم جديد (متاح للمسؤول فقط - Admin)
router.post('/', async (req, res) => {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, password, role });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

module.exports = router;