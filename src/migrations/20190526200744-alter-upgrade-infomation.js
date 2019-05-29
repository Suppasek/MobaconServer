module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('UpgradeInfomations', 'userId', {
    after: 'id',
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    type: Sequelize.INTEGER,
  }),
  down: (queryInterface) => queryInterface.removeColumn('UpgradeInfomations', 'userId'),
};
