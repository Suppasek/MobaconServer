module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Staffs', 'roleId', {
    allowNull: false,
    after: 'id',
    type: Sequelize.INTEGER,
  })
    .then(() => queryInterface.addIndex('Staffs', { fields: ['roleId'], name: 'staffs_roleId_idx' }))
    .then(() => queryInterface.addIndex('Staffs', { fields: ['carrier'], name: 'staffs_carrier_idx' })),
  down: (queryInterface) => queryInterface.removeColumn('Staffs', 'roleId')
    .then(() => queryInterface.removeIndex('Staffs', 'staffs_carrier_idx')),
};
