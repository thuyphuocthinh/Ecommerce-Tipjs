"use strict";

const KeyTokenModel = require("../models/KeyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const tokens = await KeyTokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });
      return tokens ? tokens : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
