const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CheckOut = new Schema(
  {
    email: { type: String, maxlength: 255 },
    numberPhone: { type: String, maxlength: 255 },
    idShoppingCart: { type: Schema.Types.ObjectId },
    note: { type: String, maxlength: 255 },
    status: { type: String, maxlength: 255 },
    purchasedTime: {
      type: String, // Định dạng ngày giờ trực tiếp thành chuỗi
      default: new Date().toString(), // Mặc định là ngày giờ hiện tại dưới dạng chuỗi
    },
  },
  { collection: "check-out" }
);

module.exports = mongoose.model("CheckOut", CheckOut);
