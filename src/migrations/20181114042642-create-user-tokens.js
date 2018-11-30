module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserTokens', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    token: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    banned: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
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
  down: (queryInterface) => queryInterface.dropTable('UserTokens'),
};