/* eslint-disable no-console */
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config/APIConfig');
const Router = require('./routes/router');
const xmlParser = require('./middlewares/xmlParser');
const socket = require('./controllers/services/socketService');

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(xmlParser)
  .use(morgan('combined'))
  .use('/mobacon/api/', Router);

const httpServer = http.createServer(app).listen(config.httpPort, () => {
  socket.chat(httpServer);
  console.clear();
  console.log(`START SERVER ON ${config.host}:${config.httpPort}`);
});
