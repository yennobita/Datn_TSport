const productRouter = require("./product");
const blogRouter = require("./blog");
const homeRouter = require("./home");
const userRouter = require("./user");
const checkOutRouter = require("./checkOut");
const paymentRouter = require("./payment");
const express = require("express");
const controller = require("../controller/Payment");
const discountRouter = require("../api/discount");

const controllerPayment = require("../controller/Payment");

const router = express.Router();

// const chatBotRouter = require("./chatbot");

function route(app) {
  app.use("/", userRouter);

  app.use("/home", homeRouter);
  app.use("/success",paymentRouter );

  app.use("/shop-grid", productRouter);

  app.get("/shop-details", function (req, res) {
    res.render("shop-details/shop-details");
  });

  app.get("/shoping-cart", function (req, res) {
    res.render("shoping-cart/shoping-cart");
  });

  app.use("/blog", blogRouter);

  app.get("/contact", function (req, res) {
    res.render("contact/contact");
  });

  app.get("/aboutUs", function (req, res) {
    res.render("aboutUs/aboutUs");
  });

  app.use("/discount", discountRouter);
  app.use("/checkout", checkOutRouter);

  app.use("/payment", paymentRouter);

  app.get("/", controllerPayment.homePayment);

  app.post("/pay", controllerPayment.postPayment);
  app.get("/success", controllerPayment.successPayment);

  // vnpay
  app.post("/create_payment_url", controllerPayment.createPaymentUrl);
  app.get("/vnpay_ipn", controllerPayment.vnpayIpn);
  app.get("/vnpay_return", controllerPayment.vnpayReturn);

  //app.use("/webhook",chatBotRouter);
}

module.exports = route;
