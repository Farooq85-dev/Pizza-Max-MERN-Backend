import { StatusCodes } from "http-status-codes";

const IsUserExist = (req, res) => {
  try {
    return res
      .status(StatusCodes.OK)
      .send({ user: req?.user, message: "User founded successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export default IsUserExist;
