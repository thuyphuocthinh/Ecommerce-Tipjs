"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repository/cart.repo");
const { checkProduct } = require("../models/repository/product.repo");
const { getDiscountAmount } = require("./discount.service");

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
      const checkProduct = await checkProduct(item_products);
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
        shop_discounts.forEach(async (discount) => {
          const { total_price = 0, discount_amount = 0 } =
            await getDiscountAmount({
              code: discount.code,
              userId,
              shopId,
              products: checkProduct,
            });
          checkout_order.total_discount += discount_amount;
          if (discount_amount > 0) {
            itemCheckout.priceApplyDiscount = checkoutPrice - discount_amount;
          }
        });
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
  static async checkoutFinal({}) {}
}

module.exports = CheckoutService;
