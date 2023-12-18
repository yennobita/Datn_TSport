const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    name: { type: String, maxlength: 255 },
    details: String,
    quantity: { type: Schema.Types.Number },
    price: { type: Number },
    discount: { type: Number },
    image: { type: String },
    // size: { type: Number },
    // color: { type: String },
    category: { type: String, maxlength: 255 },
    idProduct: { type: String, maxlength: 255 },
    listImgExtra: [],
    listIdRating: [{ type: Schema.Types.ObjectId }],
    producer: { type: String, maxlength: 255 },
    att: {
      type: [
        {
          size: {
            type: String,
          },
          color: {
            type: String,
          },
        },
      ],
    },
  },
  { collection: "product" }
);

module.exports = mongoose.model("Product", Product);
