const Router = require('express').Router();

Router.use(require('./authentications'));
Router.use(require('./chats'));
Router.use(require('./dashboards'));
Router.use(require('./images'));
Router.use(require('./operators'));
Router.use(require('./plans'));
Router.use(require('./reportHistories'));
Router.use(require('./requests'));
Router.use(require('./users'));

// API ROUTING FOR VALIDATE IN APP PURCHASE
Router.patch('/mobile/iap/apple');
Router.patch('/mobile/iap/google');

module.exports = Router;
