// const fs = require('fs');
const cors = require('cors');
// const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config/APIConfig');

// const router = express.Router();
const router = require('./routes/router').Router;

const app = express().use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: false,
  }),
  cors(),
  router,
);

// START HTTPS SECTION [DO NOT REMOVE]
// https.createServer({
//   key: fs.readFileSync('src/config/server.key'),
//   cert: fs.readFileSync('src/config/server.cert'),
// }, app).listen(port, () => {
//   console.log(`start server at ${baseUrl}:${port}`);
// });
// END HTTPS SECTION

app.listen(config.port, () => {
  console.log(`start server at port ${config.baseUrl}:${config.port}`);
});
