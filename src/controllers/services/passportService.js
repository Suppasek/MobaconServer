const bcrypt = require('bcryptjs');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const { ExtractJwt } = require('passport-jwt');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const models = require('../../models');
const config = require('../../config/APIConfig');

const op = Sequelize.Op;

// STRATEGY FOR WEB LOGIN
passport.use('web-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, async (req, email, password, done) => {
  try {
    const staff = await models.Staffs.findOne({
      where: {
        email: {
          [op.eq]: email,
        },
      },
    });

    if (!staff) {
      done(null, false, {
        statusCode: 404,
        message: 'User not found',
      });
    } else if (!staff.verified) {
      done(null, false, {
        statusCode: 403,
        message: 'User is not verified',
      });
    } else if (!staff.activated) {
      done(null, false, {
        statusCode: 403,
        message: 'User is not activated',
      });
    } else if (staff) {
      const validatePassword = await bcrypt.compare(password, staff.password || 'none');
      if (validatePassword) {
        const staffData = {
          id: staff.id,
          roleId: staff.roleId,
          fullName: staff.fullName,
          phoneNumber: staff.phoneNumber,
          email: staff.email,
        };
        done(null, staffData);
      } else {
        done(null, false, {
          statusCode: 400,
          message: 'Invalid Password',
        });
      }
    }
  } catch (error) {
    done(error, false, {
      statusCode: 500,
      message: 'Internal server error',
    });
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
    const user = await models.Users.findOne({
      where: {
        phoneNumber: {
          [op.eq]: phoneNumber,
        },
      },
    });

    if (!user) {
      done(null, false, {
        statusCode: 404,
        message: 'User not found',
      });
    } else if (!user.verified) {
      done(null, false, {
        statusCode: 403,
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
          statusCode: 400,
          message: 'Invalid Password',
        });
      }
    }
  } catch (error) {
    done(error, false, {
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}));

// STRATEGY FOR WEB JWT
passport.use('web-jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: false,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];
  if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
    try {
      const foundToken = await models.StaffTokens.findOne({
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
        done(null, false, { message: 'Invalid Token' });
      } else if (moment(foundToken.expired).tz(config.timezone) > moment().tz(config.timezone)) {
        done(null, jwtPayload);
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

// STRATEGY FOR MOBILE JWT
passport.use('mobile-jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
  ignoreExpiration: false,
  passReqToCallback: true,
  session: false,
}, async (req, jwtPayload, done) => {
  const token = req.headers.authorization.split(' ')[1];
  if (moment(jwtPayload.exp).tz(config.timezone) > moment().tz(config.timezone)) {
    const foundToken = await models.UserTokens.findOne({
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
      const foundToken = await models.StaffTokens.findOne({
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
        done(null, false, { message: 'Token has already expired' });
      } else if (foundToken.expired > moment().tz(config.timezone)) {
        await models.StaffTokens.update({
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
        done(null, false, { message: 'Token has already expired' });
      }
    } catch (error) {
      done(error, false, { message: 'Internal server error' });
    }
  } else {
    done(null, false, { message: 'Token has already expired' });
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
      const foundToken = await models.UserTokens.findOne({
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
        done(null, false, { message: 'Token has already expired' });
      } else if (foundToken.expired > moment().tz(config.timezone)) {
        await models.UserTokens.update({
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
        done(null, false, { message: 'Token has already expired' });
      }
    } catch (error) {
      done(error, false, { message: 'Internal server error' });
    }
  } else {
    done(null, false, { message: 'Token has already expired' });
  }
}));

// FUNCTION FOR RESPOND JWT FAILURES
const checkJwtFailures = (req, res, next) => passport.authenticate('web-jwt', (error, jwtPayload, info) => {
  if (error) {
    res.status(500).send('Internal server error');
  } else if (jwtPayload) {
    next(jwtPayload.data);
  } else if (info.constructor.name === 'Error') {
    res.status(401).json({ message: 'No auth token' });
  } else {
    res.status(401).json(info);
  }
})(req, res);

module.exports = {
  checkJwtFailures,
};
