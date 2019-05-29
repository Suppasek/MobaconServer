const Router = require('express').Router();

Router.use(require('./authentications'));
Router.use(require('./chats'));
Router.use(require('./dashboards'));
Router.use(require('./iaps'));
Router.use(require('./images'));
Router.use(require('./notifications'));
Router.use(require('./operators'));
Router.use(require('./plans'));
Router.use(require('./reportHistories'));
Router.use(require('./requests'));
Router.use(require('./users'));
Router.use(require('./carriers'));

module.exports = Router;
