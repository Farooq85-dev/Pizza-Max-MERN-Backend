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
