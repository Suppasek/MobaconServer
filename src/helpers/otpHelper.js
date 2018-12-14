const twilio = require('twilio');
const uniqid = require('uniqid');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const randomString = require('random-string');
const moment = require('moment-timezone');

const config = require('../config/APIConfig');
const twilioConfig = require('../config/TwilioConfig');

const {
  Users,
  ConfirmationCodes,
  ForgetPasswordCodes,
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
const sendChangePasswordSms = async (prefixPhoneNumber, phoneNumber, token) => {
  try {
    twilioClient.messages.create({
      to: `${prefixPhoneNumber}${phoneNumber.slice(1)}`,
      from: twilioConfig.phoneNumer,
      body: `You can change your password on website, click http://mobacon-web.pieros.site/user/changePassword?changePasswordCode=${token}
      `,
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
const storeForgetPasswordCode = async (createdBy, time = 1) => {
  const token = await uniqid(await uniqid.time()) + await uniqid(await uniqid.time());

  const user = await Users.findOne({
    where: {
      id: {
        [op.eq]: createdBy,
      },
    },
  });

  ForgetPasswordCodes.update({
    expired: moment().tz(config.timezone),
  }, {
    where: {
      createdBy: {
        [op.eq]: createdBy,
      },
      expired: {
        [op.gt]: moment().tz(config.timezone),
      },
    },
  }).then(() => {
    ForgetPasswordCodes.create({
      code: token,
      expired: moment().tz(config.timezone).add(time, 'hours'),
      createdBy,
    });
  });

  sendChangePasswordSms(twilioConfig.prefixDestinationPhoneNumber, user.phoneNumber, token);
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
  storeForgetPasswordCode,
  verifyOtp,
};
