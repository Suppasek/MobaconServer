const cors = require('cors');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');

const config = require('../config/APIConfig');
const SocketModel = require('./models/sockets');
const mongoConfig = require('./config/MongoDBConfig');

const app = express().use(cors);
const server = http.Server(app);
const io = socketio(server);
mongoose.connect(mongoConfig.mongoUri, {
  useNewUrlParser: true,
});
const db = mongoose.connection;

console.clear();
db.once('open', () => console.log('connected mongodb'));

io.on('connection', (socket) => {
  // io.sockets.connected[socket.id].emit('chat message', socket.id);
  socket.emit('chat message', socket.id);
  console.log('[+] User connected');

  socket
    .on('disconnect', () => console.log('[-] User disconnected'))
    .on('chat message', async (params) => {
      io.emit('chat message', params.message);

      await SocketModel.create({
        userId: 1,
        roleId: 1,
      }, (err, doc) => {
        err ? console.log(err.message) : console.log(doc);
      });

      // socket.disconnect();
    });
});

server.listen(config.socketPort, () => {
  console.log(`Start web socket server at ${config.baseUrl}:${config.socketPort}`);
});
