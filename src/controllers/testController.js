const passportService = require('./service/passportService');

const test = async (req, res) => {
  passportService.checkJwtFailures(req, res, () => {
    res.send('work');
  });
};

module.exports = {
  test,
};
