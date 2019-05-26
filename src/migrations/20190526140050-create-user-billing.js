

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserBilling', {
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
    productId: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    transactionReceipt: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    transactionId: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    transactionDate: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    purchaseTokenAndroid: {
      type: Sequelize.STRING,
    },
    autoRenewingAndroid: {
      type: Sequelize.BOOLEAN,
    },
    dataAndroid: {
      type: Sequelize.STRING,
    },
    signatureAndroid: {
      type: Sequelize.STRING,
    },
    originalTransactionDateIOS: {
      type: Sequelize.DATE,
    },
    originalTransactionIdentifierIOS: {
      type: Sequelize.STRING,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('UserBilling'),
};
