const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  data: [{
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    operatorId: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  }],
});

module.exports = mongoose.model('ChatMessages', ChatMessageSchema);
