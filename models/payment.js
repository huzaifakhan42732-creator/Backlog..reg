const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  method: String,
  transactionId: String
}, { timestamps: true });

// Static method: mock payment processing
paymentSchema.statics.processPayment = async function(orderId, method) {
  const Order = mongoose.model('Order');
  const order = await Order.findById(orderId).populate('items.product');
  if (!order) throw new Error('Order not found');

  // Simulate payment gateway call
  const success = Math.random() > 0.1; // 90% success
  const status = success ? 'paid' : 'failed';
  const transactionId = success ? `mock_${Date.now()}` : null;

  const payment = await this.create({
    order: orderId,
    amount: order.totalPrice,
    method,
    status,
    transactionId
  });

  if (status === 'paid') {
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    // Decrement stock (since order is confirmed)
    for (let item of order.items) {
      await mongoose.model('Product').findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }
    await order.save();
  } else {
    order.paymentStatus = 'failed';
    await order.save();
  }

  return payment;
};

module.exports = mongoose.model('Payment', paymentSchema);