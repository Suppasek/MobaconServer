const cors = require('cors');
const http = require('http');
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

chatSocket(httpServer);
