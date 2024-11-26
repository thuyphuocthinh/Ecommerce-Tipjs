/**
 * 1. Generate discount code [Admin | Shop]
 * 2. Get all discount codes [User | Shop]
 * 3. Get all products by discount code [User]
 * 4. Get discount amount [User]
 * 5. Delete discount code [Admin | Shop]
 * 6. Cancel discount code [User]
 */

"use strict";

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectId } = require("../utils");
const { findAllProducts } = require("../models/repository/product.repo");
const {
  findAllDiscountCodeUnselect,
} = require("../models/repository/discount.repo");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shop_id,
      applied_for,
      min_order_value,
      product_ids = [],
      name,
      description,
      type,
      value,
      max_uses,
      used_count,
      max_uses_per_user,
    } = payload;
    // Kiem tra

    const isEmpty = false;
    Object.keys(payload).forEach((key) => {
      if (!payload[key]) {
        isEmpty = true;
      }
    });
    if (isEmpty) {
      throw new BadRequestError("Missed required fields");
    }
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired");
    }
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start_date must be before end_date");
    }
    // Tao discount
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: new convertToObjectId(shop_id),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists");
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_code: code,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_min_order_value: min_order_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_is_active: is_active,
      discount_applied_for: applied_for,
      discount_max_uses_per_user: max_uses_per_user,
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_product_ids: applied_for === "ALL" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {}

  static async getAllDiscountCodeByShop({ limit, page, shop_id }) {
    return findAllDiscountCodeUnselect({
      filter: {
        discount_shop_id: convertToObjectId(shop_id),
        discount_is_active: true,
      },
      limit: limit,
      page: +page,
      model: discountModel,
      unSelect: ["__v"],
    });
  }

  static async getProductsByDiscount({ code, shop_id, user_id, limit, page }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: new convertToObjectId(shop_id),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount does not exist or has expired");
    }
    // applied_for === "ALL" or "SPECIFIC"
    const { discount_applied_for, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applied_for === "ALL") {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    } else if (discount_applied_for === "SPECIFIC") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    }
    return products;
  }
}

module.exports = DiscountService;
