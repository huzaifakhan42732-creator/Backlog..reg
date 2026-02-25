const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // snapshot of product name
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 } // snapshot of unit price
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    zip: String,
    country: String
  },
  paymentMethod: String,
  transactionId: String
}, { timestamps: true });

// Instance method: update order status with validation
orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };
  if (!validTransitions[this.orderStatus].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.orderStatus} to ${newStatus}`);
  }
  this.orderStatus = newStatus;
  return this.save();
};

// Instance method: cancel order
orderSchema.methods.cancel = async function() {
  if (this.orderStatus === 'delivered' || this.orderStatus === 'cancelled') {
    throw new Error('Order cannot be cancelled');
  }
  this.orderStatus = 'cancelled';
  // Optionally restore stock: iterate items and increment product stock
  const Product = mongoose.model('Product');
  for (let item of this.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);