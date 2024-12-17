import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../env/secrets.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const UploadController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Please provide a file!",
      });
    }

    const filePath = path.join(req.file.destination, req.file.filename);

    // Upload to Cloudinary with conversion to WEBP format
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "MY-IMAGES",
      transformation: [
        { width: 800, crop: "scale" },
        { fetch_format: "webp" },
        { quality: "auto:low" },
      ],
    });

    // Cleanup: Remove the file from the local uploads folder after uploading to Cloudinary
    fs.unlinkSync(filePath);

    // Attach the file URL to req.body for where you eant to use
    req.image = uploadResult;
    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};
