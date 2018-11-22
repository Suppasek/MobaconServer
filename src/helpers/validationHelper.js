const { forEach } = require('p-iteration');

const constant = require('../config/APIConstant');

const bodyValidator = async (req, res, keys, next) => {
  const invalid = [];
  await forEach(keys, async (key) => {
    if (req.body[key] === undefined) {
      invalid.push(key);
    }
  });
  if (invalid.length > 0) {
    res.status(400).json({
      message: `${invalid} is required`,
    });
  } else {
    next(req.body);
  }
};
const queryValidator = async (req, res, keys, next) => {
  const invalid = [];
  await forEach(keys, async (key) => {
    if (req.query[key] === undefined) {
      invalid.push(key);
    }
  });
  if (invalid.length > 0) {
    res.status(400).json({
      message: `${invalid} is required`,
    });
  } else {
    next(req.query);
  }
};
const operatorCreationValidator = (req, res, operator, newToken, next) => {
  if (operator.role.id === constant.ADMINISTRATOR) {
    if (req.body.roleId === `${constant.ADMINISTRATOR}` || req.body.roleId === `${constant.OPERATOR}`) {
      next();
    } else {
      res.status(400).json({
        token: newToken,
        message: 'roleId must be 1 or 2',
      });
    }
  } else {
    res.status(403).json({
      token: newToken,
      message: 'Cannot create administrator or operator',
    });
  }
};
const administratorValidator = (req, res, operator, newToken, next) => {
  if (operator.role.id === constant.ADMINISTRATOR) {
    next();
  } else {
    res.status(403).json({
      token: newToken,
      message: 'this function for administrator only',
    });
  }
};
const fileExtensionValidator = (extensions, mimetype) => extensions.indexOf(mimetype) !== -1;

module.exports = {
  bodyValidator,
  queryValidator,
  operatorCreationValidator,
  administratorValidator,
  fileExtensionValidator,
};
