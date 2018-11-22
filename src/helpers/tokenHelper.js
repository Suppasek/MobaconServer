const moment = require('moment');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const config = require('../config/APIConfig');
const emailHelper = require('../helpers/emailHelper');

const {
  ConfirmationTokens,
  ForgetPasswordTokens,
} = require('../models');

const getToken = async (user, time = 12) => {
  const expired = Math.floor(moment().tz(config.timezone).add(time, 'hours'));
  const token = await jwt.sign({
    data: user,
    exp: expired,
  }, config.secret);
  return token;
};
const storeConfirmationToken = async (email, userId, time = 12) => {
  const token = await uniqid(await uniqid.time());
  await ConfirmationTokens.create({
    userId,
    token,
    expired: moment().tz(config.timezone).add(time, 'hours'),
    createdBy: userId,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeConfirmationTokenByOperator = async (email, userId, createdBy, time = 12) => {
  const token = await uniqid(await uniqid.time());
  await ConfirmationTokens.create({
    userId,
    token,
    expired: moment().tz(config.timezone).add(time, 'hours'),
    createdBy,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeForgetPasswordToken = async (operator, expiredIn = 12) => {
  try {
    const forgetPasswordToken = await ForgetPasswordTokens.create({
      token: await uniqid(await uniqid.time()),
      expired: moment().tz(config.timezone).add(expiredIn, 'hours'),
      createdBy: operator.id,
    });
    return forgetPasswordToken;
  } catch (err) {
    return false;
  }
};

module.exports = {
  getToken,
  storeConfirmationToken,
  storeConfirmationTokenByOperator,
  storeForgetPasswordToken,
};
