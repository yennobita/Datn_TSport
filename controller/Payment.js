const express = require("express");
const paypal = require("paypal-rest-sdk");
const config1 = require("./../config/keypaypal");
const moment = require("moment");
const router = express.Router();
let config = require("../config/default.json");
const ShoppingCart = require("../models/ShoppingCart");
const User = require("../models/User");
const CheckOut = require("../models/CheckOut");
const ProductOrder = require("../models/ProductOrder");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: config1.client_id,
  client_secret: config1.client_secret,
});

function homePayment(req, res) {
  if (!req.user) {
    res.redirect("/login?error=notLoggedIn");
    return;
  }
  res.render("payment/payment");
}
function homePost(req, res) {
  const sumPrice = req.body.price;
  console.log("sumPrice in /payment:", sumPrice);
  res.render("payment/payment", { sumPrice: sumPrice });
}

function postPayment(req, res) {
  const discount = req.body.discount
  const sumPrice = req.body.sumPrice;
  const sumtt = sumPrice - discount
  console.log("tongtien", sumtt);
  console.log("discount", discount);
  console.log("sumPrice", sumPrice);
  if (typeof sumPrice === "undefined" || sumPrice === null) {
    return res.status(400).send("Tổng tiền không khả dụng");
  }

  const exchangeRate = 24000;
  const totalInUSD = (sumtt / exchangeRate).toFixed(2);
  console.log(totalInUSD);
  if (parseFloat(totalInUSD) === 0) {
    console.error("Giá trị totalInUSD không hợp lệ (bằng 0).");
    return res.status(400).send("Giá trị totalInUSD không hợp lệ");
  }
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/success",
      cancel_url: "http://localhost:5000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Đơn hàng bạn đã mua ",
              sku: "001",
              price: totalInUSD,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: totalInUSD,
        },
        description: "Hat for the best team ever",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.error(error);
      console.log(JSON.stringify(error, null, 2));
      res.render("payment/cancel"); // Render the "cancel" template in case of an error
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
}
async function successPayment(req, res) {
  try {
    const { numberPhone, emailUser, note } = req.body;
    const user = await User.findOne({ email: req.user.email });
    const shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
    let listProductOrder = [];
    let sumPrice = 0;
    for await (let idProductOrder of shoppingCart.listProductOrder) {
      let productOrder = await ProductOrder.findById(idProductOrder).lean();
  
      productOrder.sumPriceProduct =
        productOrder.quantity * productOrder.unitPrice;
      sumPrice += productOrder.sumPriceProduct;
      listProductOrder.push(productOrder);
    }
  
  // 
  console.log("chạy tới đây rồi")
    const shoppingCartUser = await ShoppingCart.findById(user.idShoppingCart);
    if (shoppingCartUser.listProductOrder.length <= 0) {
      return res.redirect("/checkout?errorListProduct=errorListProduct");
    }
  
    const newCheckOut = new CheckOut({
      email: req.user.email,
      numberPhone: numberPhone,
      idShoppingCart: user.idShoppingCart,
      note: note,
      status: "Pending",
    });
  
    await newCheckOut.save();
  
    const newCart = await new ShoppingCart({ 
      listProductOrder: []
     }).save();
  
     console.log(newCart)
  
    await shoppingCartUser.save();
  
  // await ShoppingCart.findByIdAndUpdate(user.idShoppingCart, { listProductOrder: [] });
  
  // user.idShoppingCart = newShoppingCart._id;
  
  user.listIdShoppingCartHistory.push(user.idShoppingCart);
  user.idShoppingCart = newCart._id;
  
  await user.save();
  return res.redirect("/home?paymentSuccess=true");
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ result: "failed", message: error.message });
  }
}

function cancelPayment(req, res) {
  res.render("payment/cancel");
}

