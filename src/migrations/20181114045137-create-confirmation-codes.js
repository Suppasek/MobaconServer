module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ConfirmationCodes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    code: {
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    expired: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    createdBy: {
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      type: Sequelize.INTEGER,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('ConfirmationCodes'),
};
