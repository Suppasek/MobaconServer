// const { google } = require('googleapis');
// Google service
const iap = require('in-app-purchase');

const key = require('../../config/mobacon-service-account.json');

iap.config({

  /* Configurations for Apple */
  appleExcludeOldTransactions: true, // if you want to exclude old transaction, set this to true. Default is false
  applePassword: 'abcdefg...', // this comes from iTunes Connect (You need this to valiate subscriptions)

  /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
  googleServiceAccount: {
    clientEmail: key.client_email,
    privateKey: key.private_key,
  },
});
// Not used
// const scope = ['https://www.googleapis.com/auth/androidpublisher'];
// const authClient = new google.auth.JWT(
//   key.client_email, // service acc email
//   '', // path to public key
//   key.private_key, // private key
//   scope, // scope
//   '',
// );

// OAuth2
// const request = require('request');
// const key = require('../../config/mobacon-oauth2.json');

// const pub = google.androidpublisher('v3');
// const authClient = new google.auth.OAuth2(
//   key.web.client_id,
//   key.web.client_secret,
//   key.web.redirect_uris,
// );

const getSubscription = ({ packageName, subscriptionId, purchaseToken }) => new Promise(async (resolve, reject) => {
  try {
    // console.log('packageName', packageName);
    // console.log('subscriptionId', subscriptionId);
    // console.log('purchaseToken', purchaseToken);
    // authClient.authorize().then(async (token) => {
    //   const result = await pub.purchases.subscriptions.get({
    //     packageName,
    //     subscriptionId,
    //     token: purchaseToken,
    //     oauth_token: token,
    //     auth: authClient,
    //   });
    //   resolve(result);
    // });
    iap.setup(async (err) => {
      if (err) {
        reject(err);
      }
      const receipt = {
        packageName,
        productId: subscriptionId,
        purchaseToken,
        subscription: true,
      };
      const result = await iap.validate(receipt).catch((error) => {
        reject(error);
      });
      // console.log('subscription result', result);
      resolve(result);
    });
  } catch (error) {
    reject(error);
  }
});

module.exports = {
  // authClient,
  // pub,
  getSubscription,
};
