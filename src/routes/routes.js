import { Router } from "express";
import {
  AddAnotherEmail,
  ChangePassword,
  LoginUser,
  LogoutUser,
  RegisterUser,
  UploadAvatar,
  UpdateName,
  DeleteAvatar,
} from "../controllers/user.controller.js";
import { isUserAuthenticated } from "../middlewares/auth.middleware.js";
import { Upload } from "../middlewares/multer.middleware.js";
import { UploadController } from "../controllers/upload.controller.js";
import { StatusCodes } from "http-status-codes";

//Creating Router For All Requests
const router = Router();

// Post Routes
router.post("/register-user", RegisterUser);
router.post("/login-user", LoginUser);
router.post("/logout-user", isUserAuthenticated, LogoutUser);
router.post(
  "/upload-avatar",
  isUserAuthenticated,
  Upload.single("userAvatar"),
  UploadController,
  UploadAvatar
);
router.post("/add-email", isUserAuthenticated, AddAnotherEmail);
router.post("/is-user", isUserAuthenticated, (req, res) => {
  try {
    return res
      .status(StatusCodes.OK)
      .send({ user: req.user, message: "User founded successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error.message });
  }
});

// Patch Routes
router.patch("/change-password", isUserAuthenticated, ChangePassword);
router.patch("/update-name", isUserAuthenticated, UpdateName);
router.patch("/delete-avatar", isUserAuthenticated, DeleteAvatar);

export { router };
