module.exports = (sequelize, DataTypes) => {
  const userBilling = sequelize.define(
    'userBilling',
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
      transactionReceipt: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.STRING,
      },
      transactionId: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.INTEGER,
      },
      transactionDate: DataTypes.DATE,
      purchaseTokenAndroid: DataTypes.STRING,
      autoRenewingAndroid: DataTypes.BOOLEAN,
      dataAndroid: DataTypes.STRING,
      signatureAndroid: DataTypes.STRING,
      originalTransactionDateIOS: DataTypes.DATE,
      originalTransactionIdentifierIOS: DataTypes.STRING,
    },
    {},
  );
  return userBilling;
};
