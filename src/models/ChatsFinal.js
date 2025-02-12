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
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    output: {
        type: String,
        required: true
    },
    keywords: {
        type: [{
            keyword: String,
            relevance: Number
        }],
        default: []
    },
    titles: {
        type: [String],
        default: []
    },
    meta: {
        description: String
    },
    content: {
        type: String,
        default: ''
    },
    metadata: {
        processTime: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
}, { versionKey: '__v' });

module.exports = mongoose.model('ChatsFinal', chatSchema);