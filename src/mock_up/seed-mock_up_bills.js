const fs = require('fs');
const path = require('path');
const ObjectId = require('node-time-uuid');

const bills = [];
for (let i = 1; i <= 12; i += 1) {
  bills.push({
    id: new ObjectId().toString('hex'),
    month: i,
    amount: Math.floor(Math.random() * 500) + 1,
    used: {
      minutes: Math.floor(Math.random() * 200) + 1,
      sms: Math.floor(Math.random() * 50) + 1,
      internet: Math.floor(Math.random() * 50) + 1,
    },
    limit: {
      minutes: 300,
      sms: 70,
      internet: 60,
    },
    emissionAt: `2018-${(`0${i}`).slice(-2)}-05 10:00:00`,
    paidAt: `2018-${(`0${(i + 1) > 12 ? (i + 1) % 12 : i + 1}`).slice(-2)}-20 20:00:00`,
  });
}

const json = {
  bills,
};

fs.writeFile(path.join(__dirname, 'bills.json'), JSON.stringify(json), 'utf8', (err) => {
  if (err) console.log(err);
  else console.log('Run mock up billing seed successfully');
});
