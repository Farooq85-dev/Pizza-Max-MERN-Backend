import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.model.js";

export const PlaceOrder = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      contactNumber,
      emailAddress,
      address,
      promoCode,
      specialMessage,
      deliveryPreference,
      subtotal,
      deliveryCharges,
      grandTotal,
      products,
    } = req.body;

    if (
      !userId ||
      !fullName ||
      !contactNumber ||
      !emailAddress ||
      !address ||
      !promoCode ||
      !specialMessage ||
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

    const order = await Order.create(req.body);

    return res
      .status(StatusCodes.CREATED)
      .send({ order, message: "Your order is placed successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.CREATED)
      .send({ message: "Your order is placed successfully!" });
  }
};

export const GetAllOrdersOfLoggedInUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req?.user?._id });

    return res
      .status(StatusCodes.OK)
      .send({ orders, message: "Your orders fetched successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

// Admin
export const GetAllOrders = async (_, res) => {
  try {
    const orders = await Order.find();

    return res
      .status(StatusCodes.OK)
      .send({ orders, message: "Orders fetched successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetSingleOrderById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please provide id of this order!" });
    }
    const order = await Order.findById(id);

    return res
      .status(StatusCodes.OK)
      .send({ order, message: "Order by Id fetched successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const UpdateOrderById = async (req, res) => {
  try {
    const { status, id } = req.body;

    if (!status || !id) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Something is missing!" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, {
      $set: {
        status,
      },
    });

    return res
      .status(StatusCodes.OK)
      .send({ updatedOrder, message: "Order is updated successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};
