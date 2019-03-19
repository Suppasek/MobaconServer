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
    imagePath: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(255),
    },
    family: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    verified: {
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.BOOLEAN,
    },
  }, {});

  return Users;
};
