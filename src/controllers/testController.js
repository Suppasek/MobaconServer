const passport = require('passport');

// const authController = require('./authController');

const test = async (req, res) => {
  passport.authenticate('web-jwt', (error, jwtPayload, info) => {
    if (jwtPayload) {
      res.status(200).json(jwtPayload);
    } else {
      res.status(400).json(info);
    }
  })(req, res);
};

module.exports = {
  test,
};
