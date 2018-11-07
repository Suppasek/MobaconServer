module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('ConfirmationTokens', 'createdBy')
    .then(() => queryInterface.addColumn('ConfirmationTokens', 'createdBy', {
      allowNull: false,
      references: { model: 'Staffs', key: 'id' },
      after: 'token',
      type: Sequelize.INTEGER,
    })),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('ConfirmationTokens', 'createdBy')
    .then(() => queryInterface.addColumn('ConfirmationTokens', 'createdBy', {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER,
    })),
};
