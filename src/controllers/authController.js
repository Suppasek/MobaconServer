const moment = require('moment-timezone');
const uniqid = require('uniqid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Sequelize = require('sequelize');

const models = require('../models');
const sendMail = require('./service/mailerService');
const config = require('../config/APIConfig');
const constant = require('../config/APIConstant');
require('./service/passportService');

const op = Sequelize.Op;

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
const storeConfirmationToken = async (email, userId) => {
  const token = await uniqid(await uniqid.time());
  await models.ConfirmationTokens.create({
    token,
    createdBy: userId,
  });
  sendMail.sendVerifyMail(email, token);
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

// START WEB AUTHENTICATION SECTION
const webSignup = async (req, res) => {
  try {
    const data = {
      fullName: req.body.fullName,
      roleId: 1,
      carrier: req.body.carrier,
      email: req.body.email,
      password: req.body.password,
    };
    const createdStaff = await models.Staffs.create(data);
    bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then((hashed) => {
      createdStaff.update({
        password: hashed,
      });
    });
    const resData = {
      fullName: createdStaff.fullName,
      carrier: createdStaff.carrier,
      email: createdStaff.email,
    };
    storeConfirmationToken(createdStaff.email, createdStaff.id);
    // sendMail.sendVerifyMail(resData.email);
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
      res.status(500).send('Internal Server Error');
    }
  }
};
const webLogin = async (req, res) => {
  passport.authenticate('web-login', async (error, staff, info) => {
    if (error) {
      res.status(500).send('Internal Server Error');
    } else if (!staff) {
      res.status(400).json(info);
    } else {
      res.status(200).json({
        token: await getToken(staff),
      });
    }
  })(req, res);
};
// END WEB AUTHENTICATION SECTION

// START MOBILE AUTHENTICATION SECTION
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
      res.status(500).send('Internal Server Error');
    }
  }
};
const mobileLogin = async (req, res) => {
  passport.authenticate('mobile-login', async (error, user, info) => {
    if (error) {
      res.status(500).send('Internal Server Error');
    } else if (!user) {
      res.status(400).json(info);
    } else {
      res.status(200).json({
        token: await getToken(user),
      });
    }
  })(req, res);
};
// END MOBILE AUTHENTICATION SECTION

// START VERIFICATION SECTION
const verifyWithConfirmationToken = async (req, res) => {
  const confirmationToken = await models.ConfirmationTokens.findOne({
    where: {
      token: {
        [op.eq]: req.query.confirmation_token,
      },
    },
  });
  if (confirmationToken) {
    const result = await models.Staffs.update({
      verified: '1',
    },
    {
      where: {
        id: confirmationToken.createdBy,
      },
    });
    if (result) {
      res.send('Verify account success.');
    } else {
      res.send('Verify account failed.');
    }
  } else {
    res.send('Verify account failed.');
  }
};
// END VERIFICATION SECTION

module.exports = {
  webSignup,
  webLogin,
  mobileSignup,
  mobileLogin,
  verifyWithConfirmationToken,
};
