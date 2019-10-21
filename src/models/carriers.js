module.exports = (sequelize, DataTypes) => {
  const Carriers = sequelize.define('Carriers', {
    name: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(10),
    },
  }, {});

  return Carriers;
};
