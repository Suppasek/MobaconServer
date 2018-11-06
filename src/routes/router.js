const express = require('express');

const authController = require('../controllers/authController');
const testController = require('../controllers/testController');

const router = express.Router();

// START WEB SECTION
router.post('/mobacon/api/web/signup', authController.webSignup);
router.post('/mobacon/api/web/login', authController.webLogin);
// END WEB SECTION

// START MOBILE SECTION
router.post('/mobacon/api/mobile/signup', authController.mobileSignup);
router.post('/mobacon/api/mobile/login', authController.mobileLogin);
// END MOBILE SECTION

// START TEST SECTION
router.post('/mobacon/api/test', testController.test);
// END TEST SECTION

// START VERIFICATION WITH EMAIL SECTION
router.get('/confirm', authController.verifyWithConfirmationToken);
// END VERIFICATION WITH EMAIL SECTION

// NOT FOUND [404]
router.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

module.exports = {
  Router: router,
};
