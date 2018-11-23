// const fs = require('fs');
const path = require('path');
// const uniqid = require('uniqid');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const config = require('../config/APIConfig');
// const constant = require('../config/APIConstant');
const tokenHelper = require('../helpers/tokenHelper');
const emailHelper = require('../helpers/emailHelper');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');
const multerService = require('./services/multerService');

const op = Sequelize.Op;
const {
  Operators,
  Users,
  ConfirmationTokens,
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
        token: await tokenHelper.getToken(operator),
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
const createOperator = async (req, res) => {
  multerService.validateUploadImage(req, res, async () => {
    passportService.checkJwtFailures(req, res, (operator, newToken) => {
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
            tokenHelper.storeConfirmationToken(newOperator.email, newOperator.id, 48);

            res.status(201).json({
              token: newToken,
              message: 'Create new operator successfully',
            });
          } catch (err) {
            if (req.file) {
              multerService.removeOperatorImageByPath(req.file.path);
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
  multerService.validateUploadImage(req, res, async () => {
    passportService.checkJwtFailures(req, res, async (operator, newToken) => {
      try {
        const imagePathTemp = operator.imagePath;
        const newPassword = req.body.password ? await bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)) : undefined;
        const updatedOperator = await operator.update({
          fullName: req.body.fullName,
          phoneNumber: req.body.phoneNumber,
          password: newPassword,
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
          multerService.removeOperatorImageByPath(req.file.path);
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
  passportService.checkJwtFailures(req, res, (operator, newToken) => {
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
  try {
    const data = {
      roleId: 2,
      phoneNumber: req.body.phoneNumber,
      carrier: req.body.carrier,
      password: req.body.password,
    };
    const createdUser = await Users.create(data);
    bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then((hashed) => {
      createdUser.update({
        password: hashed,
      });
    });
    const resData = {
      phoneNumber: createdUser.phoneNumber,
      carrier: createdUser.carrier,
    };
    res.status(201).json({
      message: 'created',
      data: resData,
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
};
const mobileLogin = async (req, res) => {
  passport.authenticate('mobile-login', async (error, user, info) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
    } else if (!user) {
      res.status(info.status).json({
        message: info.message,
      });
    } else {
      res.status(200).json({
        token: await tokenHelper.getToken(user),
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

// USER VERIFICATION WITH EMAIL
const getVerifyWithConfirmationTokenPage = async (req, res) => {
  res.sendFile(path.join(__dirname, './templates/confirmationPage.html'));
};
const sendVerificationEmail = async (req, res) => {
  passportService.checkJwtFailures(req, res, (operator) => {
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
  validationHelper.bodyValidator(req, res, ['password'], () => {
    validationHelper.queryValidator(req, res, ['confirmation_token'], async () => {
      try {
        const confirmationToken = await ConfirmationTokens.findOne({
          where: {
            token: {
              [op.eq]: req.query.confirmation_token,
            },
          },
        });

        if (!confirmationToken) {
          res.status(400).json({
            message: 'Token is invalid',
          });
        } else if (confirmationToken.expired > moment().tz(config.timezone)) {
          bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then(async (hashed) => {
            const result = await Operators.update({
              password: hashed,
              verified: true,
            }, {
              where: {
                id: {
                  [op.eq]: confirmationToken.createdBy,
                },
              },
            });
            if (!result) {
              res.status(500).json({ message: 'Internal server error' });
            } else {
              confirmationToken.update({
                expired: moment().tz(config.timezone),
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
  validationHelper.bodyValidator(req, res, ['password'], () => {
    validationHelper.queryValidator(req, res, ['change_password_token'], async () => {
      try {
        const confirmationToken = await ConfirmationTokens.findOne({
          where: {
            token: {
              [op.eq]: req.query.change_password_token,
            },
          },
        });

        if (!confirmationToken) {
          res.status(400).json({
            message: 'Token is invalid',
          });
        } else if (confirmationToken.expired > moment().tz(config.timezone)) {
          bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then(async (hashed) => {
            const result = await Operators.update({
              password: hashed,
              verified: true,
            }, {
              where: {
                id: {
                  [op.eq]: confirmationToken.createdBy,
                },
              },
            });
            if (!result) {
              res.status(500).json({ message: 'Internal server error' });
            } else {
              confirmationToken.update({
                expired: moment().tz(config.timezone),
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
  });
};

module.exports = {
  webLogin,
  webLogout,
  createOperator,
  editOperator,
  activateOperator,

  mobileSignup,
  mobileLogin,
  mobileLogout,

  getVerifyWithConfirmationTokenPage, // TEMPORARILY USED
  sendVerificationEmail,
  verifyWithConfirmationToken,
  sendChangePasswordEmail,
  changePasswordwithChangePasswordToken,
};
