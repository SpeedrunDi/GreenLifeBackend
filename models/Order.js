const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  clientName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId
  },
  status: {
    type: Number,
    required: true,
    default: 1,
    enum: [1, 2, 3]
  },
  products: [{
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    count: {
      type: Number,
      required: true
    }
  }]
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;