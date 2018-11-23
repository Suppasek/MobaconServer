module.exports = (sequelize, DataTypes) => {
  const Requests = sequelize.define('Requests', {
    userId: {
      type: DataTypes.INTEGER,
    },
    operatorId: {
      type: DataTypes.INTEGER,
    },
    carrierId: {
      type: DataTypes.INTEGER,
    },
    billRef: {
      type: DataTypes.STRING(500),
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Reviewed'),
    },
    memoId: {
      type: DataTypes.INTEGER,
    },
    offerId: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  }, {});

  return Requests;
};
