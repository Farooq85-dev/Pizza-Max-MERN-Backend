import { StatusCodes } from "http-status-codes";
import { Product } from "../models/products.model.js";

export const AddProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryName } = req.body;

    const image = req?.image?.url;

    if (!name || !description || !price || !image || !stock || !categoryName) {
      return res.status(StatusCodes.CREATED).send({
        message: "Something is missing!",
      });
    }

    const prodcut = await Product.create({
      ...req.body,
      image,
    });

    return res.status(StatusCodes.CREATED).send({
      prodcut,
      message: "Product added successfully!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetAllProductsCategories = async (req, res) => {
  try {
    const categories = await Product.find().distinct("categoryName");
    return res
      .status(StatusCodes.OK)
      .send({ categories, message: "Categories fetched successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetAllProducts = async (req, res) => {
  const { categoryName } = req.body;
  try {
    if (!categoryName) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .send({ message: "Please provide category name!" });
    }

    const products = await Product.find({ categoryName });

    return res.status(StatusCodes.OK).send({
      products,
      message:
        "Product fetched  successfully on the base of respective category!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};
