"use strict";
const express = require("express");
const router = express.Router();
const { checkApiKey, checkPermissions } = require("../auth/checkAuth.js");
const { pushToLogDiscord } = require("../middlewares/index.js");

// add log to discord
router.use(pushToLogDiscord);

// check api key
router.use(checkApiKey);
router.use(checkPermissions("0000"));

router.use("/v1/api", require("./access/index.route.js"));
router.use("/v1/api/product", require("./product/index.route.js"));
router.use("/v1/api/discount", require("./discount/index.route.js"));
router.use("/v1/api/cart", require("./cart/index.route.js"));
router.use("/v1/api/checkout", require("./checkout/index.route.js"));
router.use("/v1/api/inventory", require("./inventory/index.route.js"));
router.use("/v1/api/comment", require("./comment/index.route.js"));

module.exports = router;
