const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, getUsers, updateProfile, changePassword, setSecretCode, verifySecretCode } = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Multer config for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `profile_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, admin, getUsers);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/secret-code', protect, setSecretCode);
router.post('/verify-secret-code', protect, verifySecretCode);

module.exports = router;
