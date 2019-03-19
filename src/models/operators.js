module.exports = (sequelize, DataTypes) => {
  const Operators = sequelize.define('Operators', {
    roleId: {
      allowNull: false,
      defaultValue: 1,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    fullName: {
      type: DataTypes.STRING(50),
    },
    phoneNumber: {
      validate: {
        isPhoneNumber: (value) => {
          const regex = new RegExp('^[0-9]*$', 'gm');
          if (!regex.test(value) || value.length > 20) {
            throw new Error('Validation on phoneNumber failed');
          }
        },
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
    imagePath: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(255),
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

  return Operators;
};
