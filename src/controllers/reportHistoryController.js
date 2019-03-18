const billSchema = require('../mongoSchema/billSchema');
const validationHelper = require('../helpers/validationHelper');
const passportService = require('../controllers/services/passportService');

const getReportHistory = (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      try {
        const bills = await billSchema.find({
          userId: user.id,
        }).sort({ emissionAt: 'asc' })
          .select(['-_id', 'amount', 'used', 'emissionAt', 'paidAt']);

        res.status(200).json({
          token: newToken,
          data: bills,
        });
      } catch (err) {
        res.status(500).json({
          token: newToken,
          message: 'Internal server error',
        });
      }
    });
  });
};

module.exports = {
  getReportHistory,
};
