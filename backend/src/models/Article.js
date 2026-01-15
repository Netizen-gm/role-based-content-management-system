const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
  },
  image: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['published', 'unpublished'],
    default: 'unpublished',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', articleSchema);
