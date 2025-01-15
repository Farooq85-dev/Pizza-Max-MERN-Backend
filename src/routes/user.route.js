// Libraries Imports
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

// Local Imports

// User Imports
import {
  AddAnotherEmail,
  ChangePassword,
  DeleteAvatar,
  GetAllUsers,
  LoginUser,
  LogoutUser,
  RegisterUser,
  UpdateName,
  UploadAvatar,
} from "../controllers/user.controller.js";

// Auth Middlware
import IsUserAuthenticated from "../middlewares/auth.middleware.js";
// User Middlware
import IsUserExist from "../middlewares/isUser.middleware.js";
// Upload Moddliware
// import Multer from "../middlewares/multer.middleware.js";
// File Uploader Middleware
// import FileUplaoder from "../middlewares/file.middleware.js";
// Files Cleanup Middleware
// import FilesCleanup from "../middlewares/filesCleanup.middleware.js";

// Mini User Router
const userRouter = Router();

const LoginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 5 minutes
  limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  statusCode: StatusCodes.TOO_MANY_REQUESTS, // Status Code for Too Many Requests
  message: "Too many requests. Please try again after 2 minutes!", // Message to display
});

// POST: Register a new user
userRouter.post("/register", RegisterUser);

// POST: Login a user
userRouter.post("/login", LoginLimiter, LoginUser);

// POST: Logout a user
userRouter.post("/logout", IsUserAuthenticated, LogoutUser);

// GET: Chechk if user is true or false
userRouter.get("/authenticate", IsUserAuthenticated, IsUserExist);

// GET: Admin route to get all registered users
userRouter.get("/admin/users", IsUserAuthenticated, GetAllUsers);

// PUT: Update user name
userRouter.put("/name", IsUserAuthenticated, UpdateName);

// PUT: Change user password
userRouter.put("/password", IsUserAuthenticated, ChangePassword);

// POST: Add another email to the user profile
userRouter.post("/email", IsUserAuthenticated, AddAnotherEmail);

// POST: Upload user avatar (profile picture)
// userRouter.post(
//   "/avatar/upload",
//   IsUserAuthenticated,
//   Multer.single("userAvatar"),
//   FileUplaoder,
//   FilesCleanup,
//   UploadAvatar
// );

userRouter.post("/avatar/upload", IsUserAuthenticated, UploadAvatar);

// DELETE: Delete user avatar (remove profile picture)
userRouter.delete("/avatar", IsUserAuthenticated, DeleteAvatar);

export default userRouter;
