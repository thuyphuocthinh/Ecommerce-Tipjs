"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service.js");

class ProductController {
  createNewProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Created a new product successfully",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
