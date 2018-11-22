module.exports = (sequelize, DataTypes) => {
  const ConfirmationTokens = sequelize.define('ConfirmationTokens', {
    userId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    token: {
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    expired: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.DATE,
    },
    createdBy: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return ConfirmationTokens;
};
