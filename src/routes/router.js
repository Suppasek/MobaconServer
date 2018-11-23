const fs = require('fs');
const path = require('path');
const express = require('express');

const authController = require('../controllers/authController');
const operatorController = require('../controllers/operatorController');
const planController = require('../controllers/planController');

const router = express.Router();

// API ROUTING FOR WEB APPLICATION
router.post('/web/login', authController.webLogin);
router.post('/web/logout', authController.webLogout);

router.get('/web/operators', operatorController.getOperators);
router.get('/web/operator/:userId', operatorController.getOperatorById);
router.post('/web/operator', authController.createOperator);
router.patch('/web/operator', authController.editOperator);
router.patch('/web/operator/activation/:userId', authController.activateOperator);

router.get('/web/plans', planController.getPlans);
router.patch('/web/plan/:planId', planController.updatePlan);

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

// GET IMAGE FILE
// /mobacon/api/web/operator/image/default_profile.png
router.get('/web/operator/image/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, `../../assets/images/operators/${req.params.imageName}`);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({
      message: 'image not found',
    });
  }
});

// NOT FOUND [404]
router.all('*', (req, res) => {
  res.status(404).json({
    message: 'not found',
  });
});

module.exports = {
  Router: router,
};
