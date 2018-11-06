module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Staffs', 'verified', {
    allowNull: false,
    defaultValue: false,
    after: 'password',
    type: Sequelize.BOOLEAN,
  })
    .then(() => queryInterface.addIndex('Staffs', ['verified'])),
  down: (queryInterface) => queryInterface.removeColumn('Staffs', 'verified'),
};
