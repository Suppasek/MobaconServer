const jwt = require('jsonwebtoken');
const staffModel = require('../models/staffModel');
const config = require('../config/config');

const getToken = (staffId) => {
  const token = jwt.sign(staffModel.getStaffById(staffId), config.jwtsecret, {
    expiresIn: 86400, // expires in 24 hours
  });
  return token;
};
const verifyToken = (req, res, next) => {
  const bearerHeader = req.bearerHeader.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).json({
      message: 'forbidden',
    });
  }
};

module.exports = {
  getToken,
  verifyToken,
};
