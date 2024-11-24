"use strict";
const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProductsByUser)
);

router.use(authentication);
router.post("/create", asyncHandler(productController.createNewProduct));
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftProducts));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPulishedProducts)
);

module.exports = router;
