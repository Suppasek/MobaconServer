const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const randomString = require('random-string');
const moment = require('moment-timezone');

const config = require('../config/APIConfig');
const twilioConfig = require('../config/TwilioConfig');

const {
  Users,
  ConfirmationCodes,
} = require('../models');

const twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
const op = sequelize.Op;

const ramdomOtp = async () => {
  const otp = await randomString({
    length: 4,
    numeric: true,
    letters: false,
    special: false,
  });
  return otp;
};
const sendOtp = (prefixPhoneNumber, phoneNumber, rawConfirmCode) => {
  try {
    twilioClient.messages.create({
      to: `${prefixPhoneNumber}${phoneNumber.slice(1)}`,
      from: twilioConfig.phoneNumer,
      body: `Your mobacon verification code is ${rawConfirmCode}`,
    });
    return true;
  } catch (err) {
    return false;
  }
};
const storeConfirmationCode = async (createdBy, time = 1) => {
  const rawCode = await ramdomOtp();
  const user = await Users.findOne({
    where: {
      id: {
        [op.eq]: createdBy,
      },
    },
  });
  sendOtp(twilioConfig.prefixDestinationPhoneNumber, user.phoneNumber, rawCode);
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
