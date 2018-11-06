module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'roleId', {
    allowNull: false,
    after: 'id',
    type: Sequelize.INTEGER,
  })
    .then(() => queryInterface.addIndex('Users', ['roleId']))
    .then(() => queryInterface.addIndex('Users', ['carrier'])),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'roleId')
    .then(() => queryInterface.removeIndex('Users', ['carrier'])),
};
