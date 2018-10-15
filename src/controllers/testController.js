const authController = require('./authController');

const test = async (req, res) => {
  authController.verifyToken(req, res, async () => {
    res.json({
      message: 'test',
    });
  });
};

module.exports = {
  test,
};
