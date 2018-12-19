module.exports = {
  baseUrl: 'localhost',
  httpPort: 8800,
  httpsPort: 8443,
  socketPort: 8888,
  analyticUrl: 'http://localhost:3000',
  image: {
    default: 'default_profile.png',
  },
  fileUpload: {
    mimetype: ['image/png', 'image/jpeg'],
  },
  web: {
    protocol: 'http',
    host: 'mobacon-web.pieros.site',
    port: 80,
  },
  chat: {
    loadOldChat: 10,
  },
};
