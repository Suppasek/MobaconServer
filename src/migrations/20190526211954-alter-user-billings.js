module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('UserBillings', 'signatureAndroid').then(() => queryInterface
    .removeColumn('UserBillings', 'purchaseTokenAndroid')
    .then(() => queryInterface
      .addColumn('UserBillings', 'signatureAndroid', {
        type: Sequelize.STRING(500),
      })
      .then(() => queryInterface.addColumn('UserBillings', 'purchaseTokenAndroid', {
        type: Sequelize.STRING(500),
      })))),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('UserBillings', 'signatureAndroid').then(() => queryInterface
    .removeColumn('UserBillings', 'purchaseTokenAndroid')
    .then(() => queryInterface
      .addColumn('UserBillings', 'signatureAndroid', {
        type: Sequelize.STRING,
      })
      .then(() => queryInterface.addColumn('UserBillings', 'purchaseTokenAndroid', {
        type: Sequelize.STRING,
      })))),
};
