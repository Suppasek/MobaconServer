const Sequelize = require('sequelize');

const multerService = require('./services/multerService');
const passportService = require('./services/passportService');

const op = Sequelize.Op;

// METHODS


// CONTROLLER METHODS
const editUser = (req, res) => {
  multerService.validateMobileUploadImage(req, res, async () => {
    passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
      try {
        const imagePathTemp = user.imagePath;
        const updatedUser = await user.update({
          fullName: req.body.fullName,
          imagePath: req.file ? `/mobacon/api/web/user/image/${req.file.filename}` : undefined,
        }, {
          where: {
            id: {
              [op.eq]: user.id,
            },
          },
        });

        res.status(200).json({
          info: {
            id: updatedUser.id,
            role: {
              id: updatedUser.role.id,
              name: updatedUser.role.name,
            },
            fullName: updatedUser.fullName,
            phoneNumber: updatedUser.phoneNumber,
            imagePath: updatedUser.imagePath,
          },
          token: newToken,
          message: 'update operator information successfully',
        });

        if (imagePathTemp) {
          const imagePath = imagePathTemp.split('/');
          const imageName = imagePath[imagePath.length - 1];
          multerService.removeUserImageByName(imageName);
        }
      } catch (err) {
        if (req.file) {
          multerService.removeImageByPath(req.file.path);
        }

        if (err.errors) {
          res.status(400).json({
            token: newToken,
            message: err.errors[0].message,
          });
        } else {
          res.status(500).json({
            token: newToken,
            message: 'Internal server error',
          });
        }
      }
    });
  });
};

module.exports = {
  editUser,
};
