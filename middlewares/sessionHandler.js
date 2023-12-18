const ShoppingCart = require("../models/ShoppingCart");
const Session = require("../models/Session");
const { uuid } = require("uuidv4");

module.exports = async function (req, res, next) {
  try {
    if (!req.session.unauthId) {
      req.session.unauthId = uuid();
      const shoppingCart = new ShoppingCart({
        listProductOrder: [],
        status: false,
      });
      const savedShoppingCart = await shoppingCart.save();

      const session = new Session({
        idUser: req.session.unauthId,
        idShoppingCart: savedShoppingCart._id,
      });
      await session.save();
    }
    next();
  } catch (error) {
    console.error("Lỗi khi xử lý shopping cart và session", error);
    res.status(500).render("errors/500", { error: error.message });
  }
};
