const express = require('express');

const authController = require('../controllers/authController');
// const staffController = require('../controllers/staffController');

const router = express.Router();

// API ROUTING FOR WEB APPLICATION
router.post('/web/login', authController.webLogin);
router.post('/web/logout', authController.webLogout);

router.get('/web/operators');
router.get('/web/operator/:id');
router.post('/web/operator', authController.createStaff);
router.patch('/web/operator/password', authController.changePassword);
router.patch('/web/operator/activation', authController.activateStaff);
router.delete('/web/operator');

router.get('/web/requests');
router.get('/web/request/:id');
router.post('/web/request');
router.patch('/web/request');
router.delete('/web/request');

// API ROUTING FOR MOBILE APPLICATION
router.post('/mobile/signup', authController.mobileSignup);
router.post('/mobile/login', authController.mobileLogin);
router.post('/mobile/logout', authController.mobileLogout);

// API ROUTING FOR USER VERIFICATION WITH EMAIL
router.get('/confirm', authController.getVerifyWithConfirmationTokenPage);

router.post('/web/verification', authController.sendVerificationEmail);
router.patch('/web/verification', authController.verifyWithConfirmationToken);
router.post('/web/changePassword', authController.sendChangePasswordEmail);
router.patch('/web/changePassword', authController.changePasswordwithChangePasswordToken);

// NOT FOUND [404]
router.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

module.exports = {
  Router: router,
};
