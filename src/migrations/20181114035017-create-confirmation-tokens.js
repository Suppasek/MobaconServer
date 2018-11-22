module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ConfirmationTokens', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      allowNull: false,
      references: { model: 'Operators', key: 'id' },
      type: Sequelize.INTEGER,
    },
    token: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    expired: {
      allowNull: false,
      type: Sequelize.DATE,
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
  })
    .then(() => queryInterface.addIndex('ConfirmationTokens', { fields: ['userId'], name: 'confirmationTokens_userId_idx' }))
    .then(() => queryInterface.addIndex('ConfirmationTokens', { fields: ['expired'], name: 'confirmationTokens_expired_idx' })),
  down: (queryInterface) => queryInterface.dropTable('ConfirmationTokens'),
};
