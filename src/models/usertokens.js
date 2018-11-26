module.exports = (sequelize, DataTypes) => {
  const UserTokens = sequelize.define('UserTokens', {
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

  return UserTokens;
};
