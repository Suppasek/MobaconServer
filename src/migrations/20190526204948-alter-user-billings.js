module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('UserBillings', 'transactionId').then(() => queryInterface.addColumn('UserBillings', 'transactionId', {
    type: Sequelize.STRING,
  })),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('UserBillings', 'transactionId').then(() => queryInterface.addColumn('UserBillings', 'transactionId', {
    type: Sequelize.INTEGER,
  })),
};
