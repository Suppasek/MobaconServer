const moment = require('moment-timezone');
const rn = require('random-number');

const apiConfig = require('../config/APIConfig');
const billSchema = require('../mongoSchema/billSchema');

const numberRandom = (min, max) => rn({
  min,
  max,
  integer: true,
});
const getBillData = () => {
  const minutes = numberRandom(100, 500) * 2;
  const sms = numberRandom(50, 200) * 5;
  const internet = numberRandom(40, 100) * 10;

  return {
    amount: (minutes + sms + internet) + (minutes + sms + internet) * (40 / 100),
    used: {
      minutes,
      sms,
      internet,
    },
  };
};

const data = [];

for (let i = 1; i <= 12; i += 1) {
  data.push({
    userId: i,
    carrier: 1,
    ...getBillData(),
    emissionAt: moment().tz(apiConfig.timezone).add(numberRandom(-200, -25), 'hours'),
    paidAt: moment().tz(apiConfig.timezone).add(numberRandom(-24, -1), 'hours'),
  });
}

module.exports = async () => {
  await billSchema.deleteMany({});
  await billSchema.insertMany(data);
};
