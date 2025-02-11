const mongoose = require('mongoose');

const blogContentSchema = new mongoose.Schema({
    markdown: String,
    json: Object,
    html: String
});

const chatSchema = new mongoose.Schema({
    userInput: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    blogContent: blogContentSchema,
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
