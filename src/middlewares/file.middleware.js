// Libraries Imports
import { StatusCodes } from "http-status-codes";
import { fileNotFound, fileSize, fileType } from "../messages/file.message.js";
import { serverError } from "../messages/global.message.js";

const FileUplaoder = async (req, res, next) => {
  try {
    if (!req?.file) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: fileNotFound,
      });
    }

    if (req?.file?.mimetype !== "image/webp") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: fileType,
      });
    }

    if (req?.file?.size > 100000) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: fileSize,
      });
    }

    req.file = req?.file;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export default FileUplaoder;
