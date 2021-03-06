const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  operatorId: {
    type: Number,
    required: true,
  },
  requestId: {
    type: Number,
    required: true,
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessages',
  },
  activated: {
    type: Boolean,
    default: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('ChatRooms', ChatRoomSchema);
