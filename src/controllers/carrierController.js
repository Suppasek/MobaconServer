const { Carriers } = require('../models');

const fetchAll = async (req, res) => {
  const carriers = await Carriers.findAll();
  res.status(200).json(carriers);
};

module.exports = {
  fetchAll,
};
