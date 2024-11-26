"use strict";

const inventoryModel = require("../inventory.model");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "Unknown",
}) => {
  return await inventoryModel.create({
    inventory_product_id: product_id,
    inventory_shop_id: shop_id,
    inventory_location: location,
    inventory_stock: stock,
  });
};

module.exports = {
  insertInventory,
};
