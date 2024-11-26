"use strict";

const { unSelectData, getSelectData } = require("../../utils");

const findAllDiscountCodeUnselect = async ({
  filter,
  unSelect = [],
  limit = 50,
  page = 1,
  sort = "ctime",
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unSelectData(unSelect));
  return products;
};

const findAllDiscountCodeSelect = async ({
    filter,
    unSelect = [],
    limit = 50,
    page = 1,
    sort = "ctime",
    model,
  }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await model
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(unSelect));
    return products;
  };

module.exports = {
  findAllDiscountCodeUnselect,
  findAllDiscountCodeSelect
};
