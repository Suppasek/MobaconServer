const npmRun = require('npm-run');
const express = require('express');

const authController = require('../controllers/authController');
const planController = require('../controllers/planController');
const userController = require('../controllers/userController');
const imageController = require('../controllers/imageController');
const requestController = require('../controllers/requestController');
const operatorController = require('../controllers/operatorController');
const reportHistoryController = require('../controllers/reportHistoryController');

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
router.patch('/mobile/user', userController.editUser);
router.patch('/mobile/user/password', authController.mobileChangePassword);

router.get('/mobile/request/review', requestController.getReviewByRequestId);
router.patch('/mobile/request/review/:requestId/like', requestController.likeReviewByRequestId);
router.patch('/mobile/request/review/:requestId/dislike', requestController.dislikeReviewByRequestId);

router.get('/mobile/report/history', reportHistoryController.getReportHistory);

// API ROUTING FOR USER VERIFICATION WITH EMAIL
router.get('/confirm', authController.getVerifyWithConfirmationTokenPage);

router.post('/web/verification', authController.sendVerificationEmail);
router.patch('/web/verification', authController.verifyWithConfirmationToken);
router.post('/web/changePassword', authController.sendChangePasswordEmail);
router.patch('/web/changePassword', authController.changePasswordwithChangePasswordToken);

// API ROUTING FOR USER VERIFICATION WITH OTP
router.post('/mobile/user/verification', authController.sendVerificationOTP);
router.patch('/mobile/user/verification', authController.verifyUserWithOTP);
router.post('/mobile/changePassword', authController.sendChangePasswordSms);
router.patch('/mobile/changePassword', authController.changePasswordwithChangePasswordCode);

// GET IMAGE FILE
router.get('/image/profile/default/:imageName', imageController.getDefaultProfileImage);
router.get('/web/operator/image/:imageName', imageController.getOperatorImage);
router.get('/web/user/image/:imageName', imageController.getUserImage);


// ROLLBACK DATABASE
router.get('/rollback', async (req, res) => {
  console.log('RUNNING ROLLBACK DATABASE');
  try {
    await npmRun.execSync('sequelize --options-path=src/config/sequelize-options.js db:migrate:undo:all');
    await npmRun.execSync('sequelize --options-path=src/config/sequelize-options.js db:migrate');
    await npmRun.execSync('sequelize --options-path=src/config/sequelize-options.js db:seed:all');

    res.send({
      message: 'rollback database successfully',
    });
    console.log('ROLLBACK DATABASE SUCCESSFULLY');
  } catch (err) {
    console.log('ROLLBACK FAILED', err);
    res.send('rollback database failed');
  }
});

module.exports = {
  Router: router,
};
