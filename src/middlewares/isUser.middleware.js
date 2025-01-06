import { StatusCodes } from "http-status-codes";

const IsUserExist = (req, res) => {
  try {
    const user = {
      name: req?.user?.name,
      email: req?.user?.email,
      role: req?.user?.role,
      isVerfified: req?.user?.isVerfified,
      refreshToken: req?.user?.refreshToken,
      avatar: req?.user?.avatar,
      anotherEmail: req?.user?.anotherEmail,
    };

    return res
      .status(StatusCodes.OK)
      .send({ user, message: "User founded successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export default IsUserExist;
