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
    staffId: {
      allowNull: false,
      references: { model: 'Staffs', key: 'id' },
      type: Sequelize.INTEGER,
    },
    billId: {
      allowNull: false,
      references: { model: 'Bills', key: 'id' },
      type: Sequelize.INTEGER,
    },
    status: {
      allowNull: false,
      defaultValue: 'Pending',
      type: Sequelize.ENUM('Pending', 'Accepted', 'Rejected'),
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })
    .then(() => queryInterface.addIndex('Requests', { fields: ['status'], name: 'requests_status_idx' }))
    .then(() => queryInterface.addIndex('Requests', { fields: ['createdAt'], name: 'requests_createdAt_idx' })),
  down: (queryInterface) => queryInterface.dropTable('Requests'),
};
