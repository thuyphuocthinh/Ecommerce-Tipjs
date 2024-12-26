"use strict";

const { BadRequestError } = require("../core/error.response");
const { Otp } = require("../models/otp.model");
const { User } = require("../models/user.model");

class UserService {
  static async checkRegisterEmailToken({ email = null, token = null }) {
    const otp = await Otp.findOne({ email, otp_token: token }).lean().exec();
    if (!otp) {
      throw new BadRequestError("Invalid token");
    }
    const user = await User.create({ email });
    // then send another email to user to send temporary password
    // request user to change password
    // password is expired in 2 hours for example
    // also create refresh and access token for user
    return {
      message: "Verify email successfully",
    };
  }

  static async newUser({ email = null, captcha = null }) {
    // check if email is already registered
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestError("Email already registered");
    }

    // check if captcha is valid
    // send otp to emai
    return {
      message: "Send otp to email successfully",
    };
  }
}

module.exports = UserService();
