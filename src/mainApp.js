const fs = require('fs');
const http = require('http');
const cors = require('cors');
const https = require('https');
const express = require('express');
// const socketio = require('socket.io');
const bodyParser = require('body-parser');

const config = require('./config/APIConfig');
const router = require('./routes/router').Router;

const app = express().use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: false,
  }),
  cors(),
  router,
);

// CREATE SERVER WITH HTTP
http.createServer(app).listen(config.httpPort, () => {
  console.log(`Start http server at\t ${config.baseUrl}:${config.httpPort}`);
});

// CREATE SERVER WITH HTTPS
https.createServer({
  key: fs.readFileSync('src/config/server.key'),
  cert: fs.readFileSync('src/config/server.cert'),
}, app).listen(config.httpsPort, () => {
  console.log(`Start https server at\t ${config.baseUrl}:${config.httpsPort}`);
});

// const io = socketio(server);

// io.on('connection', (socket) => {
//   // io.sockets.connected[socket.id].emit('chat message', socket.id);
//   socket.emit('chat message', socket.id);
//   console.log('[+] User connected');
//   socket
//     .on('disconnect', () => console.log('[-] User disconnected'))
//     .on('chat message', (msg) => {
//       console.log(`message: ${msg}`);
//       io.emit('chat message', msg);
//     });
// });
