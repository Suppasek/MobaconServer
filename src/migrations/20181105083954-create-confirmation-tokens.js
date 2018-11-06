module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ConfirmationTokens', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    token: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(500),
    },
    createdBy: {
      allowNull: false,
      unique: true,
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
  down: (queryInterface) => queryInterface.dropTable('ConfirmationTokens'),
};
