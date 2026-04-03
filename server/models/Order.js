const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    flavor: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  couponCode: {
    type: String,
    default: ''
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi'],
    default: 'cod'
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  promisedMinutes: {
    type: Number,
    default: 45,
    min: 1
  },
  estimatedDeliveryAt: {
    type: Date,
    default: null
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  invoiceSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
