const fs = require('fs');
const path = require('path');
const multer = require('multer');

const apiConfig = require('../../config/APIConfig');
const validationHelper = require('../../helpers/validationHelper');

const webUpload = multer({
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
const mobileUpload = multer({
  fileFilter: (req, file, next) => {
    if (validationHelper.fileExtensionValidator(apiConfig.fileUpload.mimetype, file.mimetype)) {
      next(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    } else {
      next({}, false);
    }
  },
  storage: multer.diskStorage({
    destination: (req, res, next) => {
      next(null, path.join(__dirname, '../../../assets/images/users'));
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split('/')[1];
      next(null, `${Date.now()}.${extension}`);
    },
  }),
}).single('image');

const validateWebUploadImage = (req, res, next) => {
  webUpload(req, res, (error) => {
    if (error) {
      res.status(400).json({
        message: 'File extension is invalid',
      });
    } else {
      next(req.file);
    }
  });
};
const removeImageByPath = (imagePath) => {
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

const validateMobileUploadImage = (req, res, next) => {
  mobileUpload(req, res, (error) => {
    if (error) {
      res.status(400).json({
        message: 'File extension is invalid',
      });
    } else {
      next(req.file);
    }
  });
};
const removeUserImageByName = (fileName) => {
  const imagePath = path.join(__dirname, `../../../assets/images/users/${fileName}`);
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, () => {});
  }
};

module.exports = {
  validateWebUploadImage,
  removeOperatorImageByName,

  validateMobileUploadImage,
  removeUserImageByName,

  removeImageByPath,
};
