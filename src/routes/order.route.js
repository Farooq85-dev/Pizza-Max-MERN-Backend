// Libraries Imports
import { Router } from "express";

// Local Imports
import {
  GetAllOrders,
  GetAllOrdersOfLoggedInUser,
  GetSingleOrderById,
  PlaceOrder,
  UpdateOrderById,
} from "../controllers/order.controller.js";
import IsUserAuthenticated from "../middlewares/auth.middleware.js";

// Mini Order Router
const orderRouter = Router();

// POST: Post route to place an order
orderRouter.post("/place", IsUserAuthenticated, PlaceOrder);

// GET: Get all orders of logged in user
orderRouter.get(
  "/user/orders",
  IsUserAuthenticated,
  GetAllOrdersOfLoggedInUser
);

// GET: Admin route to get all orders
orderRouter.get("/admin/orders", IsUserAuthenticated, GetAllOrders);

// GET: Admin route to get single order
orderRouter.get(
  "/admin/order/:orderId",
  IsUserAuthenticated,
  GetSingleOrderById
);

// GET: Admin route to update order
orderRouter.put("/admin/order/:orderId", IsUserAuthenticated, UpdateOrderById);

export default orderRouter;
