module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    roleId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    planId: {
      allowNull: false,
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
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(20),
    },
    password: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(500),
    },
    verified: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
  }, {});

  return Users;
};
