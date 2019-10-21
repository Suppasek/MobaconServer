const moment = require('moment');

const covertNumberToDate = (date) => moment(parseInt(date, 10)).format('YYYY-MM-DD');

module.exports = {
  covertNumberToDate,
};
