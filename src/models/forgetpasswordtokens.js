module.exports = (sequelize, DataTypes) => {
  const ForgetPasswordTokens = sequelize.define('ForgetPasswordTokens', {
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

  return ForgetPasswordTokens;
};
