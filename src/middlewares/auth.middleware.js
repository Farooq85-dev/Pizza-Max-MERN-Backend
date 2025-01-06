// Libraries Imports
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Local Imports
import { ACCESS_TOKEN_SECRET } from "../secrets/secrets.js";
import { User } from "../models/user.model.js";

const IsUserAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "Access token is required. Please login!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          message: "Token expired. Please login again!",
        });
      }
      return res.status(StatusCodes.UNAUTHORIZED).send({
        message: "Invalid token. Please login again!",
      });
    }

    let user;
    try {
      user = await User.findById(decodedToken?.id);
    } catch (dbError) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error fetching user data. Please try again later!",
      });
    }

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "User not found. Invalid token!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: "An unexpected error occurred. Please try again!" });
  }
};

export default IsUserAuthenticated;
