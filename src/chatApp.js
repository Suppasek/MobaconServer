const socketio = require('socket.io');

module.exports = (server) => {
  console.log('chatApp work');
  const io = socketio(server);

  io.on('connection', (socket) => {
    // io.sockets.connected[socket.id].emit('chat message', socket.id);
    socket.emit('chat message', socket.id);
    console.log('[+] User connected');
    socket
      .on('disconnect', () => console.log('[-] User disconnected'))
      .on('chat message', (msg) => {
        console.log(`message: ${msg}`);
        io.emit('chat message', msg);
      });
  });
};
