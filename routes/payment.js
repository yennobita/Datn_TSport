const express = require("express");
const router = express.Router();
const controllerPayment = require("../controller/Payment");

router.get("/", controllerPayment.homePayment);
router.post("/", controllerPayment.homePost);
router.post("/pay", controllerPayment.postPayment);
router.get("/success", controllerPayment.successPayment);
router.get("/cancel", controllerPayment.cancelPayment);

// router.post("/create_payment_url", controllerPayment.createPaymentUrl);
// router.get("/vnpay_ipn", controllerPayment.vnpayIpn);
// router.get("/vnpay_return", controllerPayment.vnpayReturn);

module.exports = router;
