const mongoose = require('mongoose');

const paymentWebhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventType: {
    type: String,
    default: ''
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  source: {
    type: String,
    default: 'razorpay'
  },
  payloadHash: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentWebhookEvent', paymentWebhookEventSchema);
