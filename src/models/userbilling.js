module.exports = (sequelize, DataTypes) => {
  const userBillings = sequelize.define(
    'UserBillings',
    {
      userId: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.INTEGER,
      },
      productId: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.STRING,
      },
      upgradeInfomationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionId: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.INTEGER,
      },
      kind: {
        type: DataTypes.STRING,
      },
      transactionDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      transactionReceipt: {
        type: DataTypes.STRING,
      },
      dataAndroid: {
        type: DataTypes.STRING,
      },
      purchaseTokenAndroid: {
        type: DataTypes.STRING,
      },
      autoRenewingAndroid: {
        type: DataTypes.BOOLEAN,
      },
      signatureAndroid: {
        type: DataTypes.STRING,
      },
      originalTransactionDateIOS: {
        type: DataTypes.DATE,
      },
      originalTransactionIdentifierIOS: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      paymentState: {
        type: DataTypes.INTEGER,
      },
      cancelReason: {
        type: DataTypes.STRING,
      },
      userCancellationTimeMillis: {
        type: DataTypes.DATE,
      },
      startTimeDate: {
        type: DataTypes.DATE,
      },
      expireDate: {
        type: DataTypes.STRING,
      },
      priceAmountMicros: {
        type: DataTypes.BIGINT,
      },
    },
    {},
  );
  return userBillings;
};
