const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }], // array of image URLs
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  ratings: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

// Instance method: calculate discounted price
productSchema.methods.getDiscountedPrice = function(discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) throw new Error('Invalid discount');
  return this.price * (1 - discountPercent / 100);
};

// Instance method: check stock availability
productSchema.methods.hasStock = function(quantity) {
  return this.stock >= quantity;
};

// Static method: find products by category with pagination
productSchema.statics.findByCategory = function(categoryId, page = 1, limit = 10) {
  return this.find({ category: categoryId })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name');
};

module.exports = mongoose.model('Product', productSchema);