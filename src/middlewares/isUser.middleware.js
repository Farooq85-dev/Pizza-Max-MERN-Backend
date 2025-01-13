import { StatusCodes } from "http-status-codes";
import { serverError } from "../messages/global.message.js";
import { userFound } from "../messages/isUser.message.js";

const IsUserExist = (req, res) => {
  try {
    const user = {
      _id: req?.user?._id,
      name: req?.user?.name,
      email: req?.user?.email,
      role: req?.user?.role,
      isVerfified: req?.user?.isVerfified,
      refreshToken: req?.user?.refreshToken,
      avatar: req?.user?.avatar,
      anotherEmail: req?.user?.anotherEmail,
    };

    return res.status(StatusCodes.OK).send({ user, message: userFound });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export default IsUserExist;
