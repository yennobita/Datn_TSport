const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShoppingCartSchema = new Schema(
  {
    listProductOrder: [{ type: Schema.Types.ObjectId }],
    status: { type: Schema.Types.Boolean },
    purchasedTime: {
      type: Date,
      default: Date.now  // Sử dụng Date.now để tự động lấy thời gian hiện tại
    },
    discount: String,
  },
  { collection: "shopping-cart" }
);

module.exports = mongoose.model("ShoppingCart", ShoppingCartSchema);
