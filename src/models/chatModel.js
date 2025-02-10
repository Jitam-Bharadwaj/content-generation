const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    requestType: {
        type: String,
        enum: ['content', 'title', 'meta', 'keywords', 'all'],
        required: true
    },
    input: {
        type: String,
        required: true
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    metadata: {
        processTime: Number,
        tokensUsed: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
});

module.exports = mongoose.model('ChatsFinal', chatSchema);