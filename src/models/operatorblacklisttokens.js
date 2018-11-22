module.exports = (sequelize, DataTypes) => {
  const OperatorBlacklistTokens = sequelize.define('OperatorBlacklistTokens', {
    token: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    createdBy: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return OperatorBlacklistTokens;
};
