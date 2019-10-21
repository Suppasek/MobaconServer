const { UpgradeInfomations, UserBillings } = require('../models');
const iapService = require('./services/iapService');
const { covertNumberToDate } = require('../helpers/date');

const subscriptionPro = async (req, res) => {
  const { body } = req;
  const { upgradeInfomations, subscriptionData } = body;
  if (!upgradeInfomations || !subscriptionData) {
    return res.status(400).json({
      message: 'upgradeInfomation & subscriptionPro require body',
    });
  }
  const { id: userId } = req.user;
  const {
    address,
    carrierSelected: carrierId,
    numberMember: numberOfMember,
  } = upgradeInfomations;
  // console.log('upgradeInfomations', upgradeInfomations);
  const upgrade = await UpgradeInfomations.create({
    userId,
    numberOfMember,
    carrierId,
    address,
  });
  const {
    autoRenewingAndroid,
    productId,
    purchaseToken: purchaseTokenAndroid,
    signatureAndroid,
    transactionDate: tsDate,
    transactionId,
    transactionReceipt,
    dataAndroid,
  } = subscriptionData;
  const transactionDate = covertNumberToDate(tsDate);
  // console.log('Transaction Date', transactionDate);
  const userBilling = await UserBillings.findOne({
    where: {
      userId,
    },
    raw: true,
  });
  const billingData = {
    userId,
    upgradeInfomationId: upgrade.id,
    autoRenewingAndroid,
    purchaseTokenAndroid,
    signatureAndroid,
    transactionDate,
    transactionId,
    transactionReceipt,
    dataAndroid,
    productId,
  };
  let billing;
  // if have exits user billing, Update it.
  if (userBilling) {
    billing = await UserBillings.update(billingData, {
      where: {
        userId: userBilling.userId,
      },
    });
  } else {
    billing = await UserBillings.create(billingData);
  }
  try {
    await iapService.checkUserBillingByUser(req.user);
    res.status(200).json({
      message: 'Success',
      data: { upgrade, billing },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Check user billing failed',
    });
  }
};

const buySubscription = async (req, res) => {
  const { planId } = req.params;
  switch (String(planId)) {
    case '1':
      subscriptionPro(req, res);
      break;
    default:
      res.status(400).json({
        message: 'Invalid plan name',
      });
  }
};

module.exports = {
  buySubscription,
};
