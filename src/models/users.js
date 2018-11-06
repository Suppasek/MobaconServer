module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phoneNumber: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(20),
      validate: {
        notEmpty: true,
        isNumeric: true,
        len: [9, 10],
      },
    },
    carrier: {
      type: DataTypes.STRING(50),
      validate: {
        notEmpty: true,
      },
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING(255),
      validate: {
        notEmpty: true,
      },
    },
    verified: {
      type: DataTypes.BOOLEAN,
    },
  }, {});

  return Users;
};
