module.exports = (sequelize, DataTypes) => {
  const Staffs = sequelize.define('Staffs', {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    carrier: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    verified: {
      type: DataTypes.ENUM('0', '1'),
    },
  }, {});

  return Staffs;
};
