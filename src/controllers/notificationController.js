const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');
const SubscriberSchema = require('../mongoSchema/subscriberSchema');

const storeToken = async (token, userId) => {
  SubscriberSchema.create([
    token,
    userId,
  ]);
};
const existToken = async (token, userId) => {
  const result = await SubscriberSchema.findOne({
    token,
    userId,
  });
  return !!result;
};

const subscribe = async (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      validationHelper.bodyValidator(req, res, ['token'], async () => {
        try {
          await storeToken(req.body.token, user.id);
          res.status(200).json({
            message: 'Subscribe for notification successfully',
          });
        } catch (err) {
          res.status(500).json({
            message: 'Internal Server Error',
          });
        }
      });
    });
  });
};
const checkForSubscription = async (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      validationHelper.bodyValidator(req, res, ['token'], async () => {
        try {
          if (await existToken(req.body.token, user.id)) {
            res.status(200).json({
              message: 'This token is recorded',
              data: true,
            });
          } else {
            res.status(200).json({
              message: 'This token is not recorded',
              data: false,
            });
          }
        } catch (err) {
          res.status(500).json({
            message: 'Internal Server Error',
          });
        }
      });
    });
  });
};

module.exports = {
  subscribe,
  checkForSubscription,
};
