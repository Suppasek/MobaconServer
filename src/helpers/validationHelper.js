const { forEach } = require('p-iteration');

const constant = require('../config/APIConstant');

const bodyValidator = async (req, res, keys, next) => {
  const invalid = [];
  try {
    await forEach(keys, async (key) => {
      if (typeof key === 'object') {
        if (req.body[key[0]] === undefined) {
          invalid.push(key);
        } else if (typeof req.body[key[0]] !== key[1]) {
          invalid.push(`${key[0]}(${key[1]})`);
        }
      } else if (typeof key === 'string') {
        if (req.body[key] === undefined) {
          invalid.push(key);
        }
      } else {
        throw new Error('Invalid type');
      }
    });

    if (invalid.length > 0) {
      res.status(400).json({
        message: `${invalid} is required`,
      });
    } else {
      next(req.body);
    }
  } catch (err) {
    res.status(500).json({
      message: 'Internal server error',
    });
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
        message: `roleId must be ${constant.ADMINISTRATOR} or ${constant.OPERATOR}`,
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
      message: 'this function for administrators only',
    });
  }
};
const operatorValidator = (req, res, operator, newToken, next) => {
  if (operator.role.id === constant.ADMINISTRATOR || operator.role.id === constant.OPERATOR) {
    next();
  } else {
    res.status(403).json({
      token: newToken,
      message: 'this function for administrators and operators only',
    });
  }
};
const fileExtensionValidator = (extensions, mimetype) => extensions.indexOf(mimetype) !== -1;

module.exports = {
  bodyValidator,
  queryValidator,
  operatorCreationValidator,
  administratorValidator,
  operatorValidator,
  fileExtensionValidator,
};
