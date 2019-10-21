const Router = require('express').Router();
const iapController = require('../controllers/iapController');
const {
  mobileJwtAuthorizeMiddleware,
} = require('../controllers/services/passportService');

// API ROUTING FOR VALIDATE IN APP PURCHASE
Router.patch(
  '/mobile/subscription/:planId',
  mobileJwtAuthorizeMiddleware,
  iapController.buySubscription,
);

module.exports = Router;
