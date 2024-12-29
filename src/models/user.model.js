import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from "../env/secrets.js";

const UserModel = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name!"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email!"],
      unique: true,
      lowecase: true,
      trim: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return emailRegex.test(value);
        },
        message: "Please enter a valid email address!",
      },
    },
    anotherEmail: {
      type: String,
      lowecase: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return emailRegex.test(value);
        },
        message: "Please enter a valid email address!",
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [12, "Password cannot exceed 12 characters long"],
      required: [true, "Password must be at least 8 to 12 characters long!"],
    },
    avatar: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash Password On Every Time When Document Is Saved To Database
UserModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Injecting method to compare password when this function is called in any controller
UserModel.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Injecting method to assign Access Token
UserModel.methods.assignAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Injecting method to assign refresh token
UserModel.methods.assignRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.models.User || model("User", UserModel);
