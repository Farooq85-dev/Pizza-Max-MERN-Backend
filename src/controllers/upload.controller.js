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
    if (!req?.file) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send({
        message: "Please provide a file!",
      });
    }

    if (req?.file?.mimetype !== "image/webp") {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send({
        message: "File must be in WEBP Format!",
      });
    }

    // if (req?.file?.size > 100000) {
    //   return res.status(StatusCodes.NOT_ACCEPTABLE).send({
    //     message: "File must be lower than 100 KB!",
    //   });
    // }

    const filePath = path.join(req.file.destination, req.file.filename);

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "Pizza-Max-App",
      transformation: [
        { width: 800, crop: "scale" },
        { fetch_format: "webp" },
        { quality: "auto:low" },
      ],
    });

    fs.unlinkSync(filePath);

    req.image = uploadResult;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};
