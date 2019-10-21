module.exports = (sequelize, DataTypes) => {
  const Offers = sequelize.define('Offers', {
    review: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    suggestion: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    liked: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
  }, {});

  return Offers;
};
