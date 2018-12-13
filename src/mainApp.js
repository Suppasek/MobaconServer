const fs = require('fs');
const cors = require('cors');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');

const chatSocket = require('./chatApp');
const config = require('./config/APIConfig');
const router = require('./routes/router').Router;

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use('/mobacon/api/', router)
  .use(timeout(12000000));

// CREATE SERVER WITH HTTP
const httpServer = http.createServer(app).listen(config.httpPort, () => {
  console.clear();
  console.log(`Start http server at\t ${config.baseUrl}:${config.httpPort}`);
});

// CREATE SERVER WITH HTTPS
const httpsServer = https.createServer({
  key: fs.readFileSync('src/config/server.key'),
  cert: fs.readFileSync('src/config/server.cert'),
}, app).listen(config.httpsPort, () => {
  console.log(`Start https server at\t ${config.baseUrl}:${config.httpsPort}`);
});

chatSocket(httpServer);

module.exports = {
  HttpServer: httpServer,
  HttpsServer: httpsServer,
};
