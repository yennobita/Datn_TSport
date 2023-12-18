const User = require("../models/User");
const Session = require("../models/Session");
const ShoppingCart = require("../models/ShoppingCart");
const ProductOrder = require("../models/ProductOrder");

module.exports = async function (req, res, next) {
  if (req.user) {
    const session = await Session.findOne({ idUser: req.session.unauthId });
    
    if (session != null) {
      const shoppingCart = await ShoppingCart.findById(session.idShoppingCart);
      const user = await User.findOne({ email: req.user.email });

      if (!user.idShoppingCart) {
        await User.findOneAndUpdate(
          { email: req.user.email },
          { idShoppingCart: shoppingCart._id }
        );
        await Session.findByIdAndDelete(session._id);
      } else {
        try {
          const shoppingCartUser = await ShoppingCart.findById(
            user.idShoppingCart
          );

          if (!shoppingCartUser) {
            await User.findOneAndUpdate(
              { email: req.user.email },
              { idShoppingCart: shoppingCart._id }
            );
            await Session.findByIdAndDelete(session._id);
            return;
          }

          const newData = await checkDataShoppingCart(
            shoppingCart,
            shoppingCartUser
          );

          for await (let productOrder of newData) {
            await ProductOrder.findByIdAndUpdate(productOrder._id, {
              quantity: productOrder.quantity,
            });
          }

          await ShoppingCart.findByIdAndUpdate(user.idShoppingCart, {
            listProductOrder: newData.map((a) => a._id),
          });

          await Session.findByIdAndDelete(session._id);
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
  next();
};

async function checkDataShoppingCart(shoppingCart, shoppingCartUser) {
  const listProductOrder = (await Promise.all(

    shoppingCart.listProductOrder.map((idProductOrder) =>

      ProductOrder.findById(idProductOrder)

    )

  )).filter(product => product !== null); // Loại bỏ các kết quả null

  const listProductOrderUser = (await Promise.all(

    shoppingCartUser.listProductOrder.map((idProductOrderUser) =>

      ProductOrder.findById(idProductOrderUser)

    )

  )).filter(product => product !== null); // Loại bỏ các kết quả null

  const newData = [];

  for await (let productOrder of listProductOrderUser) {
    const item = containsProduct(productOrder.idProduct, listProductOrder);
    if (item != null) {
      item.quantity += productOrder.quantity;
      newData.push(item);
    } else {
      newData.push(productOrder);
    }
  }

  for await (let productOrder of listProductOrder) {
    const item = containsProduct(productOrder.idProduct, newData);
    if (item == null) {
      newData.push(productOrder);
    }
  }

  const dataDelete = listProductOrderUser.filter(
    (productOrder) => !containsProduct(productOrder.idProduct, newData)
  );

  for await (let productOrder of dataDelete) {
    await ProductOrder.findByIdAndDelete(productOrder._id);
  }

  return newData;
}

function containsProduct(idProduct, list) {
  return list.find((item) => item.idProduct === idProduct) || null;
}