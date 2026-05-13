const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
    },
    profileImage: {
        type: String,
        default: '',
    },
    secretCode: {
        type: String,
        default: '',
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
