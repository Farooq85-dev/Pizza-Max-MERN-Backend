// Libraries Imports
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import path from "path";

// Local Imports
import { COOKIE_OPTIONS, userRoles } from "../constants/constants.js";
import {
  permissionDenied,
  serverError,
  somethingMissing,
} from "../messages/global.message.js";
import {
  avatarUploaded,
  deletePreviousImg,
  imageUploaded,
  invalidAvatar,
  passwordChanged,
  providedPasswordNotCorrect,
  provideNewName,
  provideNewPassword,
  updateName,
  userAlreadyExists,
  userLogin,
  userLogout,
  userNotRegisteredYet,
  userRegistered,
  usersFounded,
} from "../messages/user.message.js";
import { User } from "../models/user.model.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../secrets/secrets.js";

// Cloudinary Configs
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const assignAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user?.assignAccessToken();
    const refreshToken = user?.assignRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(StatusCodes.INTERNAL_SERVER_ERROR, serverError);
  }
};

export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: somethingMissing });
    }

    const isUserAlreadyExist = await User.findOne({ email });

    if (isUserAlreadyExist) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: userAlreadyExists });
    }

    const user = await User.create(req.body);

    return res.status(StatusCodes.OK).send({ user, message: userRegistered });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: somethingMissing });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: userNotRegisteredYet,
      });
    }

    const isPasswordValid = await user?.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: providedPasswordNotCorrect,
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
        message: userLogin,
      });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const LogoutUser = async (req, res) => {
  try {
    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    await User.findByIdAndUpdate(req?.user?._id, {
      $unset: {
        refreshToken: 1, // Clear field from this user
      },
    });

    return res
      .status(StatusCodes.OK)
      .clearCookie("accessToken", COOKIE_OPTIONS)
      .clearCookie("refreshToken", COOKIE_OPTIONS)
      .send({ message: userLogout });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!currentPassword || !newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: somethingMissing });
    }

    const isPasswordValid = await req?.user?.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: providedPasswordNotCorrect,
      });
    }

    if (await req.user?.isPasswordCorrect(newPassword)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: provideNewPassword });
    }

    req.user.password = newPassword;
    await req.user.save();

    return res.status(StatusCodes.OK).send({
      message: passwordChanged,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const UploadAvatar = async (req, res) => {
  try {
    console.log(req.uploadedFiles);
    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (req?.user?.avatar) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: deletePreviousImg });
    }

    const filePath = path.join(req?.file?.destination, req?.file?.filename);
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "Pizza-Max-App",
      transformation: [
        { width: 800, crop: "scale" },
        { fetch_format: "webp" },
        { quality: "auto:low" },
      ],
    });

    fs.unlinkSync(filePath);

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: uploadResult?.url,
        },
      },
      {
        new: true,
      }
    );

    return res.status(StatusCodes.OK).send({ message: avatarUploaded });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const UpdateName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: somethingMissing });
    }

    if (name === (await req?.user?.name)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: provideNewName });
    }

    await User.findByIdAndUpdate(req?.user?._id, {
      $set: {
        name: name,
      },
    });

    return res.status(StatusCodes.OK).send({ message: updateName });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const AddAnotherEmail = async (req, res) => {
  try {
    const { secondaryEmail } = req.body;

    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!secondaryEmail) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Please enter email!" });
    }

    if (secondaryEmail === (await req?.user?.anotherEmail)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Please provide a new email!" });
    }

    await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        anotherEmail: secondaryEmail,
      },
    });
    return res
      .status(StatusCodes.OK)
      .send({ message: "You email is saved successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
};

export const DeleteAvatar = async (req, res) => {
  try {
    const { avatarPublicId } = req.body;

    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!avatarPublicId || typeof avatarPublicId !== "string") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: somethingMissing,
      });
    }

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
          message: invalidAvatar,
        });
      }
    }

    await User.findByIdAndUpdate(req?.user?._id, {
      $unset: {
        avatar: 1, // Clear this field from user
      },
    });

    return res.status(StatusCodes.OK).send({ message: imageUploaded });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

// Admin
export const GetAllUsers = async (req, res) => {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    const users = await User.find().select("-password");

    return res.status(StatusCodes.OK).send({ users, message: usersFounded });
  } catch (error) {
    return res.status(StatusCodes.OK).send({ message: serverError });
  }
};
