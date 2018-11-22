const fs = require('fs');
const path = require('path');
const multer = require('multer');

const apiConfig = require('../../config/APIConfig');
const validationHelper = require('../../helpers/validationHelper');

const upload = multer({
  fileFilter: (req, file, next) => {
    if (validationHelper.fileExtensionValidator(apiConfig.fileUpload.mimetype, file.mimetype)) {
      next(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    } else {
      next({}, false);
    }
  },
  storage: multer.diskStorage({
    destination: (req, res, next) => {
      next(null, path.join(__dirname, '../../../assets/images/operators'));
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split('/')[1];
      next(null, `${Date.now()}.${extension}`);
    },
  }),
}).single('image');

const validateUploadImage = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      res.status(400).json({
        message: 'File extension is invalid',
      });
    } else {
      next(req.file);
    }
  });
};
const removeOperatorImageByPath = (imagePath) => {
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, () => {});
  }
};
const removeOperatorImageByName = (fileName) => {
  const imagePath = path.join(__dirname, `../../../assets/images/operators/${fileName}`);
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, () => {});
  }
};

module.exports = {
  validateUploadImage,
  removeOperatorImageByPath,
  removeOperatorImageByName,
};