//vnpay
function createPaymentUrl(req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  let appconfig = require("../config/default.json");

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = appconfig.vnp_TmnCode;
  let secretKey = appconfig.vnp_HashSecret;
  let vnpUrl = appconfig.vnp_Url;
  let returnUrl = appconfig.vnp_ReturnUrl;
  let orderId = moment(date).format("DDHHmmss");
  let amount = req.body.sumPrice - req.body.discount;
  let bankCode = req.body.bankCode || "";
  let locale = req.body.language;
  // if (locale === null || locale === "") {
  locale = "vn";
  // }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  console.log("VNPAY Params:", vnp_Params);
  // Tiếp tục xử lý tạo chữ ký số và tạo URL như trong đoạn code trước
  // Log URL cuối cùng trước khi redirect
  console.log("VNPAY Payment URL:", vnpUrl);

  res.redirect(vnpUrl);
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
function vnpayIpn(req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  let orderId = vnp_Params["vnp_TxnRef"];
  let rspCode = vnp_Params["vnp_ResponseCode"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let app2config = require("../config/default.json");
  let secretKey = app2config.vnp_HashSecret;
  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
  //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
  //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

  let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
  let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
  if (secureHash === signed) {
    //kiểm tra checksum
    if (checkOrderId) {
      if (checkAmount) {
        if (paymentStatus == "0") {
          //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
          if (rspCode == "00") {
            //thanh cong
            //paymentStatus = '1'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
            res.status(200).json({ RspCode: "00", Message: "Success" });
          } else {
            //that bai
            //paymentStatus = '2'
            // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
            res.status(200).json({ RspCode: "00", Message: "Success" });
          }
        } else {
          res.status(200).json({
            RspCode: "02",
            Message: "This order has been updated to the payment status",
          });
        }
      } else {
        res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
      }
    } else {
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }
  } else {
    res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
}
async function vnpayReturn(req, res, next) {
  // 
  try {
    let vnp_Params = req.query;
  
    let secureHash = vnp_Params["vnp_SecureHash"];
  
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
  
    vnp_Params = sortObject(vnp_Params);
  
    let app2config3 = require("../config/default.json");
    let tmnCode = app2config3.vnp_TmnCode;
    let secretKey = app2config3.vnp_HashSecret;
  
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  
    const { numberPhone, emailUser, note } = req.body;
    const user = await User.findOne({ email: req.user.email });
    const shoppingCart = await ShoppingCart.findById(user.idShoppingCart);
    let listProductOrder = [];
    let sumPrice = 0;
    for await (let idProductOrder of shoppingCart.listProductOrder) {
      let productOrder = await ProductOrder.findById(idProductOrder).lean();
  
      productOrder.sumPriceProduct =
        productOrder.quantity * productOrder.unitPrice;
      sumPrice += productOrder.sumPriceProduct;
      listProductOrder.push(productOrder);
    }
  
  // 
  console.log("chạy tới đây rồi")
    const shoppingCartUser = await ShoppingCart.findById(user.idShoppingCart);
    if (shoppingCartUser.listProductOrder.length <= 0) {
      return res.redirect("/checkout?errorListProduct=errorListProduct");
    }
  
    const newCheckOut = new CheckOut({
      email: req.user.email,
      numberPhone: numberPhone,
      idShoppingCart: user.idShoppingCart,
      note: note,
      status: "Pending",
    });
  
    await newCheckOut.save();
  
    const newCart = await new ShoppingCart({ 
      listProductOrder: []
     }).save();
  
     console.log(newCart)
  
    await shoppingCartUser.save();
  
  // await ShoppingCart.findByIdAndUpdate(user.idShoppingCart, { listProductOrder: [] });
  
  // user.idShoppingCart = newShoppingCart._id;
  
  user.listIdShoppingCartHistory.push(user.idShoppingCart);
  user.idShoppingCart = newCart._id;
  
  await user.save();
  return res.redirect("/home?paymentSuccess=true");
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ result: "failed", message: error.message });
  }
   
  }

module.exports = {
  postPayment,
  successPayment,
  cancelPayment,
  homePayment,
  createPaymentUrl,
  sortObject,
  vnpayIpn,
  vnpayReturn,
  homePost,
};
