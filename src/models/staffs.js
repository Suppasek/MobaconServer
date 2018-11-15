module.exports = (sequelize, DataTypes) => {
  const Staffs = sequelize.define('Staffs', {
    roleId: {
      allowNull: false,
      defaultValue: 1,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    fullName: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(50),
    },
    phoneNumber: {
      validate: {
        notEmpty: true,
        isNumeric: true,
        len: [9, 10],
      },
      type: DataTypes.STRING(20),
    },
    email: {
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
      type: DataTypes.STRING(50),
    },
    password: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    verified: {
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
    activated: {
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
  }, {});

  return Staffs;
};
