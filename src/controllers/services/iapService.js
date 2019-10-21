// Deprecreted this service!!!!!!!!!
const { UserBillings, Users } = require('../../models');
const IAPAndroid = require('./iap.android');
const iapConfig = require('../../config/iapConfig');
const { covertNumberToDate } = require('../../helpers/date');
const { getUserById } = require('./userService');
// const { Op } = require('sequelize');
const updateUserBillings = (id, subscription) => new Promise(async (resolve, reject) => {
  try {
    const {
      kind,
      expiryTimeMillis,
      startTimeMillis,
      autoRenewing: autoRenewingAndroid,
      cancelReason,
      priceAmountMicros,
    } = subscription;
    const updateData = {
      kind,
      startTimeDate: covertNumberToDate(startTimeMillis),
      expireDate: covertNumberToDate(expiryTimeMillis),
      autoRenewingAndroid,
      cancelReason,
      priceAmountMicros: parseInt(priceAmountMicros, 10),
    };

    const updater = await UserBillings.update(updateData, {
      where: {
        id,
      },
    });
    if (cancelReason) {
      resolve(false);
    } else {
      resolve(true);
    }
  } catch (err) {
    reject(err.message);
  }
});

const updateUserPlan = async (id, isPro) => {
  // if is pro change plan id to 2 or not change to 1.
  await Users.update({
    planId: isPro ? 2 : 1,
  }, {
    where: {
      id,
    },
  });
};

const checkUserBillingByUserId = userId => new Promise(async (resolve, reject) => {
  // console.log('Update user plan!!!');
  // TODO Update user plan
  const userBilling = await UserBillings.findOne({
    where: {
      userId,
    },
    raw: true,
  });
  if (userBilling) {
    // console.log('User billing', userBilling);
    const { productId, purchaseTokenAndroid: purchaseToken } = userBilling;
    if (purchaseToken) {
      // console.log('data', JSON.parse(transactionReceipt));
      // console.log('-----------------------');
      // console.log('transactionReceipt Raw', transactionReceipt);
      const receipt = {
        subscriptionId: productId,
        purchaseToken,
        packageName: iapConfig.androidPackageName,
      };
      try {
        const subscription = await IAPAndroid.getSubscription(receipt);
        const isPro = await updateUserBillings(userBilling.id, subscription);
        await updateUserPlan(userId, isPro);
        resolve(userId);
      } catch (error) {
        reject(error);
      }
    } else {
      // appleValidation();
    }
  }
});

const checkUserBillingByUser = user => new Promise(async (resolve, reject) => {
  try {
   // await checkUserBillingByUserId(user.id);
    const newUser = await getUserById(user.id);
    resolve(newUser);
  } catch (error) {
    reject(error);
  }
  // console.log('user auth', user);
});

module.exports = {
  checkUserBillingByUser,
  checkUserBillingByUserId,
};
