const { Router } = require("express");
const router = Router();

const apiDiscount = require("./apiDiscount");

router.post("/", apiDiscount.applyDiscount);

module.exports = router;