// Libraries Imports
import { Router } from "express";

// Routes Imports
import orderRouter from "./order.route.js";
import productsRouter from "./product.route.js";
import userRouter from "./user.route.js";

// Creating Router For All Requests
const router = Router();

// Registering All Routes
router.use("/user", userRouter);
router.use("/product", productsRouter);
router.use("/order", orderRouter);

export { router };
