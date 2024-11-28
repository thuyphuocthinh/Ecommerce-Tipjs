"use strict";

const { SuccessResponse } = require("../core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  async checkoutReview(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }
}

module.exports = new CheckoutController();
