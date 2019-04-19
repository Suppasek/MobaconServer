const schedule = require('node-schedule');
const iapConfig = require('../../config/iapConfig');

const set = () => {
  const job = schedule.scheduleJob(iapConfig.subscription.rule, () => {
    // TODO; check subscription's receipt
  });
  return job;
};

module.exports = {
  set,
};
