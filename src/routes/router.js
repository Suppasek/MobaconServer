const express = require('express');

const authController = require('../controllers/authController');
const testController = require('../controllers/testController');

const router = express.Router();

// API ROUTING FOR WEB APPLICATION
router.post('/mobacon/api/web/signup', authController.webSignup);
router.post('/mobacon/api/web/login', authController.webLogin);
router.post('/mobacon/api/web/logout', authController.webLogout);

// API ROUTING FOR MOBILE APPLICATION
router.post('/mobacon/api/mobile/signup', authController.mobileSignup);
router.post('/mobacon/api/mobile/login', authController.mobileLogin);
router.post('/mobacon/api/mobile/logout', authController.mobileLogout);

// API ROUTING FOR TEST
router.post('/mobacon/api/test', testController.test);

// API ROUTING FOR USER VERIFICATION WITH EMAIL
router.get('/confirm', authController.verifyWithConfirmationToken);

// NOT FOUND [404]
router.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

module.exports = {
  Router: router,
};
