"use strict";

const { s3, PutObjectCommand } = require("../config/config.aws-s3");
const { BadRequestError } = require("../core/error.response");

class UploadAwsService {
  static async uploadImageFromLocalS3({ file }) {
    try {
      if (!file) {
        throw new BadRequestError("No file provided");
      }
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: "image/jpeg",
      });

      const result = await s3.send(command);
      return {
        message: "Image uploaded successfully",
        filename: result.Key,
        size: file.size,
        type: file.mimetype,
        path: file.path,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${result.Key}`,
      };
    } catch (error) {
      console.error(error);
      e;
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = UploadAwsService;
