// Libraries Imports
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Local Imports
import { User } from "../models/user.model.js";
import { ACCESS_TOKEN_SECRET } from "../secrets/secrets.js";
import { invalidToken, tokenNotFound } from "../messages/auth.message.js";
import { serverError } from "../messages/global.message.js";

const IsUserAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: tokenNotFound });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          message: invalidToken,
        });
      }
      return res.status(StatusCodes.UNAUTHORIZED).send({
        message: invalidToken,
      });
    }

    let user;
    try {
      user = await User.findById(decodedToken?.id);
    } catch (dbError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: serverError,
      });
    }

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: invalidToken });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export default IsUserAuthenticated;
