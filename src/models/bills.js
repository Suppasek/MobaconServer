module.exports = (sequelize, DataTypes) => {
  const Bills = sequelize.define('Bills', {
    month: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.ENUM('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
    },
    amount: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    voiceUsed: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    smsUsed: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    internetUsed: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    voiceLimit: {
      type: DataTypes.INTEGER,
    },
    smsLimit: {
      type: DataTypes.INTEGER,
    },
    internetLimit: {
      type: DataTypes.INTEGER,
    },
    emissionAt: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.DATE,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
  }, {});

  return Bills;
};
