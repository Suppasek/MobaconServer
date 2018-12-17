const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment');

const constant = require('../config/APIConstant');
const otpHelper = require('../helpers/otpHelper');
const tokenHelper = require('../helpers/tokenHelper');
const emailHelper = require('../helpers/emailHelper');
const multerService = require('./services/multerService');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;
const {
  Roles,
  Operators,
  Users,
  Plans,
  ConfirmationTokens,
  ForgetPasswordTokens,
  ForgetPasswordCodes,
} = require('../models');

// METHODS


// WEB AUTHENTICATION
const webLogin = async (req, res) => {
  passport.authenticate('web-login', async (error, operator, info) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    } else if (!operator) {
      if (!info.status) {
        res.status(400).json({
          message: info.message,
        });
      } else {
        res.status(info.status).json({
          message: info.message,
        });
      }
    } else {
      res.status(200).json({
        info: operator,
        token: await tokenHelper.getOperatorToken(operator),
      });
    }
  })(req, res);
};
const webLogout = async (req, res) => {
  passport.authenticate('web-logout', async (error, token, info) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    } else if (token) {
      res.status(200).json(info);
    } else if (info.constructor.name === 'Error') {
      res.status(400).json({ message: 'No auth token' });
    } else {
      res.status(400).json(info);
    }
  })(req, res);
};
const changePassword = async (req, res) => {
  passportService.webJwtAuthorize(req, res, (operator, newToken) => {
    validationHelper.bodyValidator(req, res, ['oldPassword', 'newPassword'], async () => {
      try {
        const foundOperator = await Operators.findOne({
          where: {
            id: {
              [op.eq]: operator.id,
            },
          },
        });

        const validatePassword = await bcrypt.compare(req.body.oldPassword, foundOperator.password);

        if (!validatePassword) {
          res.status(403).json({
            token: newToken,
            message: 'old password is invalid',
          });
        } else {
          const newPassword = await bcrypt.hash(req.body.newPassword, bcrypt.genSaltSync(10));
          await foundOperator.update({
            password: newPassword,
          });

          res.status(200).json({
            token: newToken,
            message: 'change password successfully',
          });
        }
      } catch (err) {
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
const createOperator = async (req, res) => {
  multerService.validateWebUploadImage(req, res, async () => {
    passportService.webJwtAuthorize(req, res, (operator, newToken) => {
      validationHelper.bodyValidator(req, res, ['fullName', 'email', 'roleId'], async () => {
        validationHelper.operatorCreationValidator(req, res, operator, newToken, async () => {
          try {
            const newOperator = await Operators.create({
              roleId: req.body.roleId,
              fullName: req.body.fullName,
              phoneNumber: req.body.phoneNumber,
              email: req.body.email,
              imagePath: req.file ? `/mobacon/api/web/operator/image/${req.file.filename}` : undefined,
              verified: false,
              activated: true,
            });
            tokenHelper.storeConfirmationToken(newOperator.email, newOperator.id, operator.id, 48);

            res.status(201).json({
              token: newToken,
              message: 'Create new operator successfully',
            });
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
    });
  });
};
const editOperator = async (req, res) => {
  multerService.validateWebUploadImage(req, res, async () => {
    passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
      try {
        const imagePathTemp = operator.imagePath;
        const updatedOperator = await operator.update({
          fullName: req.body.fullName,
          phoneNumber: req.body.phoneNumber,
          imagePath: req.file ? `/mobacon/api/web/operator/image/${req.file.filename}` : undefined,
        }, {
          where: {
            id: {
              [op.eq]: operator.id,
            },
          },
        });

        res.status(200).json({
          info: {
            id: updatedOperator.id,
            role: {
              id: updatedOperator.role.id,
              name: updatedOperator.role.name,
            },
            fullName: updatedOperator.fullName,
            phoneNumber: updatedOperator.phoneNumber,
            email: updatedOperator.email,
            imagePath: updatedOperator.imagePath,
          },
          token: newToken,
          message: 'update operator information successfully',
        });

        if (imagePathTemp) {
          const imagePath = imagePathTemp.split('/');
          const imageName = imagePath[imagePath.length - 1];
          multerService.removeOperatorImageByName(imageName);
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
const activateOperator = async (req, res) => {
  passportService.webJwtAuthorize(req, res, (operator, newToken) => {
    validationHelper.administratorValidator(req, res, operator, newToken, async () => {
      try {
        const foundOperator = await Operators.findOne({
          where: {
            id: {
              [op.eq]: req.params.userId,
            },
          },
        });

        if (foundOperator.id === operator.id) {
          res.status(400).json({
            token: newToken,
            message: 'cannot activate or deactivate yourself',
          });
        } else if (foundOperator) {
          foundOperator.update({
            activated: !foundOperator.activated,
          }).then(() => {
            res.status(200).json({
              token: newToken,
              message: !foundOperator.activated ? 'deactivated operator successfully' : 'activated operator successfully',
            });
          });
        } else {
          res.status(404).json({
            token: newToken,
            message: 'user not found',
          });
        }
      } catch (err) {
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

// MOBILE AUTHENTICATION
const mobileSignup = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['fullName', 'phoneNumber', 'password'], async () => {
    try {
      const password = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(10));
      const createdUser = await Users.create({
        roleId: constant.ROLE.USER,
        planId: constant.PLAN.BASIC,
        phoneNumber: req.body.phoneNumber,
        fullName: req.body.fullName,
        password,
      });
      const user = await Users.findOne({
        attributes: ['id', 'phoneNumber', 'createdAt'],
        where: {
          id: {
            [op.eq]: createdUser.id,
          },
        },
        include: [{
          model: Roles,
          as: 'role',
          attributes: ['id', 'name'],
        }, {
          model: Plans,
          as: 'plan',
          attributes: ['id', 'name'],
        }],
      });
      await otpHelper.storeConfirmationCode(user.id);
      res.status(201).json({
        message: 'sign up successfully',
        data: user,
      });
    } catch (err) {
      if (err.errors) {
        res.status(400).json({
          message: err.errors[0].message,
        });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
};
const mobileLogin = async (req, res) => {
  passport.authenticate('mobile-login', async (error, user, info) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    } else if (!user) {
      if (!info.status) {
        res.status(400).json({
          message: info.message,
        });
      } else {
        res.status(info.status).json({
          message: info.message,
        });
      }
    } else {
      res.status(200).json({
        info: user,
        token: await tokenHelper.getUserToken(user),
      });
    }
  })(req, res);
};
const mobileLogout = async (req, res) => {
  passport.authenticate('mobile-logout', async (error, token, info) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    } else if (token) {
      res.status(200).json(info);
    } else if (info.constructor.name === 'Error') {
      res.status(400).json({ message: 'No auth token' });
    } else {
      res.status(400).json(info);
    }
  })(req, res);
};
const mobileChangePassword = async (req, res) => {
  passportService.mobileJwtAuthorize(req, res, (user, newToken) => {
    validationHelper.bodyValidator(req, res, ['oldPassword', 'newPassword'], async () => {
      try {
        const foundUser = await Users.findOne({
          where: {
            id: {
              [op.eq]: user.id,
            },
          },
        });

        const validatePassword = await bcrypt.compare(req.body.oldPassword, foundUser.password);

        if (!validatePassword) {
          res.status(403).json({
            token: newToken,
            message: 'old password is invalid',
          });
        } else {
          const newPassword = await bcrypt.hash(req.body.newPassword, bcrypt.genSaltSync(10));
          await foundUser.update({
            password: newPassword,
          });

          res.status(200).json({
            token: newToken,
            message: 'change password successfully',
          });
        }
      } catch (err) {
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

// USER VERIFICATION WITH EMAIL
const getVerifyWithConfirmationTokenPage = async (req, res) => {
  res.sendFile(path.join(__dirname, './templates/confirmationPage.html'));
};
const sendVerificationEmail = async (req, res) => {
  passportService.webJwtAuthorize(req, res, (operator) => {
    validationHelper.bodyValidator(req, res, ['userId'], async (body) => {
      const foundOperator = await Operators.findOne({
        where: {
          id: {
            [op.eq]: body.userId,
          },
        },
      });

      if (!foundOperator) {
        res.status(404).json({
          message: 'User not found',
        });
      } else if (foundOperator.verified) {
        res.status(400).json({
          message: 'User has verified',
        });
      } else {
        tokenHelper.storeConfirmationTokenByOperator(foundOperator.email, foundOperator.id, operator.id, 48);
        res.status(200).json({
          message: 'Send account verification email successfully',
        });
      }
    });
  });
};
const verifyWithConfirmationToken = (req, res) => {
  validationHelper.bodyValidator(req, res, ['newPassword', 'confirmToken'], async () => {
    try {
      const confirmationToken = await ConfirmationTokens.findOne({
        where: {
          token: {
            [op.eq]: req.body.confirmToken,
          },
        },
      });

      if (!confirmationToken) {
        res.status(400).json({
          message: 'Token is invalid',
        });
      } else if (confirmationToken.expired > moment.utc()) {
        bcrypt.hash(req.body.newPassword, bcrypt.genSaltSync(10)).then(async (hashed) => {
          const result = await Operators.update({
            password: hashed,
            verified: true,
          }, {
            where: {
              id: {
                [op.eq]: confirmationToken.userId,
              },
            },
          });
          if (!result) {
            res.status(500).json({ message: 'Internal server error' });
          } else {
            confirmationToken.update({
              expired: moment.utc(),
            });
            res.status(200).json({
              message: 'Verify account successfully',
            });
          }
        });
      } else {
        res.status(400).json({
          message: 'Token has expired',
        });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};
const sendChangePasswordEmail = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['email'], async (body) => {
    try {
      const operator = await Operators.findOne({
        where: {
          email: {
            [op.eq]: body.email,
          },
        },
      });

      if (!operator) {
        res.status(404).json({
          message: 'User not found',
        });
      } else if (!operator.verified) {
        res.status(403).json({
          message: 'User has not verified',
        });
      } else {
        const forgetPasswordToken = await tokenHelper.storeForgetPasswordToken(operator, 48);
        if (!forgetPasswordToken) {
          res.status(500).json({ message: 'Internal server error' });
        } else {
          emailHelper.sendChangePasswordMail(operator.email, forgetPasswordToken.token);
          res.status(200).json({
            message: 'Send email for change password successfully',
          });
        }
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};
const changePasswordwithChangePasswordToken = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['newPassword', 'changePasswordToken'], async () => {
    try {
      const forgetPasswordToken = await ForgetPasswordTokens.findOne({
        where: {
          token: {
            [op.eq]: req.body.changePasswordToken,
          },
        },
      });

      if (!forgetPasswordToken) {
        res.status(400).json({
          message: 'Token is invalid',
        });
      } else if (forgetPasswordToken.expired > moment.utc()) {
        bcrypt.hash(req.body.newPassword, bcrypt.genSaltSync(10)).then(async (hashed) => {
          const result = await Operators.update({
            password: hashed,
          }, {
            where: {
              id: {
                [op.eq]: forgetPasswordToken.createdBy,
              },
            },
          });
          if (!result) {
            res.status(500).json({ message: 'Internal server error' });
          } else {
            forgetPasswordToken.update({
              expired: moment.utc(),
            });
            res.status(200).json({
              message: 'Change password successfully',
            });
          }
        });
      } else {
        res.status(400).json({
          message: 'Token has expired',
        });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

// USER VERIFICATION WITH OTP
const sendVerificationOTP = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['phoneNumber'], async () => {
    try {
      const user = await Users.findOne({
        where: {
          phoneNumber: {
            [op.eq]: req.body.phoneNumber,
          },
        },
      });

      if (!user) {
        res.status(404).json({
          message: 'user not found',
        });
      } else if (user.verified) {
        res.status(400).json({
          message: 'user has verified',
        });
      } else {
        await otpHelper.storeConfirmationCode(user.id);
        res.status(200).json({
          message: 'send otp successfully',
        });
      }
    } catch (err) {
      if (err.errors) {
        res.status(400).json({
          message: err.errors[0].message,
        });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
};
const verifyUserWithOTP = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['phoneNumber', 'otp'], async () => {
    try {
      const user = await Users.findOne({
        where: {
          phoneNumber: {
            [op.eq]: req.body.phoneNumber,
          },
        },
      });

      if (!user) {
        res.status(404).json({
          message: 'user not found',
        });
      } else {
        const result = await otpHelper.verifyOtp(req.body.otp, user.id);

        if (!result.ok) {
          res.status(400).json({
            message: result.message,
          });
        } else {
          res.status(200).json({
            message: result.message,
          });
        }
      }
    } catch (err) {
      if (err.errors) {
        res.status(400).json({
          message: err.errors[0].message,
        });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
};
const sendChangePasswordSms = (req, res) => {
  validationHelper.bodyValidator(req, res, ['phoneNumber'], async () => {
    try {
      const user = await Users.findOne({
        where: {
          phoneNumber: {
            [op.eq]: req.body.phoneNumber,
          },
        },
      });

      if (!user) {
        res.status(404).json({
          message: 'user not found',
        });
      } else {
        otpHelper.storeForgetPasswordCode(user.id);
        res.status(200).json({
          message: 'you can change password on website with link in sms',
        });
      }
    } catch (err) {
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  });
};
const changePasswordwithChangePasswordCode = (req, res) => {
  validationHelper.bodyValidator(req, res, ['changePasswordCode', 'newPassword'], async () => {
    try {
      const foundCode = await ForgetPasswordCodes.findOne({
        where: {
          code: {
            [op.eq]: req.body.changePasswordCode,
          },
        },
      });

      if (!foundCode) {
        res.status(403).json({
          message: 'invalid changePasswordCode',
        });
      } else if (foundCode.expired < moment.utc()) {
        res.status(403).json({
          message: 'changePasswordCode has expired',
        });
      } else {
        const newPassword = await bcrypt.hash(req.body.newPassword, bcrypt.genSaltSync(10));

        await Users.update({
          password: newPassword,
        }, {
          where: {
            id: {
              [op.eq]: foundCode.createdBy,
            },
          },
        });
        await foundCode.update({
          expired: moment.utc(),
        });
        res.status(200).json({
          message: 'change password successfully',
        });
      }
    } catch (err) {
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  });
};

module.exports = {
  webLogin,
  webLogout,
  changePassword,
  createOperator,
  editOperator,
  activateOperator,

  mobileSignup,
  mobileLogin,
  mobileLogout,
  mobileChangePassword,

  getVerifyWithConfirmationTokenPage, // TEMPORARILY USED
  sendVerificationEmail,
  verifyWithConfirmationToken,
  sendChangePasswordEmail,
  changePasswordwithChangePasswordToken,

  sendVerificationOTP,
  verifyUserWithOTP,
  sendChangePasswordSms,
  changePasswordwithChangePasswordCode,
};
