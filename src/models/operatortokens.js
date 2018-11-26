module.exports = (sequelize, DataTypes) => {
  const OperatorTokens = sequelize.define('OperatorTokens', {
    token: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    banned: {
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
    createdBy: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return OperatorTokens;
};
