module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define('Tokens', {
    token: {
      type: DataTypes.STRING(255),
    },
    expired: {
      type: DataTypes.DATE,
    },
  }, {});

  return Tokens;
};
