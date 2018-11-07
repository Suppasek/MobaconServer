module.exports = (sequelize, DataTypes) => {
  const Requests = sequelize.define('Requests', {
    userId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    staffId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    billId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    status: {
      allowNull: false,
      defaultValue: 'Pending',
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
    },
  }, {});

  return Requests;
};
