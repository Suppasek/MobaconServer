const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  carrier: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  used: {
    minutes: {
      type: Number,
      required: true,
    },
    sms: {
      type: Number,
      required: true,
    },
    internet: {
      type: Number,
      required: true,
    },
  },
  limit: {
    minutes: {
      type: Number,
    },
    sms: {
      type: Number,
    },
    internet: {
      type: Number,
    },
  },
  emissionAt: {
    type: Date,
    required: true,
  },
  paidAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Bills', BillSchema);
