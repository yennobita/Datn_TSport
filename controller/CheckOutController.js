const ShoppingCart = require("../models/ShoppingCart");
const ProductOrder = require("../models/ProductOrder");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const CheckOut = require("../models/CheckOut");
const env = require("dotenv").config();
const toastr = require('express-toastr');
const Swal = require('sweetalert2')

module.exports = {
  getIndex: async (req, res) => {
    if (!req.user) {
      res.redirect("/login?error=notLoggedIn");
      return;
    }
    const user = await User.findOne({ email: req.user.email });
    const shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
    let listProductOrder = [];
    let sumPrice = 0;
    let price = sumPrice;
    var discount = 0;
    for await (let idProductOrder of shoppingCart.listProductOrder) {
      let productOrder = await ProductOrder.findById(idProductOrder).lean();
      productOrder.sumPriceProduct =
        productOrder.quantity * productOrder.unitPrice;
      sumPrice += productOrder.sumPriceProduct;
      listProductOrder.push(productOrder);
      console.log("lưuuwuwuwu", price)
      console.log("discount", discount)
      if(shoppingCart.discount){
        discount = shoppingCart.discount;
        price = sumPrice - discount
      }
      else{
        price = sumPrice
      }
    }
    

    console.log("giassss", price)
    console.log("discount", discount)

    const errorNumberPhone = req.query.error;
    const errorListProduct = req.query.errorListProduct;
    res.render("checkout/checkout", {
      discount,
      listProductOrder: listProductOrder,
      price,
      sumPrice,
      errorNumberPhone: errorNumberPhone,
      errorListProduct: errorListProduct,
      admin_url: process.env.ADMIN_URL,
    });
  },
  postCheckOut: async (req, res) => {
    try {
      const { numberPhone, emailUser, note } = req.body;
      if (!numberPhone || !validate(numberPhone)) {
        return res.redirect("/checkout?error=numberPhone");
      }

      const user = await User.findOne({ email: emailUser });
      const shoppingCartUser = await ShoppingCart.findById(user.idShoppingCart);
      const listProductOrderId = shoppingCartUser.listProductOrder;

      if (listProductOrderId.length <= 0) {
        return res.redirect("/checkout?errorListProduct=errorListProduct");
      }

      for await (let idProductOrder of listProductOrderId) {
        let productOrder = await ProductOrder.findById(idProductOrder).lean();
        let idProd = productOrder.idProduct
        let productDetail = await Product.findOne({ idProduct: idProd });

        if (productDetail) {
          // Giảm số lượng sản phẩm đã đặt hàng từ số lượng sản phẩm trong kho
          productDetail.quantity -= productOrder.quantity;
          // Đảm bảo số lượng sản phẩm không âm
          if (productDetail.quantity < 0) {
              // Xử lý lỗi hoặc thông báo không đủ sản phẩm trong kho
              return res.status(400).json({ message: 'Sản phẩm không đủ trong kho' });
          }
          // Lưu cập nhật số lượng sản phẩm trong kho
            await productDetail.save();
        } else {
            // Xử lý trường hợp sản phẩm không tồn tại trong kho
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
      }

      const newCheckOut = new CheckOut({
        email: req.user.email,
        numberPhone: numberPhone,
        idShoppingCart: user.idShoppingCart,
        note: note,
        status: "Pending",
      });

      await newCheckOut.save();

      const newShoppingCart = new ShoppingCart({
        listProductOrder: [],
        status: false,
        purchasedTime: new Date().toISOString(),
      });
      await newShoppingCart.save();

      await User.findOneAndUpdate(
        { email: req.user.email },
        {
          idShoppingCart: newShoppingCart._id,
          $addToSet: {
            listIdShoppingCartHistory: user.idShoppingCart,
          },
        }
      );
      await Notification.create({
        title: "Đặt hàng",
        content: `Khách hàng ${req.body.name} đã đặt hàng`,
        time: new Date().toLocaleString(),
        seen: false,
      });
      return res.redirect("/home?paymentSuccess=true");

    } catch (error) {
      console.log(error);
      return res.status(500).json({ result: "failed", message: error.message });
    }
  },
};
function validate(phone) {
  const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return regex.test(phone);
}
