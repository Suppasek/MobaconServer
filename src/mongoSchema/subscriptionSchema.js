const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  receipt: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
