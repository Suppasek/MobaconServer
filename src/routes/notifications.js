const Router = require('express').Router();
const subscriberController = require('../controllers/notificationController');

// API ROUTING FOR MOBILE APPLICATION
Router.post('/mobile/subscribe', subscriberController.subscribe);
Router.options('/mobile/subscribe', subscriberController.checkForSubscription);

module.exports = Router;
