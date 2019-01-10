const fs = require('fs');
const path = require('path');

const billIds = require('../mock_up/billIds');

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Requests', [{
    id: 1,
    userId: 1,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[0]._id,
    status: 'Reviewed',
    offerId: 1,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }, {
    id: 2,
    userId: 2,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[1]._id,
    status: 'Reviewed',
    offerId: 2,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }, {
    id: 3,
    userId: 3,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[2]._id,
    status: 'Reviewed',
    offerId: 3,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }, {
    id: 4,
    userId: 4,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[3]._id,
    status: 'Reviewed',
    offerId: 4,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }, {
    id: 5,
    userId: 5,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[4]._id,
    status: 'Reviewed',
    offerId: 5,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }, {
    id: 6,
    userId: 6,
    operatorId: 1,
    carrierId: 1,
    billRef: billIds.bills[5]._id,
    status: 'Reviewed',
    offerId: 6,
    createdAt: '2018-12-05 10:00:00',
    updatedAt: '2018-12-05 10:00:00',
  }]).then(() => {
    fs.unlinkSync(path.join(__dirname, '../mock_up/billIds.json'));
  }),
  down: (queryInterface) => queryInterface.bulkDelete('Requests', null, {}),
};
