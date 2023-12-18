const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Discount = new Schema(
  {
    title: { type: String, maxlenght: 200 },
    dayStart: { type: Date, maxlenght: 20 },
    dayEnd: { type: Date, maxlenght: 20 },
    codeDiscount: { type: String, maxlenght: 50 },
    discount: { type: Number, maxlenght: 10 },
    quantity: { type: Number, maxlenght: 10 },
    description: { type: String, maxlenght: 300 },
  },
  { collection: "discount" }
);

module.exports = mongoose.model("Discount", Discount);
