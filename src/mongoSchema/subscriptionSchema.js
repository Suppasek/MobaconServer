const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  receipt: {
    service: {
      type: String,
    },
    data: {
      type: Object,
    },
  },
});

SubscriptionSchema.set('timestamps', true);

module.exports = mongoose.model('Subscription', SubscriptionSchema);
