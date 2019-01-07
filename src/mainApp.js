const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const config = require('./config/APIConfig');
const mongoConfig = require('./config/MongoConfig');
const socket = require('./controllers/services/socketService');
const router = require('./routes/router').Router;

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(morgan())
  .use('/mobacon/api/', router);

mongoose.connect(mongoConfig.mongoUri, {
  useNewUrlParser: true,
});
mongoose.set('useFindAndModify', false);

// CREATE SERVER WITH HTTP
const httpServer = http.createServer(app).listen(config.httpPort, () => {
  console.clear();
  console.log(`Start http server at\t ${config.baseUrl}:${config.httpPort}`);
});

socket.chat(httpServer);
