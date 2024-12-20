import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import {
  GetAllOrdersOfLoggedInUser,
  PlaceOrder,
} from "../controllers/order.controller.js";
import { UploadController } from "../controllers/upload.controller.js";
import {
  AddAnotherEmail,
  ChangePassword,
  DeleteAvatar,
  LoginUser,
  LogoutUser,
  RegisterUser,
  UpdateName,
  UploadAvatar,
} from "../controllers/user.controller.js";
import { isUserAuthenticated } from "../middlewares/auth.middleware.js";
import { Upload } from "../middlewares/multer.middleware.js";
import {
  AddProduct,
  GetAllProducts,
  GetAllProductsCategories,
} from "../controllers/product.controller.js";

//Creating Router For All Requests
const router = Router();

// User Post Routes
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

// User Patch Routes
router.patch("/change-password", isUserAuthenticated, ChangePassword);
router.patch("/update-name", isUserAuthenticated, UpdateName);
router.patch("/delete-avatar", isUserAuthenticated, DeleteAvatar);

// Order Post Routes
router.post("/place-order", isUserAuthenticated, PlaceOrder);
router.post(
  "/get-all-order-single-user",
  isUserAuthenticated,
  GetAllOrdersOfLoggedInUser
);

// Product Post Routes
router.post(
  "/add-product",
  Upload.single("productImage"),
  UploadController,
  AddProduct
);
router.post("/get-all-products-categories", GetAllProductsCategories);
router.post("/get-all-products", GetAllProducts);

export { router };
