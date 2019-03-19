const iap = require('in-app-purchase');

const iapConfig = require('../../config/iapConfig');

const appleValidation = async (receipt) => {
  iap.config({
    // If your purchase item is subscription type, you need this
    applePassword: iapConfig.applePassword,
  });
  iap.setup((error) => {
    if (error) {
      // Don't forget to catch error here
    }
    // As of v1.4.0+ .validate and .validateOnce detects service automatically from the receipt
    iap.validate(receipt, (validateError, response) => {
      if (validateError) {
        // Failed to validate
      }
      if (iap.isValidated(response)) {
        // Succuessful validation
      }
    });
  });
};
const googleValidation = async (receipt) => {
  iap.config({
    googlePublicKeyPath: iapConfig.googlePublicKeyPath,
  });
  iap.setup((error) => {
    if (error) {
      // Don't forget to catch error here
    }
    // As of v1.4.0+ .validate and .validateOnce detects service automatically from the receipt
    iap.validate(receipt, (validateError, response) => {
      if (validateError) {
        // Failed to validate
      }
      if (iap.isValidated(response)) {
        // Succuessful validation
      }
    });
  });
};

module.exports = {
  appleValidation,
  googleValidation,
};
