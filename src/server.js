const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');

const config = require('./config/APIConfig');
const mongoConfig = require('./config/MongoConfig');
const socket = require('./controllers/services/socketService');
const { Router } = require('./routes/router');

function xmlParser(req, res, next) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
    next();
  });
}

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(xmlParser)
  // .use(xmlparser())
  .use(morgan('combined'))
  .use('/mobacon/api/', Router);

mongoose.connect(mongoConfig.mongoUri, {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);

const httpServer = http.createServer(app).listen(config.httpPort, () => {
  console.clear();
  console.log(`START SERVER AT ${config.baseUrl}:${config.httpPort}`);
});

socket.chat(httpServer);
