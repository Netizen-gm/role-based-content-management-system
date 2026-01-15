const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL index - automatically delete after expiresAt
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
