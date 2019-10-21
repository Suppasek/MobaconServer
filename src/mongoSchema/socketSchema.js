const mongoose = require('mongoose');

const SocketSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  roleId: {
    type: Number,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Sockets', SocketSchema);
