const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cone', 'cup', 'family pack', 'combo']
  },
  flavor: {
    type: String,
    required: [true, 'Flavor is required'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: ['small', 'medium', 'large']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  image: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ category: 1, available: 1 });
productSchema.index({ stock: 1 });

module.exports = mongoose.model('Product', productSchema);
