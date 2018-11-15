const { forEach } = require('p-iteration');

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

module.exports = {
  bodyValidator,
  queryValidator,
};
