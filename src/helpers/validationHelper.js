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
        message: `${invalid} ${invalid.length > 1 ? 'are' : 'is'} required`,
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
  try {
    await forEach(keys, async (key) => {
      if (typeof key === 'object') {
        if (req.query[key[0]] === undefined) {
          invalid.push(key);
        } else if (typeof req.query[key[0]] !== key[1]) {
          invalid.push(`${key[0]}(${key[1]})`);
        }
      } else if (typeof key === 'string') {
        if (req.query[key] === undefined) {
          invalid.push(key);
        }
      } else {
        throw new Error('Invalid type');
      }
    });

    if (invalid.length > 0) {
      res.status(400).json({
        message: `${invalid} ${invalid.length > 1 ? 'are' : 'is'} required`,
      });
    } else {
      next(req.query);
    }
  } catch (err) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
const operatorCreationValidator = (req, res, operator, newToken, next) => {
  if (operator.role.id === constant.ROLE.ADMINISTRATOR) {
    if (req.body.roleId === `${constant.ROLE.ADMINISTRATOR}` || req.body.roleId === `${constant.ROLE.OPERATOR}`) {
      next();
    } else {
      res.status(400).json({
        token: newToken,
        message: `roleId must be ${constant.ROLE.ADMINISTRATOR} or ${constant.ROLE.OPERATOR}`,
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
  if (operator.role.id === constant.ROLE.ADMINISTRATOR) {
    next();
  } else {
    res.status(403).json({
      token: newToken,
      message: 'this function for administrators only',
    });
  }
};
const operatorValidator = (req, res, operator, newToken, next) => {
  if (operator.role.id === constant.ROLE.ADMINISTRATOR || operator.role.id === constant.ROLE.OPERATOR) {
    next();
  } else {
    res.status(403).json({
      token: newToken,
      message: 'this function for administrators and operators only',
    });
  }
};
const userValidator = (req, res, user, newToken, next) => {
  if (user.role.id === constant.ROLE.USER) {
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
  userValidator,
  fileExtensionValidator,
};
