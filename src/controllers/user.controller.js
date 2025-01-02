import { StatusCodes } from "http-status-codes";
import { COOKIE_OPTIONS } from "../constants.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
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

const assignAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.assignAccessToken();
    const refreshToken = user.assignRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong while assigning referesh and access token"
    );
  }
};

export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }

    const isUserAlreadyExist = await User.findOne({ email });

    if (isUserAlreadyExist) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "You are already resgistered. Please Login!" });
    }

    const user = await User.create(req.body);

    return res
      .status(StatusCodes.CREATED)
      .send({ user, message: "User registered successfully!" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: "You are not resgistered yet. Please register yourself first!",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send({
        message:
          "Provided password is not correct. Please provide correct password!",
      });
    }

    const { accessToken, refreshToken } = await assignAccessAndRefereshTokens(
      user._id
    );
    return res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .send({
        user,
        message: "You have been login successfully!",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const LogoutUser = async (req, res) => {
  try {
    const logoutUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // Clear field from this user
        },
      },
      { new: true }
    );

    return res
      .status(StatusCodes.OK)
      .clearCookie("accessToken", COOKIE_OPTIONS)
      .clearCookie("refreshToken", COOKIE_OPTIONS)
      .send({ logoutUser, message: "You have been logout successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const UploadAvatar = async (req, res) => {
  try {
    const { image } = req;

    if (req?.user?.avatar) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please delete your previous image first!" });
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: image?.url,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(StatusCodes.OK)
      .send({ message: "Your image is uplaoded!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const UpdateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please enter name!" });
    }

    if (name === (await req.user?.name)) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please provide a new name!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          name: name,
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(StatusCodes.OK)
      .send({ updatedUser, message: "Your name is saved successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const AddAnotherEmail = async (req, res) => {
  try {
    const { secondaryEmail } = req.body;

    if (!secondaryEmail) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please enter email!" });
    }

    if (secondaryEmail === (await req.user?.anotherEmail)) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please provide a new email!" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          anotherEmail: secondaryEmail,
        },
      },
      {
        new: true,
      }
    ).select("-password");
    return res
      .status(StatusCodes.OK)
      .send({ updatedUser, message: "You email is saved successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }

    const isPasswordValid = await req.user.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send({
        message: "Provided password is wrong. Please provide correct pasword!",
      });
    }

    if (await req.user?.isPasswordCorrect(newPassword)) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please provide a new password!" });
    }

    req.user.password = newPassword;
    const modifiedUser = await req.user.save();

    return res.status(StatusCodes.OK).send({
      modifiedUser,
      message: "Your password is changed successfully!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const DeleteAvatar = async (req, res) => {
  try {
    const { avatarPublicId } = req.body;

    const match = avatarPublicId.match(/\/([^\/]+)\/([^\/]+)\.webp$/);
    if (match && match[1] && match[2]) {
      const folderName = match[1];
      const fileName = match[2];
      const id = `${folderName}/${fileName}`;

      const result = await cloudinary.uploader.destroy(id, {
        invalidate: true,
      });

      if (result.result === "not found") {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Invalid avatar!",
        });
      }
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          avatar: 1, // Clear this field from user
        },
      },
      {
        new: true,
      }
    ).select("-password");

    return res
      .status(StatusCodes.OK)
      .send({ message: "Your picture is deleted successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

// Admin
export const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res
      .status(StatusCodes.OK)
      .send({ users, message: "Users fetched successfully!" });
  } catch (error) {
    return res.status(StatusCodes.OK).send({ message: error?.message });
  }
};
