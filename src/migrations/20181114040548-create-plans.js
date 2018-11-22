module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Plans', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    chatEnabled: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    historyEnabled: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    startAt: {
      type: Sequelize.DATE,
    },
    endAt: {
      type: Sequelize.DATE,
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
  down: (queryInterface) => queryInterface.dropTable('Plans'),
};
