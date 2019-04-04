/* eslint-disable no-console */
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const Router = require('./routes');
const mongodb = require('./mongoSchema');
const config = require('./config/APIConfig');
const xmlParser = require('./middlewares/xmlParser');
const socket = require('./controllers/services/socketService');
const accessLogStream = require('./logSystem/accessLogStream');

const app = express()
  .use(xmlParser)
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(morgan('combined', { stream: accessLogStream }))
  .use('/mobacon/api/', Router);

const httpServer = http.createServer(app).listen(config.httpPort, () => {
  mongodb.createClient();
  socket.chat(httpServer);
  console.clear();
  console.log(`START SERVER ON ${config.host}:${config.httpPort}`);
});
