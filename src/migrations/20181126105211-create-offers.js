module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Offers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    minutes: {
      type: Sequelize.STRING(500),
    },
    sms: {
      type: Sequelize.STRING(500),
    },
    internet: {
      type: Sequelize.STRING(500),
    },
    cloudStorage: {
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
