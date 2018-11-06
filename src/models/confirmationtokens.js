module.exports = (sequelize, DataTypes) => {
  const ConfirmationTokens = sequelize.define('ConfirmationTokens', {
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  }, {});

  return ConfirmationTokens;
};
