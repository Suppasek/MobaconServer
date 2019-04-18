const path = require('path');
const rfs = require('rotating-file-stream');
const logSystemConfig = require('../config/logSystemConfig');

const accessLogStream = rfs('access.log', {
  interval: logSystemConfig.interval,
  path: path.join(__dirname, `../../${logSystemConfig.path}`), // path.join(__dirname, '../../logs/'),
  compress: logSystemConfig.compress,
});

module.exports = accessLogStream;
