// Libraries Imports
import { StatusCodes } from "http-status-codes";

const FileUplaoder = async (req, res, next) => {
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

    req.file = req?.file;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export default FileUplaoder;
