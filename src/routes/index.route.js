"use strict";
const express = require("express");
const { checkApiKey, checkPermissions } = require("../auth/checkAuth.js");
const router = express.Router();

// check api key
router.use(checkApiKey);
router.use(checkPermissions("0000"));

router.use("/v1/api", require("./access/index.route.js"));
router.use("/v1/api/product", require("./product/index.route.js"));
router.use("/v1/api/discount", require("./discount/index.route.js"));
router.use("/v1/api/cart", require("./cart/index.route.js"));
router.use("/v1/api/checkout", require("./checkout/index.route.js"));

module.exports = router;
