module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Offers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    review: {
      type: Sequelize.STRING(500),
    },
    suggestion: {
      type: Sequelize.STRING(500),
    },
    liked: {
      type: Sequelize.BOOLEAN,
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
  down: (queryInterface) => queryInterface.dropTable('Offers'),
};
