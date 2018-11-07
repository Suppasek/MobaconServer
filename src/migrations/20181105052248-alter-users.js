module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'roleId', {
    allowNull: false,
    after: 'id',
    type: Sequelize.INTEGER,
  })
    .then(() => queryInterface.addIndex('Users', { fields: ['roleId'], name: 'users_roleId_idx' }))
    .then(() => queryInterface.addIndex('Users', { fields: ['carrier'], name: 'users_carrier_idx' })),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'roleId')
    .then(() => queryInterface.removeIndex('Users', 'users_carrier_idx')),
};
