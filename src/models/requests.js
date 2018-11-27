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
      allowNull: false,
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
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
    offerId: {
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      type: DataTypes.INTEGER,
    },
  }, {});

  return Requests;
};
