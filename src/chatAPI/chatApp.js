const cors = require('cors');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const config = require('../config/APIConfig');

const app = express().use(cors);
const server = http.Server(app);
const io = socketio(server);

io.on('connection', (socket) => {
  io.sockets.connected[socket.id].emit('chat message', socket.id);
  console.log('[+] User connected');
  socket
    .on('disconnect', () => console.log('[-] User disconnected'))
    .on('chat message', (msg) => {
      console.log(`message: ${msg}`);
      io.emit('chat message', msg);
    });
});

// http.Server(app).listen()
server.listen(config.socketPort, () => {
  console.log(`Start web socket server at ${config.baseUrl}:${config.socketPort}`);
});
