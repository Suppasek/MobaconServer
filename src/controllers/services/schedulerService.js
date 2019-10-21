const schedule = require('node-schedule');
const moment = require('moment');
const { UserBillings } = require('../../models');

const iapConfig = require('../../config/iapConfig');
const iapService = require('./iapService');

const startIAP = () => {
  const job = schedule.scheduleJob(
    iapConfig.subscriptionInterval.rule,
    async () => {
      // TODO; check subscription's receipt
      console.log('Subscription checking schedule begin at time:', moment().format());
      const billings = await UserBillings.findAll();
      await billings.forEach(async billing => {
        console.log('\t- billing of user', billing.userId);
        await iapService.checkUserBillingByUserId(billing.userId);
      });
      console.log('Subscription checking schedule finish at time:', moment().format());
    },
  );
  return job;
};

module.exports = {
  startIAP,
};
