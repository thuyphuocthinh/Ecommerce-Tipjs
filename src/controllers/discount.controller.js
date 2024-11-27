const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.createDiscountCode(req.body),
    }).send(res);
  };

  updateDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.updateDiscountCode(req.body),
    }).send(res);
  };

  getAllDiscountCodeByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        limit: 50,
        page: 1,
        shop_id: req.user.userId,
      }),
    }).send(res);
  };

  getProductsByDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getProductsByDiscount({
        limit: 50,
        page: 1,
        shop_id: req.body.discount_shop_id,
        user_id: req.body.user_id,
        code: req.body.discount_code,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getDiscountAmount(req.body),
    }).send(res);
  };

  deleteDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.deleteDiscount(req.body),
    }).send(res);
  };

  cancelDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.cancelDiscount(req.body),
    });
  };
}

module.exports = new DiscountController();
