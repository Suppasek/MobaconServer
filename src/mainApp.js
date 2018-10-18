const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const config = require('./config/api-config');
const userController = require('./controllers/authController');

const app = express().use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true,
  }),
  cors(),
);

// web
app.post('/mobacon/api/web/signup', userController.webSignup);
app.post('/mobacon/api/web/login', userController.webLogin);

// mobile
app.post('/mobacon/api/mobile/signup', userController.mobileSignup);
app.post('/mobacon/api/mobile/login', userController.mobileLogin);

// test
const testController = require('./controllers/testController');

app.post('/mobacon/api/test', testController.test);

// not found
app.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

// https.createServer({
//   key: fs.readFileSync('src/config/server.key'),
//   cert: fs.readFileSync('src/config/server.cert'),
// }, app).listen(port, () => {
//   console.log(`start server at ${baseUrl}:${port}`);
// });

app.listen(config.port, () => {
  console.log(`start server at port ${config.baseUrl}:${config.port}`);
});
