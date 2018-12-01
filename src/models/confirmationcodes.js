module.exports = (sequelize, DataTypes) => {
  const ConfirmationCodes = sequelize.define('ConfirmationCodes', {
    code: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    expired: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.DATE,
    },
    createdBy: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return ConfirmationCodes;
};
