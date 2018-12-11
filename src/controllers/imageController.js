const fs = require('fs');
const path = require('path');

const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

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

module.exports = {
  getOperatorImage,
};
