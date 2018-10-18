const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const models = require('../models');
const config = require('../config/api-config');

const op = Sequelize.Op;

const storeToken = (token, expired) => {
  models.Tokens.create({
    token,
    expired,
  });
};
const getStaffToken = async (staffId) => {
  const staff = await models.Staffs.findById(staffId);
  const staffData = {
    id: staff.dataValues.id,
    carrier: staff.dataValues.carrier,
    fullName: staff.dataValues.fullName,
    email: staff.dataValues.email,
  };
  const expired = Math.floor(moment().utc().add(12, 'hours'));
  const token = await jwt.sign({
    data: staffData,
    exp: expired,
  }, config.secret);
  storeToken(token, expired);
  return token;
};
const getUserToken = async (userId) => {
  const user = await models.Users.findById(userId);
  const userData = {
    id: user.dataValues.id,
    phoneNumber: user.dataValues.phoneNumber,
    carrier: user.dataValues.carrier,
  };
  const expired = Math.floor(moment().utc().add(12, 'hours'));
  const token = await jwt.sign({
    data: userData,
    exp: expired,
  }, config.secret);
  storeToken(token, expired);
  return token;
};
const getTokenFromBody = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};
const verifyToken = async (req, res, next) => {
  getTokenFromBody(req, res, async () => {
    jwt.verify(req.token, config.secret, async (authError) => {
      if (authError) {
        res.status(401).send('Unauthorized');
      } else {
        try {
          const foundToken = await models.Tokens.findAll({
            where: {
              token: {
                [op.eq]: req.token,
              },
            },
          });
          if (foundToken[0]) {
            if (foundToken[0].expired > moment().utc()) {
              next();
            } else {
              res.status(401).send('Unauthorized');
            }
          } else {
            res.status(401).send('Unauthorized');
          }
        } catch (err) {
          if (err.errors) {
            res.status(400).json({
              message: err.errors[0].message,
            });
          } else {
            res.status(500).json('Internal Server Error');
          }
        }
      }
    });
  });
};

// For web front-end
const webSignup = async (req, res) => {
  try {
    const data = {
      fullName: req.body.fullName,
      carrier: req.body.carrier,
      email: req.body.email,
      password: req.body.password,
    };
    const createdStaff = await models.Staffs.create(data);
    bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then((hashed) => {
      createdStaff.update({
        password: hashed,
      });
    });
    const resData = {
      fullName: createdStaff.fullName,
      carrier: createdStaff.carrier,
      email: createdStaff.email,
    };
    res.status(201).json({
      message: 'created',
      data: resData,
    });
  } catch (err) {
    if (err.errors) {
      res.status(400).json({
        message: err.errors[0].message,
      });
    } else {
      res.status(500).json('Internal Server Error');
    }
  }
};
const webLogin = async (req, res) => {
  try {
    const staff = await models.Staffs.findAll({
      where: {
        email: {
          [op.eq]: req.body.email,
        },
      },
    });

    if (staff[0] && req.body.password) {
      const isStaff = await bcrypt.compare(req.body.password, staff[0].password);
      if (isStaff) {
        res.status(200).send({
          token: await getStaffToken(staff[0].id),
        });
      } else {
        res.status(401).send('Unauthorized');
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    res.status(500).json('Internal Server Error');
  }
};

// For mobile application
const mobileSignup = async (req, res) => {
  try {
    const data = {
      phoneNumber: req.body.phoneNumber,
      carrier: req.body.carrier,
      password: req.body.password,
    };
    const createdUser = await models.Users.create(data);
    bcrypt.hash(req.body.password, bcrypt.genSaltSync(10)).then((hashed) => {
      createdUser.update({
        password: hashed,
      });
    });
    const resData = {
      phoneNumber: createdUser.phoneNumber,
      carrier: createdUser.carrier,
    };
    res.status(201).json({
      message: 'created',
      data: resData,
    });
  } catch (err) {
    if (err.errors) {
      res.status(400).json({
        message: err.errors[0].message,
      });
    } else {
      res.status(500).json('Internal Server Error');
    }
  }
};
const mobileLogin = async (req, res) => {
  try {
    const user = await models.Users.findAll({
      where: {
        phoneNumber: {
          [op.eq]: req.body.phoneNumber,
        },
      },
    });

    if (user[0] && req.body.password) {
      const isUser = await bcrypt.compare(req.body.password, user[0].password);
      if (isUser) {
        res.status(200).send({
          token: await getUserToken(user[0].id),
        });
      } else {
        res.status(401).send('Unauthorized');
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  getTokenFromBody,
  verifyToken,
  webSignup,
  webLogin,
  mobileSignup,
  mobileLogin,
};
