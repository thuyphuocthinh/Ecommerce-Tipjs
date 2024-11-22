"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check su ton tai cua email
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError("Error: Shop already registered");
      }

      const hassPassword = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: hassPassword,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // create a pair of public/private key
        // rsa => unsymetric cryptopancy algo
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair(
          {
            userId: newShop._id,
            email,
          },
          privateKey,
          publicKey
        );

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
          refreshToken: tokens.refreshToken,
        });

        if (!keyStore) {
          throw new BadRequestError("Error: Public key string error");
        }

        return {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  static login = async ({ email, password, refreshToken = null }) => {
    try {
      console.log(">>> email: ", email);
      const foundShop = await findByEmail(email);
      if (!foundShop) {
        throw new BadRequestError("Shop not registered");
      }
      const match = bcrypt.compare(password, foundShop.password);
      if (!match) {
        throw new AuthFailureError("Invalid credentials");
      }

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const tokens = await createTokenPair(
        {
          userId: foundShop._id,
          email,
        },
        privateKey,
        publicKey
      );

      await KeyTokenService.createKeyToken({
        refreshToken: tokens.refreshToken,
        privateKey,
        publicKey,
        userId: foundShop._id,
      });

      return {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyTokenById(keyStore._id);
    return delKey;
  };
}

module.exports = AccessService;
