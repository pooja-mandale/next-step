const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:receiverId', protect, getChatHistory);
router.post('/', protect, sendMessage);

module.exports = router;
