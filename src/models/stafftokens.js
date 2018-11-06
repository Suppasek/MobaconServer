module.exports = (sequelize, DataTypes) => {
  const StaffTokens = sequelize.define('StaffTokens', {
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    expired: {
      type: DataTypes.DATE,
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

  return StaffTokens;
};
