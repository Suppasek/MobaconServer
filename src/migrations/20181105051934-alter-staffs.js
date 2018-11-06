module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Staffs', 'roleId', {
    allowNull: false,
    type: Sequelize.INTEGER,
    after: 'id',
  })
    .then(() => queryInterface.addIndex('Staffs', ['roleId']))
    .then(() => queryInterface.addIndex('Staffs', ['carrier'])),
  down: (queryInterface) => queryInterface.removeColumn('Staffs', 'roleId')
    .then(() => queryInterface.removeIndex('Staffs', ['carrier'])),
};
