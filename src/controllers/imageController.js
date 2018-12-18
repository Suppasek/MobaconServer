const fs = require('fs');
const path = require('path');

const constant = require('../config/APIConstant');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const getDefaultProfileImage = (req, res) => {
  const imagePath = path.join(__dirname, `../../assets/images/default/${req.params.imageName}`);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({
      message: 'image not found',
    });
  }
};
const getOperatorImage = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      const imagePath = path.join(__dirname, `../../assets/images/operators/${req.params.imageName}`);

      if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
      } else {
        res.status(404).json({
          message: 'image not found',
        });
      }
    });
  });
};
const getUserImage = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (user) => {
    const imagePath = path.join(__dirname, `../../assets/images/users/${req.params.imageName}`);
    if (user.role.id === constant.ROLE.ADMINISTRATOR || user.role.id === constant.ROLE.OPERATOR) {
      if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
      } else {
        res.status(404).json({
          message: 'image not found',
        });
      }
    } else {
      const userFileNames = user.imagePath.split('/');
      const userFileName = userFileNames[userFileNames.length - 1];
      if (userFileName === req.params.imageName) {
        if (fs.existsSync(imagePath)) {
          res.sendFile(imagePath);
        } else {
          res.status(404).json({
            message: 'image not found',
          });
        }
      } else {
        res.status(403).json({
          message: 'forbidden for image',
        });
      }
    }
  });
};

module.exports = {
  getDefaultProfileImage,
  getOperatorImage,
  getUserImage,
};
