const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Roles = require('./roles')(sequelize, Sequelize);
db.Operators = require('./operators')(sequelize, Sequelize);
db.Users = require('./users')(sequelize, Sequelize);
db.Carriers = require('./carriers')(sequelize, Sequelize);
db.Memos = require('./memos')(sequelize, Sequelize);
db.Offers = require('./offers')(sequelize, Sequelize);
db.Requests = require('./requests')(sequelize, Sequelize);
db.Plans = require('./plans')(sequelize, Sequelize);

db.Operators.belongsTo(db.Roles, { foreignKey: 'roleId', as: 'role' });
db.Operators.hasMany(db.Requests, { foreignKey: 'operatorId', as: 'request' });
db.Users.belongsTo(db.Roles, { foreignKey: 'roleId', as: 'role' });
db.Users.belongsTo(db.Plans, { foreignKey: 'planId', as: 'plan' });
db.Requests.belongsTo(db.Operators, { foreignKey: 'operatorId', as: 'operator' });
db.Requests.belongsTo(db.Users, { foreignKey: 'userId', as: 'user' });
db.Requests.belongsTo(db.Carriers, { foreignKey: 'carrierId', as: 'carrier' });
db.Requests.belongsTo(db.Memos, { foreignKey: 'memoId', as: 'memo' });
db.Requests.belongsTo(db.Offers, { foreignKey: 'offerId', as: 'offer' });

module.exports = db;
