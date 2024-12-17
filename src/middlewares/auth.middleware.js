import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../env/secrets.js";
import { User } from "../models/user.model.js";

export const isUserAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Token not found. Please login!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          message: "Your token has expired. Please sign in again!",
        });
      }
      return res.status(StatusCodes.UNAUTHORIZED).send({
        message: "Invalid token. Please sign in again!",
      });
    }

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Invalid token!" });
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Error(error.message);
  }
};
