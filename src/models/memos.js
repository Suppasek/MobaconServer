'use strict';
module.exports = (sequelize, DataTypes) => {
  const Memos = sequelize.define('Memos', {
    message: DataTypes.STRING
  }, {});
  Memos.associate = function(models) {
    // associations can be defined here
  };
  return Memos;
};