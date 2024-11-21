"use strict";

const jwt = require("jsonwebtoken");

const createTokenPair = async (payload, privateKey, publicKey) => {
  try {
    const accessToken = await jwt.sign(payload, privateKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("Verify error", err);
      } else {
        console.log("Decode verify:: ", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

module.exports = {
  createTokenPair,
};
