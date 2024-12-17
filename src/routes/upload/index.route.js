"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const uploadController = require("../../controllers/upload.controller");
const { uploadToDisk } = require("../../config/config.multer");
// const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.post("/fromUrl", asyncHandler(uploadController.uploadImgFromUrl));
router.post(
  "/fromLocal",
  uploadToDisk.single("file"),
  asyncHandler(uploadController.uploadImgFromLocal)
);
router.post(
  "/multiple/fromLocal",
  uploadToDisk.array("files", 3),
  asyncHandler(uploadController.uploadImagesFromLocal)
);

module.exports = router;
