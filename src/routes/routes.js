import { Router } from "express";
import {
  AddAnotherEmail,
  ChangePassword,
  LoginUser,
  LogoutUser,
  RegisterUser,
  UploadAvatar,
  UpdateName,
} from "../controllers/user.controller.js";
import { isUserAuthenticated } from "../middlewares/auth.middleware.js";
import { Upload } from "../middlewares/multer.middleware.js";
import { UploadController } from "../controllers/upload.controller.js";

//Creating Router For All Requests
const router = Router();

// Post Routes
router.post("/register-user", RegisterUser);
router.post("/login-user", LoginUser);
router.post("/logout-user", isUserAuthenticated, LogoutUser);
router.post("/change-password", isUserAuthenticated, ChangePassword);
router.post(
  "/upload-avatar",
  isUserAuthenticated,
  Upload.single("userAvatar"),
  UploadController,
  UploadAvatar
);

// Patch Routes
router.patch("/add-email", isUserAuthenticated, AddAnotherEmail);
router.patch("/update-name", isUserAuthenticated, UpdateName);

export { router };
