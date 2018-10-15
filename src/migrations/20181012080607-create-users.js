module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    phoneNumber: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(20),
    },
    carrier: {
      type: Sequelize.STRING(50),
    },
    password: {
      allowNull: false,
      type: Sequelize.STRING(255),
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
  down: (queryInterface) => queryInterface.dropTable('Users'),
};
