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