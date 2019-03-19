module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Carriers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(10),
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
  down: (queryInterface) => queryInterface.dropTable('Carriers'),
};
