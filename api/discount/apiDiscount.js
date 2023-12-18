const Discount = require("../../models/Discount");
const ShoppingCart = require("../../models/ShoppingCart");
const User = require("../../models/User");

module.exports = {
  applyDiscount: async (req, res) => {
    try {
      const { discountCode } = req.body; 
      const discount = await Discount.findOne({ codeDiscount: discountCode });
      console.log(res.locals)
      console.log(res.locals.user)
      
      if (!discountCode) {
        return res.status(404).json({ message: "Vui lòng nhập mã giảm giá" });
      }
      if (!discount) {
        return res.status(404).json({ message: "Mã giảm giá không hợp lệ" });
      }

    const currentDate = new Date();
      if (currentDate < discount.dayStart || currentDate > discount.dayEnd) {
        return res.status(400).json({ message: "Mã giảm giá không còn hiệu lực" });
      }

      if(discount){
        const user = await User.findOne({ _id : res.locals.user.id });
       const check = await ShoppingCart.findByIdAndUpdate(
          { _id: user.idShoppingCart },
          {
            discount: discount.discount,
          }
        );
        console.log(check)
        console.log(discount.discount)
      }

    return res.status(200).json({ discount });
    } catch (err) {
      console.error(err);
      res.status(500).send("Lỗi Server Nội Bộ");
    }
  },
};