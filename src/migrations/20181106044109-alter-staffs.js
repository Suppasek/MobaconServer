module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('Staffs', 'roleId')
    .then(() => queryInterface.addColumn('Staffs', 'roleId', {
      allowNull: false,
      references: { model: 'Roles', key: 'id' },
      after: 'id',
      type: Sequelize.INTEGER,
    })),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Staffs', 'roleId')
    .then(() => queryInterface.addColumn('Staffs', 'roleId', {
      allowNull: false,
      after: 'id',
      type: Sequelize.INTEGER,
    }))
    .then(() => queryInterface.addIndex('Staffs', { fields: ['roleId'], name: 'staffs_roleId_idx' })),
};
