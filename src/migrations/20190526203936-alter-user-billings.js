module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .removeColumn('UserBillings', 'dataAndroid')
    .then(() => queryInterface.removeColumn('UserBillings', 'transactionReceipt')),
  down: (queryInterface, Sequelize) => queryInterface
    .addColumn('UserBillings', 'dataAndroid', {
      type: Sequelize.STRING,
    })
    .then(() => queryInterface.addColumn('UserBillings', 'transactionReceipt', {
      type: Sequelize.STRING,
    })),
};
