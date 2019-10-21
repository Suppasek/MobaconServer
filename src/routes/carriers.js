const Router = require('express').Router();
const carrierController = require('../controllers/carrierController');
const {
  mobileJwtAuthorizeMiddleware,
} = require('../controllers/services/passportService');

// API ROUTING FOR VALIDATE IN APP PURCHASE
Router.get(
  '/carriers',
  mobileJwtAuthorizeMiddleware,
  carrierController.fetchAll,
);

module.exports = Router;
