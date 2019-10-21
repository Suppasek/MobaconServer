const mongoose = require('mongoose');
const mongoConfig = require('../config/MongoConfig');

const createClient = () => {
  mongoose.connect(mongoConfig.mongoUri, {
    useNewUrlParser: true,
  });
  mongoose.set('useFindAndModify', false);
};

module.exports = {
  createClient,
};
