module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Requests', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      type: Sequelize.INTEGER,
    },
    operatorId: {
      references: { model: 'Operators', key: 'id' },
      type: Sequelize.INTEGER,
    },
    carrierId: {
      allowNull: false,
      references: { model: 'Carriers', key: 'id' },
      type: Sequelize.INTEGER,
    },
    billRef: {
      type: Sequelize.STRING(255),
    },
    status: {
      allowNull: false,
      defaultValue: 'Pending',
      type: Sequelize.ENUM('Pending', 'Accepted', 'Reviewed'),
    },
    memoId: {
      references: { model: 'Memos', key: 'id' },
      type: Sequelize.INTEGER,
    },
    offerId: {
      references: { model: 'Offers', key: 'id' },
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
  down: (queryInterface) => queryInterface.dropTable('Requests'),
};
