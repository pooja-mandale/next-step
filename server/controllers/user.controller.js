const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const path = require('path');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobile, role } = req.body;

    if (!name || !email || !password || !mobile) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: role || 'student'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasSecretCode: !!user.secretCode,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasSecretCode: !!user.secretCode,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get single user by ID
// @route   GET /api/auth/user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password -secretCode');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

// @desc    Get current logged-in user (session restore)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -secretCode');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        hasSecretCode: !!user.secretCode,
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // user.mobile = req.body.mobile || user.mobile; // Mobile number update disabled

    if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        hasSecretCode: !!updatedUser.secretCode,
    });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) { res.status(404); throw new Error('User not found'); }
    if (!currentPassword || !newPassword) { res.status(400); throw new Error('Please provide current and new password'); }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) { res.status(401); throw new Error('Current password is incorrect'); }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
});

// @desc    Set secret code (PIN)
// @route   PUT /api/auth/secret-code
// @access  Private
const setSecretCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) { res.status(404); throw new Error('User not found'); }
    if (!code || code.length < 4) { res.status(400); throw new Error('Secret code must be at least 4 characters'); }

    const salt = await bcrypt.genSalt(10);
    user.secretCode = await bcrypt.hash(code, salt);
    await user.save();

    res.json({ message: 'Secret code set successfully' });
});

// @desc    Verify secret code (PIN)
// @route   POST /api/auth/verify-secret-code
// @access  Private
const verifySecretCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) { res.status(404); throw new Error('User not found'); }
    if (!user.secretCode) { res.status(400); throw new Error('Secret code not set'); }

    const isMatch = await bcrypt.compare(code, user.secretCode);
    if (!isMatch) { res.status(401); throw new Error('Invalid secret code'); }

    res.json({ success: true, message: 'Secret code verified' });
});

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    getMe,
    updateProfile,
    changePassword,
    setSecretCode,
    verifySecretCode
};
