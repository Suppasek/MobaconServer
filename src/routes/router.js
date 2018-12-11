const express = require('express');

const authController = require('../controllers/authController');
const planController = require('../controllers/planController');
const imageController = require('../controllers/imageController');
const requestController = require('../controllers/requestController');
const operatorController = require('../controllers/operatorController');

const router = express.Router();

// API ROUTING FOR WEB APPLICATION
router.post('/web/login', authController.webLogin);
router.post('/web/logout', authController.webLogout);

router.get('/web/operators', operatorController.getOperators);
router.get('/web/operator/:userId', operatorController.getOperatorById);
router.post('/web/operator', authController.createOperator);
router.patch('/web/operator', authController.editOperator);
router.patch('/web/operator/activation/:userId', authController.activateOperator);
router.patch('/web/operator/password', authController.changePassword);

router.get('/web/plans', planController.getPlans);
router.patch('/web/plan/:planId', planController.updatePlan);

router.get('/web/requests', requestController.getRequests);
router.get('/web/request/bills/:userId', requestController.getBillByUserId);
router.get('/web/request/review/:userId', requestController.getReviewByUserId);
router.get('/web/requests/accepted', requestController.getAcceptedRequests);
router.get('/web/request/:requestId', requestController.getRequestById);
router.patch('/web/request/:requestId/acceptance', requestController.requestAcceptance);
router.put('/web/request/:requestId/memo', requestController.putRequestMemoById);
router.post('/web/request/:requestId/review', requestController.createRequestReviewById);

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

// API ROUTING FOR USER VERIFICATION WITH OTP
router.post('/mobile/user/verification', authController.sendVerificationOTP);
router.patch('/mobile/user/:userId/verification', authController.verifyUserWithOTP);

// GET IMAGE FILE
router.get('/web/operator/image/:imageName', imageController.getOperatorImage);

module.exports = {
  Router: router,
};
