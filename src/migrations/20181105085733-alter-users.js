module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'verified', {
    type: Sequelize.ENUM('0', '1'),
    allowNull: false,
    defaultValue: '0',
    after: 'password',
  })
    .then(() => queryInterface.addIndex('Users', ['verified'])),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'verified'),
};
