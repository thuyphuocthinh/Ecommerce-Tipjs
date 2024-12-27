"use strict";

const { Otp } = require("../models/otp.model");
const { BadRequestError } = require("../core/error.response");
const crypto = require("crypto");

class OtpService {
  static async generateToken() {
    return crypto.randomInt(0, Math.pow(2, 32));
  }

  static async newOtp({ email = null }) {
    // generate token
    const token = await OtpService.generateToken();

    // new otp
    const newOtp = await Otp.create({
      otp_email: email,
      otp_token: token,
    });

    return newOtp;
  }

  static async checkOtp({ email = null, token = null }) {
    const otp = await Otp.findOne({ email, otp_token: token }).lean().exec();
    if (!otp) {
      throw new BadRequestError("Invalid token");
    }
    // delete because we only use one time - and otp is valid
    await Otp.deleteOne({ email, otp_token: token });
    return otp;
  }
}

module.exports = OtpService;
