module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Staffs', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    fullName: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    carrier: {
      type: Sequelize.STRING(50),
    },
    email: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(100),
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
  down: (queryInterface) => queryInterface.dropTable('Staffs'),
};
