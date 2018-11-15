const path = require('path');
const uniqid = require('uniqid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const models = require('../models');
const config = require('../config/APIConfig');
const constant = require('../config/APIConstant');
const emailHelper = require('../helpers/emailHelper');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS
const storeStaffToken = (token, expired, createdBy) => {
  models.StaffTokens.create({
    token,
    expired,
    createdBy,
  });
};
const storeUserToken = (token, expired, createdBy) => {
  models.UserTokens.create({
    token,
    expired,
    createdBy,
  });
};
const getToken = async (user, time = 12) => {
  const expired = Math.floor(moment().tz(config.timezone).add(time, 'hours'));
  const token = await jwt.sign({
    data: user,
    exp: expired,
  }, config.secret);
  if (user.roleId === constant.STAFF) storeStaffToken(token, expired, user.id);
  else if (user.roleId === constant.USER) storeUserToken(token, expired, user.id);
  return token;
};
const storeConfirmationToken = async (email, userId, time = 12) => {
  const token = await uniqid(await uniqid.time());
  await models.ConfirmationTokens.create({
    userId,
    token,
    expired: moment().tz(config.timezone).add(time, 'hours'),
    createdBy: userId,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeConfirmationTokenByStaff = async (email, userId, createdBy, time = 12) => {
  const token = await uniqid(await uniqid.time());
  await models.ConfirmationTokens.create({
    userId,
    token,
    expired: moment().tz(config.timezone).add(time, 'hours'),
    createdBy,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeForgetPasswordToken = async (staff, expiredIn = 12) => {
  try {
    const forgetPasswordToken = await models.ForgetPasswordTokens.create({
      token: await uniqid(await uniqid.time()),
      expired: moment().tz(config.timezone).add(expiredIn, 'hours'),
      createdBy: staff.id,
    });
    return forgetPasswordToken;
  } catch (err) {
    return false;
  }
};

// WEB AUTHENTICATION
const webLogin = async (req, res) => {
  passport.authenticate('web-login', async (error, staff, info) => {
    if (error) {
      res.status(500).send('Internal server error');
    } else if (!staff) {
      if (!info.statusCode) {
        res.status(400).json({
          message: info.message,
        });
      } else {
        res.status(info.statusCode).json({
          message: info.message,
        });
      }
    } else {
      res.status(200).json({
        token: await getToken(staff),
      });
    }
  })(req, res);
};
const webLogout = async (req, res) => {
  passport.authenticate('web-logout', async (error, token, info) => {
    if (error) {
      res.status(500).send('Internal server error');
    } else if (token) {
      res.status(200).json(info);
    } else if (info.constructor.name === 'Error') {
      res.status(400).json({ message: 'No auth token' });
    } else {
      res.status(400).json(info);
    }
  })(req, res);
};
const createStaff = async (req, res) => {
  passportService.checkJwtFailures(req, res, () => {
    validationHelper.bodyValidator(req, res, ['fullName', 'email'], async (body) => {
      try {
        const newStaff = await models.Staffs.create({
          fullName: body.fullName,
          phoneNumber: body.phoneNumber,
          email: body.email,
          verified: false,
          activated: true,
        });
        storeConfirmationToken(newStaff.email, newStaff.id, 48);
        res.status(201).json({
          message: 'Create new staff successfully',
        });
      } catch (err) {
        if (err.errors) {
          res.status(400).json({
            message: err.errors[0].message,
          });
        } else {
          res.status(500).send('Internal server error');
        }
      }
    });
  });
};
const changePassword = async (req, res) => {
  passportService.checkJwtFailures(req, res, (staff) => {
    validationHelper.bodyValidator(req, res, ['password'], async (body) => {
      try {
        bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then(async (hashed) => {
          const result = await models.Staffs.update({
            password: hashed,
          }, {
            where: {
              id: {
                [op.eq]: staff.id,
              },
            },
          });

          if (result) {
            res.status(200).json({
              message: 'Change password successfully',
            });
          } else {
            res.status(500).send('Internal server error');
          }
        });
      } catch (err) {
        res.status(500).send('Internal server error');
      }
    });
  });
};
const activateStaff = async (req, res) => {
  console.log(req.body);
  passportService.checkJwtFailures(req, res, () => {
    validationHelper.bodyValidator(req, res, ['userId', 'activate'], async (body) => {
      try {
        const foundStaff = await models.Staffs.findOne({
          where: {
            id: {
              [op.eq]: body.userId,
            },
          },
        });

        if (!foundStaff) {
          res.status(404).json({
            message: 'User not found',
          });
        } else if (typeof body.activate !== 'boolean') {
          res.status(400).json({
            message: 'activate is not boolean',
          });
        } else {
          const result = await foundStaff.update({
            activated: body.activate,
          });
          if (!result) {
            res.status(500).send('Internal server error');
          } else {
            res.status(200).json({
              message: 'Change user activation successfully ',
            });
          }
        }
      } catch (err) {
        res.status(500).send('Internal server error');
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
    const createdUser = await models.Users.create(data);
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
      res.status(500).send('Internal server error');
    }
  }
};
const mobileLogin = async (req, res) => {
  passport.authenticate('mobile-login', async (error, user, info) => {
    if (error) {
      res.status(500).send('Internal server error');
    } else if (!user) {
      res.status(info.statusCode).json({ message: info.message });
    } else {
      res.status(200).json({
        token: await getToken(user),
      });
    }
  })(req, res);
};
const mobileLogout = async (req, res) => {
  passport.authenticate('mobile-logout', async (error, token, info) => {
    if (error) {
      res.status(500).send('Internal server error');
    } else if (token) {
      res.status(200).json(info);
    } else if (info.constructor.name === 'Error') {
      res.status(400).json({ message: 'No auth token' });
    } else {
      res.status(400).json(info);
    }
  })(req, res);
};
const sendVerifyCode = async (req, res) => {

};
const mobileForgetPassword = async (req, res) => {

};

// USER VERIFICATION WITH EMAIL
const getVerifyWithConfirmationTokenPage = async (req, res) => {
  res.sendFile(path.join(__dirname, './templates/confirmationPage.html'));
};
const sendVerificationEmail = async (req, res) => {
  passportService.checkJwtFailures(req, res, (staff) => {
    validationHelper.bodyValidator(req, res, ['userId'], async (body) => {
      const foundStaff = await models.Staffs.findOne({
        where: {
          id: {
            [op.eq]: body.userId,
          },
        },
      });

      if (!foundStaff) {
        res.status(404).json({
          message: 'User not found',
        });
      } else if (foundStaff.verified) {
        res.status(400).json({
          message: 'User has already verified',
        });
      } else {
        storeConfirmationTokenByStaff(foundStaff.email, foundStaff.id, staff.id, 48);
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
        const confirmationToken = await models.ConfirmationTokens.findOne({
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
            const result = await models.Staffs.update({
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
              res.status(500).send('Internal server error');
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
        res.status(500).send('Internal server error');
      }
    });
  });
};
const sendChangePasswordEmail = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['email'], async (body) => {
    try {
      const staff = await models.Staffs.findOne({
        where: {
          email: {
            [op.eq]: body.email,
          },
        },
      });

      if (!staff) {
        res.status(404).json({
          message: 'User not found',
        });
      } else if (!staff.verified) {
        res.status(403).json({
          message: 'User has not verified',
        });
      } else {
        const forgetPasswordToken = await storeForgetPasswordToken(staff, 48);
        if (!forgetPasswordToken) {
          res.status(500).send('Internal server error');
        } else {
          emailHelper.sendChangePasswordMail(staff.email, forgetPasswordToken.token);
          res.status(200).json({
            message: 'Send email for change password successfully',
          });
        }
      }
    } catch (err) {
      res.status(500).send('Internal server error');
    }
  });
};
const changePasswordwithChangePasswordToken = async (req, res) => {
  validationHelper.bodyValidator(req, res, ['password'], () => {
    validationHelper.queryValidator(req, res, ['change_password_token'], async () => {
      try {
        const confirmationToken = await models.ConfirmationTokens.findOne({
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
            const result = await models.Staffs.update({
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
              res.status(500).send('Internal server error');
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
        res.status(500).send('Internal server error');
      }
    });
  });
};

module.exports = {
  webLogin,
  webLogout,
  createStaff,
  changePassword,
  activateStaff,

  mobileSignup,
  mobileLogin,
  mobileLogout,
  sendVerifyCode,
  mobileForgetPassword,

  getVerifyWithConfirmationTokenPage, // TEMPORARILY USED
  sendVerificationEmail,
  verifyWithConfirmationToken,
  sendChangePasswordEmail,
  changePasswordwithChangePasswordToken,
};
