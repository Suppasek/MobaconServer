const mongoose = require('mongoose');
const mongoConfig = require('../config/MongoConfig');

mongoose.connect(mongoConfig.mongoUri, {
  useNewUrlParser: true,
});
mongoose.set('useFindAndModify', false);

module.exports = {};
