const express = require('express');
const bodyParser = require('body-parser');
// const config = require('./config/config');
const userController = require('./controllers/authController');

const app = express().use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true,
  }),
);

const port = 8800;

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

app.listen(port, () => {
  console.log(`start server at port ${port}`);
});
