const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Sequelize = require('sequelize');
const moment = require('moment');
const { ExtractJwt } = require('passport-jwt');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const config = require('../../config/APIConfig');
const tokenHelper = require('../../helpers/tokenHelper');

const secret = fs.readFileSync(path.join(__dirname, '../../config/secret.key'));

const {
  Roles,
  Operators,
  Users,
  OperatorTokens,
  UserTokens,
  Plans,
} = require('../../models');
const { getUserByPhone } = require('./userService');

const op = Sequelize.Op;
config.secret = secret;

const getOperatorInfomation = (operator) => ({
  id: operator.id,
  role: {
    id: operator.role.id,
    name: operator.role.name,
  },
  fullName: operator.fullName,
  phoneNumber: operator.phoneNumber,
  email: operator.email,
  imagePath: operator.imagePath,
});
const getUserInfomation = (user) => ({
  id: user.id,
  role: {
    id: user.role.id,
    name: user.role.name,
  },
  plan: {
    id: user.plan.id,
    name: user.plan.name,
  },
  fullName: user.fullName,
  phoneNumber: user.phoneNumber,
  imagePath: user.imagePath,
});

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
        as: 'role',
      }],
    });

    if (!operator) {
      done(null, false, {
        status: 400,
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

  try {
    const foundToken = await OperatorTokens.findOne({
      where: {
        token: {
          [op.eq]: token,
        },
      },
    });

    if (!foundToken) {
      done(null, false, {
        status: 401,
        message: 'token is invalid',
      });
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
    } else {
      const operator = await Operators.findOne({
        attributes: ['id', 'fullName', 'phoneNumber', 'email', 'imagePath'],
        where: {
          id: {
            [op.eq]: jwtPayload.data.id,
          },
        },
        include: [{
          model: Roles,
          as: 'role',
          attributes: ['id', 'name'],
        }],
      });

      if (moment.utc(jwtPayload.exp) > moment.utc()) {
        done(null, operator);
      } else {
        const isOutOfTime = moment.duration(moment.utc().diff(moment.utc(jwtPayload.exp))).asHours() > 120;

        if (isOutOfTime) {
          done(null, false, { message: 'token has expired' });
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
        } else {
          done(null, operator, {
            token: await tokenHelper.getOperatorToken(operator),
          });
        }
        foundToken.destroy();
      }
    }
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    done(err, false);
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
  try {
    const foundToken = await OperatorTokens.findOne({
      where: {
        token: {
          [op.eq]: token,
        },
      },
    });

    if (!foundToken) {
      done(null, false, { message: 'Token is invalid' });
    } else {
      await foundToken.destroy();
      done(null, foundToken, { message: 'Logout successfully' });
    }
  } catch (error) {
    done(error, false, { message: 'Internal server error' });
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
    const user = await getUserByPhone(phoneNumber);
    if (!user) {
      done(null, false, {
        status: 400,
        message: 'User not found',
      });
    } else if (!user.verified) {
      done(null, false, {
        status: 403,
        message: 'User is not verified',
      });
    } else if (user) {
      const validatePassword = await bcrypt.compare(password, user.password || 'none'); // password is null in some fields
      if (validatePassword) {
        const userInfomation = await getUserInfomation(user);
        done(null, userInfomation);
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

  try {
    const foundToken = await UserTokens.findOne({
      where: {
        token: {
          [op.eq]: token,
        },
      },
    });

    if (!foundToken) {
      done(null, false, {
        status: 401,
        message: 'token is invalid',
      });
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
    } else {
      const user = await Users.findOne({
        attributes: ['id', 'fullName', 'phoneNumber', 'imagePath'],
        where: {
          id: {
            [op.eq]: jwtPayload.data.id,
          },
        },
        include: [{
          model: Roles,
          as: 'role',
          attributes: ['id', 'name'],
        }, {
          model: Plans,
          as: 'plan',
          attributes: ['id', 'name'],
        }],
      });
      // console.log('user find one', user);
      if (moment.utc(jwtPayload.exp) > moment.utc()) {
        done(null, user);
      } else {
        const isOutOfTime = moment.duration(moment.utc().diff(moment.utc(jwtPayload.exp))).asHours() > 120;

        if (isOutOfTime) {
          done(null, false, { message: 'token has expired' });
          if (req.file) {
            fs.unlink(req.file.path, () => {});
          }
        } else if (user) {
          console.log('user data', user);
          done(null, user, {
            token: await tokenHelper.getUserToken(user),
          });
        }
        foundToken.destroy();
      }
    }
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    done(err, false);
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
  try {
    const foundToken = await UserTokens.findOne({
      where: {
        token: {
          [op.eq]: token,
        },
      },
    });

    if (!foundToken) {
      done(null, false, { message: 'Token is invalid' });
    } else {
      await foundToken.destroy();
      done(null, foundToken, { message: 'Logout successfully' });
    }
  } catch (error) {
    done(error, false, { message: 'Internal server error' });
  }
}));

// FUNCTION FOR RESPOND JWT FAILURES
const webJwtAuthorize = (req, res, next) => passport.authenticate('web-jwt', (error, user, info) => {
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

// TODO Deprecated this function in future and use mobileJwtAuthorizeMiddleware instead!!.
const mobileJwtAuthorize = (req, res, next) => passport.authenticate('mobile-jwt', (error, user, info) => {
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

const mobileJwtAuthorizeMiddleware = (req, res, next) => passport.authenticate('mobile-jwt', (error, user, info) => {
  if (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  } else if (user) {
    req.user = user;
    req.info = info ? info.token : undefined;
    next();
  } else if (info.constructor.name === 'Error') {
    res.status(401).json({ message: 'No auth token' });
  } else {
    res.status(info.status || 400).json({
      message: info.message,
    });
  }
})(req, res);

module.exports = {
  webJwtAuthorize,
  mobileJwtAuthorize,
  mobileJwtAuthorizeMiddleware,
};
