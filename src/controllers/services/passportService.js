const fs = require('fs');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const { ExtractJwt } = require('passport-jwt');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const config = require('../../config/APIConfig');
const tokenHelper = require('../../helpers/tokenHelper');
const {
  Roles,
  Operators,
  Users,
  OperatorBlacklistTokens,
  UserBlacklistTokens,
} = require('../../models');

const op = Sequelize.Op;

const getOperatorInfomation = (operator) => ({
  id: operator.id,
  role: {
    id: operator.Role.id,
    name: operator.Role.name,
  },
  fullName: operator.fullName,
  phoneNumber: operator.phoneNumber,
  email: operator.email,
  imagePath: operator.imagePath,
});
const isBlacklistToken = async (token) => {
  const blacklistToken = await OperatorBlacklistTokens.findOne({
    where: {
      token: {
        [op.eq]: token,
      },
    },
  });
  return !!blacklistToken;
};

// STRATEGY FOR WEB LOGIN
passport.use('web-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, async (req, email, password, done) => {
  try {
    const operator = await Operators.findOne({
      where: {
        email: {
          [op.eq]: email,
        },
      },
      include: [{
        model: Roles,
      }],
    });

    if (!operator) {
      done(null, false, {
        status: 404,
        message: 'User not found',
      });
    } else if (!operator.verified) {
      done(null, false, {
        status: 403,
        message: 'User is not verified',
      });
    } else if (!operator.activated) {
      done(null, false, {
        status: 403,
        message: 'User is not activated',
      });
    } else if (operator) {
      const validatePassword = await bcrypt.compare(password, operator.password || 'none'); // password is null in some fields
      if (validatePassword) {
        const operatorInfomation = await getOperatorInfomation(operator);
        done(null, operatorInfomation);
      } else {
        done(null, false, {
          status: 400,
          message: 'Invalid Password',
        });
      }
    }
  } catch (error) {
    done(error, false, {
      status: 500,
      message: 'Internal server error',
    });
  }
}));

// STRATEGY FOR WEB JWT
passport.use('web-jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: true,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];

  if (await isBlacklistToken(token)) {
    done(null, false, {
      status: 401,
      message: 'Token has expired',
    });

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  } else {
    try {
      const operator = await Operators.findOne({
        where: {
          id: {
            [op.eq]: jwtPayload.data.id,
          },
        },
        include: [{
          model: Roles,
        }],
      });
      const operatorInfomation = await getOperatorInfomation(operator);

      if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
        done(null, operatorInfomation);
      } else {
        OperatorBlacklistTokens.create({
          token,
          createdBy: jwtPayload.data.id,
        });
        done(null, operatorInfomation, {
          token: await tokenHelper.getToken(operatorInfomation),
        });
      }
    } catch (err) {
      done(err, false);
    }
  }
}));

// STRATEGY FOR WEB LOGOUT
passport.use('web-logout', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: false,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];
  if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
    try {
      const foundToken = await OperatorBlacklistTokens.findOne({
        where: {
          token: {
            [op.eq]: token,
          },
        },
      });

      if (foundToken) {
        done(null, false, { message: 'Token has expired' });
      } else {
        OperatorBlacklistTokens.create({
          token,
          createdBy: jwtPayload.data.id,
        }).then(() => done(null, foundToken, { message: 'Logout successfully' }));
      }
    } catch (error) {
      done(error, false, { message: 'Internal server error' });
    }
  } else {
    done(null, false, { message: 'Token has expired' });
  }
}));

// STRATEGY FOR MOBILE LOGIN
passport.use('mobile-login', new LocalStrategy({
  usernameField: 'phoneNumber',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, async (req, phoneNumber, password, done) => {
  try {
    const user = await Users.findOne({
      where: {
        phoneNumber: {
          [op.eq]: phoneNumber,
        },
      },
    });

    if (!user) {
      done(null, false, {
        status: 404,
        message: 'User not found',
      });
    } else if (!user.verified) {
      done(null, false, {
        status: 403,
        message: 'User is not verified',
      });
    } else if (user) {
      const validatePassword = await bcrypt.compare(password, user.password || 'none');
      if (validatePassword) {
        const userData = {
          id: user.id,
          roleId: user.roleId,
          planId: user.planId,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          carrier: user.carrier,
        };
        done(null, userData);
      } else {
        done(null, false, {
          status: 400,
          message: 'Invalid Password',
        });
      }
    }
  } catch (error) {
    done(error, false, {
      status: 500,
      message: 'Internal server error',
    });
  }
}));

// STRATEGY FOR MOBILE JWT
passport.use('mobile-jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: true,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];
  if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
    const foundToken = await UserBlacklistTokens.findOne({
      where: {
        token: {
          [op.eq]: token,
        },
        createdBy: {
          [op.eq]: jwtPayload.data.id,
        },
      },
    });
    if (!foundToken) {
      done(null, false, { message: 'Invalid token' });
    } else if (moment(foundToken.expired).tz(config.timezone) > moment().tz(config.timezone)) {
      done(null, jwtPayload);
    } else {
      done(null, false, { message: 'Token has expired' });
    }
  } else {
    done(null, false, { message: 'Token has expired' });
  }
}));

// STRATEGY FOR MOBILE LOGOUT
passport.use('mobile-logout', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: false,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];
  if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
    try {
      const foundToken = await UserBlacklistTokens.findOne({
        where: {
          token: {
            [op.eq]: token,
          },
          createdBy: {
            [op.eq]: jwtPayload.data.id,
          },
        },
      });

      if (!foundToken) {
        done(null, false, { message: 'Token has expired' });
      } else if (foundToken.expired > moment().tz(config.timezone)) {
        await UserBlacklistTokens.update({
          expired: moment().tz(config.timezone),
        }, {
          where: {
            expired: {
              [op.gt]: moment().tz(config.timezone),
            },
            createdBy: {
              [op.eq]: jwtPayload.data.id,
            },
          },
        });
        done(null, foundToken, { message: 'Logout successfully' });
      } else {
        done(null, false, { message: 'Token has expired' });
      }
    } catch (error) {
      done(error, false, { message: 'Internal server error' });
    }
  } else {
    done(null, false, { message: 'Token has expired' });
  }
}));

// FUNCTION FOR RESPOND JWT FAILURES
const checkJwtFailures = (req, res, next) => passport.authenticate('web-jwt', (error, user, info) => {
  if (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  } else if (user) {
    next(user, info ? info.token : undefined);
  } else if (info.constructor.name === 'Error') {
    res.status(401).json({ message: 'No auth token' });
  } else {
    res.status(info.status || 400).json({
      message: info.message,
    });
  }
})(req, res);

module.exports = {
  checkJwtFailures,
};
