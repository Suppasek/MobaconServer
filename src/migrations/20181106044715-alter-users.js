module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'roleId')
    .then(() => queryInterface.addColumn('Users', 'roleId', {
      allowNull: false,
      references: { model: 'Roles', key: 'id' },
      after: 'id',
      type: Sequelize.INTEGER,
    })),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'roleId')
    .then(() => queryInterface.addColumn('Users', 'roleId', {
      allowNull: false,
      after: 'id',
      type: Sequelize.INTEGER,
    }))
    .then(() => queryInterface.addIndex('Users', ['roleId'])),
};
