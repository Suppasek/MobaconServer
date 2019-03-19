module.exports = (sequelize, DataTypes) => {
  const Requests = sequelize.define('Requests', {
    userId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    operatorId: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    carrierId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    billRef: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.STRING(255),
    },
    status: {
      allowNull: false,
      defaultValue: 'Pending',
      validate: {
        notEmpty: true,
      },
      type: DataTypes.ENUM('Pending', 'Accepted', 'Reviewed'),
    },
    memoId: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    offerId: {
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return Requests;
};
