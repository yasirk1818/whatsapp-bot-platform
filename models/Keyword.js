const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keyword: { type: String, required: true },
    reply: { type: String, required: true },
}, { timestamps: true });

// Ensure a user can't have the same keyword twice
KeywordSchema.index({ userId: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model('Keyword', KeywordSchema);
