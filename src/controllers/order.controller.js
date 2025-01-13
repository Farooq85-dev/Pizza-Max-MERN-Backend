// Libraries Imports
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";
const OrdersCache = new NodeCache({ stdTTL: 604800 }); // At Least for 2 Days

// Local Imports
import { Order } from "../models/order.model.js";
import { userRoles } from "../constants/constants.js";
import {
  orderPlaced,
  ordersFounded,
  orderFounded,
} from "../messages/order.message.js";
import {
  permissionDenied,
  serverError,
  somethingMissing,
} from "../messages/global.message.js";

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
        message: permissionDenied,
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
        .send({ message: somethingMissing });
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
      .send({ order, message: orderPlaced });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const GetAllOrdersOfLoggedInUser = async (req, res) => {
  try {
    if (req?.user?.role !== "user") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }
    const orders = OrdersCache.get("getAllOrdersOfLoggedInUser");
    if (orders) {
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: ordersFounded });
    } else {
      const orders = await Order.find({ userId: req?.user?._id });
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: ordersFounded });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

// Admin
export const GetAllOrders = async (req, res) => {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    const orders = OrdersCache.get("allOrders");
    if (orders) {
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: ordersFounded });
    } else {
      const orders = await Order.find();
      return res
        .status(StatusCodes.OK)
        .send({ orders, message: ordersFounded });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const GetSingleOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!orderId) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: somethingMissing });
    }
    const order = OrdersCache.get("getOrderById");
    if (order) {
      return res.status(StatusCodes.OK).send({ order, message: orderFounded });
    } else {
      const order = await Order.findById(orderId);
      return res.status(StatusCodes.OK).send({ order, message: orderFounded });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const UpdateOrderById = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!status || !orderId) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: somethingMissing });
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
      .send({ message: serverError });
  }
};
