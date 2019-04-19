const Router = require('express').Router();

// API ROUTING FOR VALIDATE IN APP PURCHASE
Router.patch('/mobile/iap/apple');
Router.patch('/mobile/iap/google');

module.exports = Router;
