// Libraries Imports
import { Router } from "express";

// Local Imports
import {
  AddProduct,
  GetAllProductsBasedOnCategories,
  GetProductById,
  DeleteProductById,
  GetAllCategories,
  GetAllProducts,
  UpdateProductById,
} from "../controllers/product.controller.js";

// Auth Middlware
import IsUserAuthenticated from "../middlewares/auth.middleware.js";
// Upload Moddliware
import Multer from "../middlewares/multer.middleware.js";
// File Uploader
import FileUplaoder from "../middlewares/file.middleware.js";

// Mini Product Router
const productRouter = Router();

// GET: Get all product categories
productRouter.get("/categories", GetAllCategories);

// GET: Get all products based on categories
productRouter.get("/products/:categoryName", GetAllProductsBasedOnCategories);

// POST: Admin route to add a new product
productRouter.post(
  "/admin/product/add",
  IsUserAuthenticated,
  Multer.single("productImage"),
  FileUplaoder,
  AddProduct
);

// GET: Admin route to get all products
productRouter.get("/admin/products", IsUserAuthenticated, GetAllProducts);

// GET: Admin route to get a single product by ID
productRouter.get("/admin/product/:productId", IsUserAuthenticated, GetProductById);

// GET: Admin route to Update product by ID
productRouter.put(
  "/admin/product/:productId",
  IsUserAuthenticated,
  UpdateProductById
);

// DELETE: Admin route to delete a product by id
productRouter.delete(
  "/admin/product/:productId",
  IsUserAuthenticated,
  DeleteProductById
);

export default productRouter;
