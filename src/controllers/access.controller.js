"use strict";

class AccessController {
  signUp = async (req, res, next) => {
    try {
      console.log(`SignUp:::`, req.body);
      return res.status(201).json({
        code: "20001",
        metadata: "Succcess",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
