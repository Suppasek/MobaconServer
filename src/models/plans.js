module.exports = (sequelize, DataTypes) => {
  const Plans = sequelize.define('Plans', {
    name: {
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(100),
    },
    chatEnabled: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
    historyEnabled: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
    startAt: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.DATE,
    },
    endAt: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.DATE,
    },
  }, {});

  return Plans;
};
