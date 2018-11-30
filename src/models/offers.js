module.exports = (sequelize, DataTypes) => {
  const Offers = sequelize.define('Offers', {
    minutes: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    sms: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    internet: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    cloudStorage: {
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
