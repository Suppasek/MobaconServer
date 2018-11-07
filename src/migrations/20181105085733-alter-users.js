module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'verified', {
    allowNull: false,
    defaultValue: false,
    after: 'password',
    type: Sequelize.BOOLEAN,
  })
    .then(() => queryInterface.addIndex('Users', { fields: ['verified'], name: 'users_verified_idx' })),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'verified'),
};
