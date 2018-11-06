module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'roleId', {
    allowNull: false,
    type: Sequelize.INTEGER,
    after: 'id',
  })
    .then(() => queryInterface.addIndex('Users', ['roleId']))
    .then(() => queryInterface.addIndex('Users', ['carrier'])),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'roleId')
    .then(() => queryInterface.removeIndex('Users', ['carrier'])),
};
