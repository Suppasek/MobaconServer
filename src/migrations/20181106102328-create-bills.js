module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Bills', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    month: {
      allowNull: false,
      type: Sequelize.ENUM('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
    },
    amount: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    voiceUsed: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    smsUsed: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    internetUsed: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    voiceLimit: {
      type: Sequelize.INTEGER,
    },
    smsLimit: {
      type: Sequelize.INTEGER,
    },
    internetLimit: {
      type: Sequelize.INTEGER,
    },
    emissionAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    paidAt: {
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
  })
    .then(() => queryInterface.addIndex('Bills', { fields: ['month'], name: 'bills_month_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['amount'], name: 'bills_amount_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['voiceUsed'], name: 'bills_voiceUsed_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['smsUsed'], name: 'bills_smsUsed_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['internetUsed'], name: 'bills_internetUsed_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['voiceLimit'], name: 'bills_voiceLimit_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['smsLimit'], name: 'bills_smsLimit_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['internetLimit'], name: 'bills_internetLimit_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['emissionAt'], name: 'bills_emissionAt_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['paidAt'], name: 'bills_paidAt_idx' }))
    .then(() => queryInterface.addIndex('Bills', { fields: ['createdAt'], name: 'bills_createdAt_idx' })),
  down: (queryInterface) => queryInterface.dropTable('Bills'),
};
