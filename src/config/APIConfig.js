module.exports = {
  baseUrl: 'localhost',
  httpPort: 8800,
  httpsPort: 8443,
  socketPort: 8888,
  secret: 'masa_secret',
  timezone: 'Asia/Bangkok',
  fileUpload: {
    mimetype: ['image/png', 'image/jpeg'],
  },
  web: {
    protocol: 'http',
    host: 'mobacon-web.pieros.site',
    port: 80,
  },
};
