"use strict";

const KeyTokenModel = require("../models/KeyToken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const tokens = await KeyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens : null;
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };
      const tokens = await KeyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static getKeyPair = async ({ userId }) => {
    const keyPair = await KeyTokenModel.findOne({ user: userId });
    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    };
  };
}

module.exports = KeyTokenService;
