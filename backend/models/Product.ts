
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  barcode: String,
  sku: String,
  category: String,
  price: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 0
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field on save
ProductSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
