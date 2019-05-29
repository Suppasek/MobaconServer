module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserBillings', {
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
    upgradeInfomationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'UpgradeInfomations',
        key: 'id',
      },
    },
    kind: {
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
    paymentState: {
      type: Sequelize.INTEGER,
    },
    cancelReason: {
      type: Sequelize.STRING,
    },
    userCancellationTimeMillis: {
      type: Sequelize.DATE,
    },
    startTimeDate: {
      type: Sequelize.DATE,
    },
    expireDate: {
      type: Sequelize.STRING,
    },
    priceAmountMicros: {
      type: Sequelize.BIGINT,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('UserBillings'),
};
