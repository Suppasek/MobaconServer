module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Staffs', 'verified', {
    type: Sequelize.ENUM('0', '1'),
    allowNull: false,
    defaultValue: '0',
    after: 'password',
  })
    .then(() => queryInterface.addIndex('Staffs', ['verified'])),
  down: (queryInterface) => queryInterface.removeColumn('Staffs', 'verified'),
};
