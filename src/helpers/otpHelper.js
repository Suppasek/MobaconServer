const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const moment = require('moment-timezone');

const config = require('../config/APIConfig');

const op = sequelize.Op;

const {
  Users,
  ConfirmationCodes,
} = require('../models');

const storeConfirmationCode = async (createdBy, time = 5) => {
  const rawCode = '5555';
  const code = await bcrypt.hash(rawCode, bcrypt.genSaltSync(10));

  await ConfirmationCodes.update({
    expired: await moment().tz(config.timezone),
  }, {
    where: {
      createdBy: {
        [op.eq]: createdBy,
      },
      expired: {
        [op.gt]: moment().tz(config.timezone),
      },
    },
  });

  await ConfirmationCodes.create({
    code,
    expired: moment().tz(config.timezone).add(time, 'minutes'),
    createdBy,
  });
};
const verifyOtp = async (otp, createdBy) => {
  const foundCode = await ConfirmationCodes.findOne({
    where: {
      createdBy: {
        [op.eq]: createdBy,
      },
      expired: {
        [op.gt]: moment().tz(config.timezone),
      },
    },
  });

  if (!foundCode) {
    return {
      ok: false,
      message: 'time out otp',
    };
  } else {
    const result = await bcrypt.compare(otp, foundCode.code);

    if (!result) {
      return {
        ok: false,
        message: 'invalid otp',
      };
    } else {
      await Users.update({
        verified: true,
      }, {
        where: {
          id: {
            [op.eq]: createdBy,
          },
        },
      });
      await foundCode.update({
        expired: moment().tz(config.timezone),
      });
      return {
        ok: true,
        message: 'verify with otp successfully',
      };
    }
  }
};

module.exports = {
  storeConfirmationCode,
  verifyOtp,
};
