module.exports = (sequelize, DataTypes) => {
  const Memos = sequelize.define('Memos', {
    message: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
  }, {});

  return Memos;
};
