const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  description: String,
  image: String,
  stock: {
    type: Boolean,
    default: true
  }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;