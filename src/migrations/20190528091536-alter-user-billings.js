module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .addColumn('UserBillings', 'transactionReceipt', {
      type: Sequelize.STRING(1024),
    })
    .then(() => queryInterface.addColumn('UserBillings', 'dataAndroid', {
      type: Sequelize.STRING(1024),
    })),

  down: (queryInterface, Sequelize) => queryInterface
    .removeColumn('UserBillings', 'transactionReceipt')
    .then(() => queryInterface.removeColumn('UserBillings', 'dataAndroid')),
};
