const Chat = require('../models/chat.model');
const asyncHandler = require('express-async-handler');

// @desc    Get chat history between two users
// @route   GET /api/chats/:receiverId
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const chats = await Chat.find({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    }).sort({ createdAt: 1 });

    res.status(200).json(chats);
});

// @desc    Save a new message
// @route   POST /api/chats
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message, room } = req.body;
    const senderId = req.user._id;

    const newChat = await Chat.create({
        sender: senderId,
        receiver: receiverId,
        message,
        room
    });

    res.status(201).json(newChat);
});

module.exports = {
    getChatHistory,
    sendMessage
};
