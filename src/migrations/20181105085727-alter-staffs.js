module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Staffs', 'verified', {
    allowNull: false,
    defaultValue: false,
    after: 'password',
    type: Sequelize.BOOLEAN,
  })
    .then(() => queryInterface.addIndex('Staffs', { fields: ['verified'], name: 'staffs_verified_idx' })),
  down: (queryInterface) => queryInterface.removeColumn('Staffs', 'verified'),
};
