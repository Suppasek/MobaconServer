module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Roles', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      unique: true,
      type: Sequelize.STRING(50),
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Roles'),
};
