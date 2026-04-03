const mongoose = require('mongoose');

const DEFAULT_PRODUCT_IMAGE = 'https://loremflickr.com/1200/900/icecream,dessert?lock=9090';

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
  description: {
    type: String,
    default: '',
    trim: true
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length <= 4;
      },
      message: 'A product can have at most 4 images'
    }
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

productSchema.pre('validate', function normalizeImages(next) {
  const normalized = [];

  if (Array.isArray(this.images)) {
    for (const img of this.images) {
      if (typeof img === 'string' && img.trim()) {
        normalized.push(img.trim());
      }
    }
  }

  if (!normalized.length && typeof this.image === 'string' && this.image.trim() && this.image.trim() !== DEFAULT_PRODUCT_IMAGE) {
    normalized.push(this.image.trim());
  }

  this.images = normalized.slice(0, 4);
  this.image = this.images[0] || '';
  next();
});

module.exports = mongoose.model('Product', productSchema);
