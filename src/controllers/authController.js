const uniqid = require('uniqid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

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

// WEB AUTHENTICATION
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
const webLogin = async (req, res) => {
  passport.authenticate('web-login', async (error, staff, info) => {
    if (error) {
      res.status(500).send('Internal server error');
    } else if (!staff) {
      res.status(400).json(info);
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
      res.status(400).json(info);
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

// USER VERIFICATION WITH EMAIL
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

module.exports = {
  webSignup,
  webLogin,
  webLogout,
  mobileSignup,
  mobileLogin,
  mobileLogout,
  verifyWithConfirmationToken,
};
