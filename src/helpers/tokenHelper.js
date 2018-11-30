const moment = require('moment');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const config = require('../config/APIConfig');
const emailHelper = require('../helpers/emailHelper');

const {
  OperatorTokens,
  UserTokens,
  ConfirmationTokens,
  ForgetPasswordTokens,
} = require('../models');

const getOperatorToken = async (user, time = 12) => {
  const expired = Math.floor(moment().tz(config.timezone).add(time, 'hours'));
  const token = await jwt.sign({
    data: user,
    exp: expired,
  }, config.secret);

  OperatorTokens.create({
    token,
    createdBy: user.id,
  });

  return token;
};
const getUserToken = async (user, time = 12) => {
  const expired = Math.floor(moment().tz(config.timezone).add(time, 'hours'));
  const token = await jwt.sign({
    data: user,
    exp: expired,
  }, config.secret);

  UserTokens.create({
    token,
    createdBy: user.id,
  });

  return token;
};
const storeConfirmationToken = async (email, userId, createdBy, time = 12) => {
  const token = await uniqid(await uniqid.time());
  await ConfirmationTokens.create({
    userId,
    token,
    expired: moment().tz(config.timezone).add(time, 'hours'),
    createdBy,
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
  getOperatorToken,
  getUserToken,
  storeConfirmationToken,
  storeConfirmationTokenByOperator,
  storeForgetPasswordToken,
};
