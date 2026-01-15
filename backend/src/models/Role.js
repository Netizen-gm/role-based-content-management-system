const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [{
    type: String,
    enum: ['create', 'edit', 'delete', 'publish', 'view'],
  }],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Role', roleSchema);
