const Router = require('express').Router();
const authController = require('../controllers/authController');
const { mobileJwtAuthorizeMiddleware } = require('../controllers/services/passportService');

// API ROUTING FOR WEB APPLICATION
Router.post('/web/login', authController.webLogin);
Router.post('/web/logout', authController.webLogout);
Router.post('/web/operator', authController.createOperator);
Router.patch('/web/operator', authController.editOperator);
Router.patch('/web/operator/activation/:userId', authController.activateOperator);
Router.patch('/web/operator/password', authController.changePassword);

// API ROUTING FOR MOBILE APPLICATION
Router.post('/mobile/signup', authController.mobileSignup);
Router.get('/mobile/authorization', mobileJwtAuthorizeMiddleware, authController.mobileAuth);
Router.post('/mobile/login', authController.mobileLogin);
Router.post('/mobile/logout', authController.mobileLogout);
Router.patch('/mobile/user/password', authController.mobileChangePassword);

// API ROUTING FOR USER VERIFICATION WITH EMAIL
Router.post('/web/verification', authController.sendVerificationEmail);
Router.post('/web/changePassword', authController.sendChangePasswordEmail);
Router.patch('/web/verification', authController.verifyWithConfirmationToken);
Router.patch('/web/changePassword', authController.changePasswordwithChangePasswordToken);

// API ROUTING FOR USER VERIFICATION WITH OTP
Router.post('/mobile/user/verification', authController.sendVerificationOTP);
Router.post('/mobile/changePassword', authController.sendChangePasswordSms);
Router.patch('/mobile/user/verification', authController.verifyUserWithOTP);
Router.patch('/mobile/changePassword', authController.changePasswordwithChangePasswordCode);

module.exports = Router;
