module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('OperatorTokens', {
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
    createdBy: {
      allowNull: false,
      references: { model: 'Operators', key: 'id' },
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
  down: (queryInterface) => queryInterface.dropTable('OperatorTokens'),
};
