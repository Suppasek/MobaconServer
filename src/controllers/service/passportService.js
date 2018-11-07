const moment = require('moment-timezone');
const passport = require('passport');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

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
    if (staff) {
      const validatePassword = await bcrypt.compare(password, staff.password);
      if (validatePassword) {
        const staffData = {
          id: staff.id,
          roleId: staff.roleId,
          fullName: staff.fullName,
          carrier: staff.carrier,
          email: staff.email,
        };
        done(null, staffData);
      } else {
        done(null, false, { message: 'Invalid Password' });
      }
    } else {
      done(null, false, { message: 'User not found' });
    }
  } catch (error) {
    done(error, false, { message: 'Internal Server Error' });
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
    if (user) {
      const validatePassword = await bcrypt.compare(password, user.password);
      if (validatePassword) {
        const userData = {
          id: user.id,
          roleId: user.roleId,
          phoneNumber: user.phoneNumber,
          carrier: user.carrier,
        };
        done(null, userData);
      } else {
        done(null, false, { message: 'Invalid Password' });
      }
    } else {
      done(null, false, { message: 'User not found' });
    }
  } catch (error) {
    done(error, false, { message: 'Internal Server Error' });
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
      done(null, false, { message: 'Not found token' });
    } else if (moment(foundToken.expired).tz(config.timezone) > moment().tz(config.timezone)) {
      done(null, foundToken);
    } else {
      done(null, false, { message: 'Token has expired' });
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
      done(null, false, { message: 'Not found token' });
    } else if (moment(foundToken.expired).tz(config.timezone) > moment().tz(config.timezone)) {
      done(null, jwtPayload);
    } else {
      done(null, false, { message: 'Token has expired' });
    }
  } else {
    done(null, false, { message: 'Token has expired' });
  }
}));
