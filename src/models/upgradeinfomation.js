module.exports = (sequelize, DataTypes) => {
  const UpgradeInfomation = sequelize.define(
    'UpgradeInfomations',
    {
      userId: {
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        type: DataTypes.INTEGER,
      },
      numberOfMember: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      carrierId: { type: DataTypes.INTEGER, allowNull: false },
      address: {
        type: DataTypes.STRING,
      },
    },
    {},
  );
  return UpgradeInfomation;
};
