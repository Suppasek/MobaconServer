module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    name: {
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(50),
    },
  }, {});

  return Roles;
};
