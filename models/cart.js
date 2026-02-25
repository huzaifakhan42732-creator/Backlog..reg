const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 } // snapshot at time of adding
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  totalPrice: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Instance method: add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  if (!product.hasStock(quantity)) throw new Error('Insufficient stock');

  const existingItem = this.items.find(item => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price; // update snapshot to current price?
  } else {
    this.items.push({ product: productId, quantity, price: product.price });
  }
  await this.calcTotalPrice();
  return this.save();
};

// Instance method: remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId);
  return this.calcTotalPrice().then(() => this.save());
};

// Instance method: update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, newQuantity) {
  if (newQuantity <= 0) return this.removeItem(productId);

  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  if (!product.hasStock(newQuantity)) throw new Error('Insufficient stock');

  const item = this.items.find(item => item.product.toString() === productId);
  if (!item) throw new Error('Item not in cart');
  item.quantity = newQuantity;
  item.price = product.price; // optional: update price
  await this.calcTotalPrice();
  return this.save();
};

// Instance method: calculate total price
cartSchema.methods.calcTotalPrice = function() {
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return Promise.resolve(this);
};

module.exports = mongoose.model('Cart', cartSchema);