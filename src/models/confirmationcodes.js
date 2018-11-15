module.exports = (sequelize, DataTypes) => {
  const ConfirmationCodes = sequelize.define('ConfirmationCodes', {
    code: {
      allowNull: false,
      validate: {
        notEmpty: true,
        isNumeric: true,
        len: [4, 4],
      },
      type: DataTypes.STRING(4),
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
