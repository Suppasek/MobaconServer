const passport = require('passport');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

const models = require('../../models');

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
