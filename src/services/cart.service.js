/**
 * 1 - Add product to cart [User]
 * 2 - Reduce / Increase product quantity [User]
 * 3 - Get list products from cart [User]
 * 4 - Delete cart [User]
 * 5 - Delete cart item [User]
 */

const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateCartItemQuantity,
} = require("../models/repository/cart.repo");
const { convertToObjectId } = require("../utils");

class CartService {
  static async addProductToCart({ userId, product = {} }) {
    // check cart ton tai hay khong
    const userCart = await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });
    if (!userCart) {
      // tao gio hang moi neu gio hang chua ton tai
      return await createUserCart({
        userId,
        product,
      });
    }
    // neu gio hang ton tai nhung chua co san pham thi them san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }
    // neu gio hang ton tai va ton tai san pham => cap nhat so luong
    return await updateCartItemQuantity({
      userId,
      product
    });
  }
}

module.exports = CartService;
