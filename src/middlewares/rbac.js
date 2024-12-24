"use strict";
const { AuthFailureError } = require("../core/error.response");
const rbac = require("./role.middleware");
/**
 *
 * @param {string} action // read, delete, update, create
 * @param {*} resource  // profile, balance
 * @returns
 */

export const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      const role_name = req.query.role;
      const permission = await rbac.can(role_name)[action](resource);
      if (!permission.granted) {
        throw new AuthFailureError("You are not allowed to do this action");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
