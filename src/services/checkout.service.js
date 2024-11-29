"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repository/cart.repo");
const { checkProductServer } = require("../models/repository/product.repo");
const { removeAllProductsFromCart } = require("./cart.service");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  /*
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discount: [],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            },
            {
                shopId,
                shop_discount: [
                    {
                        shopId,
                        discountId,
                        discountCode
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }
  */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // Check cartId ton tai hay khong
    const foundCart = await findCartById(cartId);
    if (!foundCart) {
      throw new NotFoundError("Cart does not exist");
    }

    // tinh toan checkout_order
    const checkout_order = {
      total_price: 0,
      total_discount: 0,
      fee_ship: 0,
      total_paid: 0,
    };

    const shop_order_ids_new = [];

    // Tinh tong tien total_price
    // Moi item trong shop_order_ids chua cac san pham cua cung 1 shop
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      // check tung san pham trong order cua tung shop co ton tai hay khong
      const checkProduct = await checkProductServer(item_products);
      checkProduct.forEach((product) => {
        if (!product) throw new BadRequestError("Order Wrong");
      });
      // tinh tong tien don hang ban dau cua tung shop
      const checkoutPrice = checkProduct.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);
      checkout_order.total_price += checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceBeforeDiscount: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProduct,
      };
      // check su hop le cua shop_discounts
      if (shop_discounts.length > 0) {
        for (const discount of shop_discounts) {
          const { discount_amount } = await getDiscountAmount({
            code: discount.code,
            userId,
            shopId,
            products: checkProduct,
          });
          if (discount_amount > 0) {
            checkout_order.total_discount += discount_amount;
            itemCheckout.priceApplyDiscount = checkoutPrice - discount_amount;
          }
        }
      }

      // tong thanh toan cuoi cung cua tung shop
      checkout_order.total_paid += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    // tong thanh toan cuoi cung (tong tien - tong discount + tong fee ship)
    checkout_order.total_paid += checkout_order.fee_ship;
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // ~ place_order
  static async placeOrderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    // review again
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });
    // check lai mot lan nua xem san pham co vuot ton kho hay khong
    // get new array products (dung flatMap)
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProducts = [];
    for (const product of products) {
      const { productId, quantity } = product;
      // su dung optimistic, pessimitic => kiem tra ton kho qua ban
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProducts.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // check if co mot san pham het hang trong kho
    if (acquireProducts.includes(false)) {
      throw new BadRequestError(
        "Mot so san pham da duoc cap nhat, vui long quay lai gio hang"
      );
    }

    // Neu thanh cong het => tao mot new order
    const newOrder = new orderModel({
      order_user_id: userId,
      order_checkout: checkout_order,
      order_products: shop_order_ids_new,
      order_payment: {},
      order_shipping: {
        city: "Danang",
        country: "Vietnam",
        state: "Danang",
        street: "14 Doan Uan",
      },
    });
    await newOrder.save();

    // Neu tao order thanh cong => remove product trong cart
    await removeAllProductsFromCart({ cartId, userId });

    return newOrder;
  }

  // User lay nhieu order da dat
  static async getOrdersByUser({}) {}

  // User lay mot order da dat
  static async getOrderByUser({}) {}

  // User cancel order
  static async cancelOrderByUser({}) {}

  // Cap nhat order
  // Luu y: Cap nhat status van chuyen la do he thong + 3rd-party chu khong phai do shop
  static async updateOrderByShop({}) {}
}

module.exports = CheckoutService;
