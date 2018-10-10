const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const userController = require('./controllers/authController');

const app = express().use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true,
  }),
);

// routes
app.post('/mobacon/api/web/signup', userController.webSignup);
app.post('/mobacon/api/web/login', userController.webLogin);

app.post('/mobacon/api/mobile/signup', userController.mobileSignup);
app.post('/mobacon/api/mobile/login', userController.mobileLogin);

app.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

app.listen(config.port, () => {
  console.log(`start server at port ${config.port}`);
});
