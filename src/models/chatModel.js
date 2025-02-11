const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userInput: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['chat'],
        default: 'chat'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
