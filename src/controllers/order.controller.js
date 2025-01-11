// Libraries Imports
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";
const OrdersCache = new NodeCache({ stdTTL: 604800 }); // At Least for 2 Days

// Local Imports
import { Order } from "../models/order.model.js";
import { userRoles } from "../constants.js";

export const PlaceOrder = async (req, res) => {
  try {
    let {
      userId,
      fullName,
      contactNumber,
      emailAddress,
      address,
      promoCode,
      deliveryPreference,
      subtotal,
      deliveryCharges,
      grandTotal,
      products,
    } = req.body;

    if (!userRoles.includes(req?.user?.role)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (
      !userId ||
      !fullName ||
      !contactNumber ||
      !emailAddress ||
      !address ||
      !promoCode ||
      !deliveryPreference ||
      !subtotal ||
      !deliveryCharges ||
      !grandTotal ||
      !products
    ) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }

    if (deliveryPreference === 100) {
      deliveryPreference = "standard";
    } else if (deliveryPreference === 200) {
      deliveryPreference = "express";
    } else if (deliveryPreference === 250) {
      deliveryPreference = "same day";
    }

    const order = await Order.create({
      ...req.body,
      deliveryPreference: deliveryPreference,
    });

    OrdersCache.del("allOrders");
    OrdersCache.del("getOrderById");
    OrdersCache.del("getAllOrdersOfLoggedInUser");

    return res
      .status(StatusCodes.CREATED)
      .send({ order, message: "Your order is placed successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetAllOrdersOfLoggedInUser = async (req, res) => {
  try {
    if (req?.user?.role !== "user") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }
    const orders = OrdersCache.get("getAllOrdersOfLoggedInUser");
    if (orders) {
      console.log("Cahced...");
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: "Your orders fetched successfully!" });
    } else {
      console.log("Not Cahced...");
      const orders = await Order.find({ userId: req?.user?._id });
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: "Your orders fetched successfully!" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

// Admin
export const GetAllOrders = async (req, res) => {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    const orders = OrdersCache.get("allOrders");
    if (orders) {
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: "Orders fetched successfully!" });
    } else {
      const orders = await Order.find();
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: "Orders fetched successfully!" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetSingleOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!orderId) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }
    const order = OrdersCache.get("getOrderById");
    if (order) {
      return res
        .status(StatusCodes.OK)
        .send({ order, message: "Order founded successfully!" });
    } else {
      const order = await Order.findById(orderId);
      return res
        .status(StatusCodes.OK)
        .send({ order, message: "Order founded successfully!" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const UpdateOrderById = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!status || !orderId) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }

    await Order.findByIdAndUpdate(orderId, {
      $set: {
        status,
      },
    });
    OrdersCache.del("allOrders");
    OrdersCache.del("getOrderById");
    OrdersCache.del("getAllOrdersOfLoggedInUser");

    return res
      .status(StatusCodes.OK)
      .send({ message: "Order is updated successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};
