const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  read: {
    user: {
      type: Boolean,
      default: true,
      required: true,
    },
    operator: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
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
    senderRoleId: {
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
