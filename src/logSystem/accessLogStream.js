const path = require('path');
const rfs = require('rotating-file-stream');

const accessLogStream = rfs('access.log', {
  interval: '3M',
  path: path.join(__dirname, '../../logs/'),
  compress: 'gzip',
});

module.exports = accessLogStream;
