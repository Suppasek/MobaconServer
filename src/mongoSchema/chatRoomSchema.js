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
});

module.exports = mongoose.model('ChatRooms', ChatRoomSchema);