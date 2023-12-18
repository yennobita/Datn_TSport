const Session = require("../../models/Session");
const ShoppingCart = require("../../models/ShoppingCart");
const ProductOrder = require("../../models/ProductOrder");
const User = require("../../models/User");
const Product = require("../../models/Product");

module.exports = {
  addShoppingCart: async (req, res) => {
    try {
      const { idProduct, numProductOder, size, color } = req.body;
      const product = await Product.findOne({ idProduct: idProduct });
  
      let existingProductOrder = null;
      let shoppingCart = null;
  
      if (!req.user) {
        const session = await Session.findOne({ idUser: req.session.unauthId });
        shoppingCart = await ShoppingCart.findById(session.idShoppingCart);
      } else {
        const user = await User.findOne({ email: req.user.email });
        shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
      }
  
      for (const idProductOrder of shoppingCart.listProductOrder) {
        const productOrder = await ProductOrder.findById(idProductOrder);
        if (productOrder.idProduct === idProduct && productOrder.color === color && productOrder.size === size) {
          existingProductOrder = productOrder;
          break;
        }
      }
  
      if (existingProductOrder) {
        const count = existingProductOrder.quantity;
        await ProductOrder.findByIdAndUpdate(existingProductOrder._id, {
          quantity: count + parseInt(numProductOder),
        });
      } else {
        const productOrder = new ProductOrder({
          idProduct: idProduct,
          image: product.image,
          name: product.name,
          size, 
          color,
          unitPrice: product.price,
          quantity: parseInt(numProductOder),
        });
  
        const savedProductOrder = await productOrder.save();
  
        await ShoppingCart.findByIdAndUpdate(shoppingCart._id, {
          $push: { listProductOrder: savedProductOrder._id },
        });
      }
  
      return res.status(200).json({
        result: "Ok",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ result: "failed", message: error.message });
    }
  },
    

  getShoppingCart: async function (req, res) {
    try {
      let shoppingCart;
      var discount = 0;
      if (!req.user) {
        const session = await Session.findOne({ idUser: req.session.unauthId });
        if (!session) {
          return res.status(200).json({
            result: "No product order found",
            data: [],
          });
        }
        shoppingCart = await ShoppingCart.findById(session.idShoppingCart);
        discount = shoppingCart.discount
      } else {
        const user = await User.findOne({ email: req.user.email });
        shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
        discount = shoppingCart.discount
      }
  
      const listProductOrder = [];
      for await (let idProductOrder of shoppingCart.listProductOrder) {
        const productOrder = await ProductOrder.findById(idProductOrder);
        listProductOrder.push(productOrder);
      }
  
      return res.status(200).json({
        result: "Ok",
        data: listProductOrder,
        discount: discount,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ result: "failed", message: error.message });
    }
  },
  
  putRemoveProductOder: async (req, res) => {
    const { idProductOrder } = req.body;
    if (!req.user) {
      try {
        const session = await Session.findOne({
          idUser: req.session.unauthId,
        });
        const shoppingCart = await ShoppingCart.findByIdAndUpdate(
          session.idShoppingCart,
          {
            $pull: {
              listProductOrder: idProductOrder,
            },
          }
        );
        await ProductOrder.findByIdAndDelete(idProductOrder);
        res.status(200).json({ result: "Success" });
      } catch (error) {
        console.log(error);
        res.status(400).json({ result: "Failed" });
      }
    } else {
      try {
        const user = await User.findOne({ email: req.user.email });
        const shoppingCart = await ShoppingCart.findByIdAndUpdate(
          user.idShoppingCart,
          {
            $pull: {
              listProductOrder: idProductOrder,
            },
          }
        );
        await ProductOrder.findByIdAndDelete(idProductOrder);
        res.status(200).json({ result: "Success" });
      } catch (error) {
        console.log(error);
        res.status(400).json({ result: "Failed" });
      }
    }
  },
  putUpdateShoppingCart: async (req, res) => {
    const { listProductOrder } = req.body;
    try {
      for await (let item of listProductOrder) {
        await ProductOrder.findByIdAndUpdate(item.name, {
          quantity: parseInt(item.value),
        });
      }
      res.status(200).json({
        result: "Successfully update shopping cart",
      });
    } catch (error) {
      res.status(400).json({ result: "Failed to update shopping cart" });
    }
  },
};
function containsProduct(idProduct, list) {
  if (list.length <= 0) {
    return null;
  }
  for (let item of list) {
    if (item.idProduct === idProduct) {
      return item._id;
    }
  }
  return null;
}