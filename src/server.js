/* eslint-disable no-console */
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const xmlParser = require('./middlewares/xmlParser');
const mongodb = require('./mongoSchema');
const config = require('./config/APIConfig');
const Router = require('./routes');
const socket = require('./controllers/services/socketService');

const app = express()
  .use(xmlParser)
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(morgan('combined'))
  .use('/mobacon/api/', Router);

const httpServer = http.createServer(app).listen(config.httpPort, () => {
  socket.chat(httpServer);
  mongodb.createClient();
  console.clear();
  console.log(`START SERVER ON ${config.host}:${config.httpPort}`);
});
