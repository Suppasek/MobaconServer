const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
});

SubscriberSchema.set('timestamps', true);

module.exports = mongoose.model('Subscriber', SubscriberSchema);
