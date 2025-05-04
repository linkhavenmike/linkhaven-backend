const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['web', 'sms', 'email'],
    required: true,
  },
  category: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true }); // ✅ this enables createdAt + updatedAt

const Link = mongoose.model('Link', LinkSchema);
module.exports = Link;
