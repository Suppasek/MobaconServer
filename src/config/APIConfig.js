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
    loadOldChat: 15,
  },
  jwt: {
    web: {
      time: 12,
      unit: 'hours',
    },
    mobile: {
      time: 12,
      unit: 'hours',
    },
  },
  token: {
    verification: {
      web: {
        time: 12,
        unit: 'hours',
      },
      mobile: {
        time: 1,
        unit: 'minutes',
      },
    },
    changePassword: {
      web: {
        time: 12,
        unit: 'hours',
      },
      mobile: {
        time: 1,
        unit: 'hours',
      },
    },
  },
  notification: {
    acceptance: {
      type: 'Acceptance',
      title: 'Request is accepted.',
      body: 'Your request is accepted now.',
    },
    review: {
      type: 'Review',
      title: 'Request is reviewed.',
      body: 'Your request is reviewed now.',
    },
  },
};
