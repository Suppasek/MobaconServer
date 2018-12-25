const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const moment = require('moment');

const config = require('../config/APIConfig');
const emailHelper = require('../helpers/emailHelper');

const secret = fs.readFileSync(path.join(__dirname, '../config/secret.key'));

const {
  OperatorTokens,
  UserTokens,
  ConfirmationTokens,
  ForgetPasswordTokens,
} = require('../models');

const op = Sequelize.Op;
config.secret = secret;

const getOperatorToken = async (user, time = 12) => {
  const expired = Math.floor(moment.utc().add(time, 's'));
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
  const expired = Math.floor(moment.utc().add(time, 's'));
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
  const token = await uniqid(await uniqid.time()) + await uniqid(await uniqid.time());
  await ConfirmationTokens.create({
    userId,
    token,
    expired: moment.utc().add(time, 'hours'),
    createdBy,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeConfirmationTokenByOperator = async (email, userId, createdBy, time = 12) => {
  const token = await uniqid(await uniqid.time()) + await uniqid(await uniqid.time());
  await ConfirmationTokens.update({
    expired: moment.utc(),
  }, {
    where: {
      expired: {
        [op.gt]: moment.utc(),
      },
      userId: {
        [op.eq]: userId,
      },
    },
  });
  await ConfirmationTokens.create({
    userId,
    token,
    expired: moment.utc().add(time, 'hours'),
    createdBy,
  });
  emailHelper.sendVerificationMail(email, token);
};
const storeForgetPasswordToken = async (operator, expiredIn = 12) => {
  try {
    const token = await uniqid(await uniqid.time()) + await uniqid(await uniqid.time());
    await ForgetPasswordTokens.update({
      expired: moment.utc(),
    }, {
      where: {
        createdBy: {
          [op.eq]: operator.id,
        },
        expired: {
          [op.gt]: moment.utc(),
        },
      },
    });
    const forgetPasswordToken = await ForgetPasswordTokens.create({
      token,
      expired: moment.utc().add(expiredIn, 'hours'),
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
