module.exports = (sequelize, DataTypes) => {
  const UserBlacklistTokens = sequelize.define('UserBlacklistTokens', {
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

  return UserBlacklistTokens;
};
