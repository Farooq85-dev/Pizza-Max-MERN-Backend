// Libraries Imports
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";
const ProductsCache = new NodeCache({ stdTTL: 604800 }); // At Least for 7 Days

// Local Imports
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../secrets/secrets.js";

// Clodinary Configs
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
import { Product } from "../models/products.model.js";

export const GetAllCategories = async (req, res) => {
  try {
    const categories = ProductsCache.get("getAllCategories");
    if (categories) {
      return res
        .status(StatusCodes.OK)
        .send({ categories, message: "Categories fetched successfully!" });
    } else {
      const categories = await Product.find().distinct("categoryName");
      return res
        .status(StatusCodes.OK)
        .send({ categories, message: "Categories fetched successfully!" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetAllProductsBasedOnCategories = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Please provide category name!" });
    }

    const products = ProductsCache.get("getAllProductsBasedOnCategories");
    if (products) {
      return res.status(StatusCodes.OK).send({
        products,
        message:
          "Product fetched  successfully on the base of respective category!",
      });
    } else {
      const products = await Product.find({ categoryName });
      return res.status(StatusCodes.OK).send({
        products,
        message:
          "Product fetched  successfully on the base of respective category!",
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

// Admin
export const AddProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryName } = req.body;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!name || !description || !price || !stock || !categoryName) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Something is missing!",
      });
    }

    const filePath = path.join(req?.file?.destination, req?.file?.filename);
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "Pizza-Max-App",
      transformation: [
        { width: 800, crop: "scale" },
        { fetch_format: "webp" },
        { quality: "auto:low" },
      ],
    });

    fs.unlinkSync(filePath);

    await Product.create({
      ...req.body,
      image: uploadResult?.url,
    });

    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllProductsBasedOnCategories");
    ProductsCache.del("allProducts");
    ProductsCache.del("getProductById");

    return res.status(StatusCodes.OK).send({
      message: "Product added successfully!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetAllProducts = async (req, res) => {
  try {
    // Check if the user has admin privileges
    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied! You do not have the required role.",
      });
    }

    // Check if products are already in the cache
    const products = ProductsCache.get("allProducts");
    if (products) {
      return res.status(StatusCodes.OK).send({
        products: products,
        message: "Products fetched successfully from cache!",
      });
    } else {
      const products = await Product.find();
      // Store the fetched products in the cache
      ProductsCache.set("allProducts", products);
      return res.status(StatusCodes.OK).send({
        products,
        message: "Products fetched successfully from the database!",
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const GetProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Something is missing!",
      });
    }

    const product = ProductsCache.get("getProductById");
    if (product) {
      return res.status(StatusCodes.OK).send({
        product,
        message: "Product founded successfully!",
      });
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Product not found!",
        });
      }
      ProductsCache.set("getProductById", product);
      return res.status(StatusCodes.OK).send({
        product,
        message: "Product founded successfully!",
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const UpdateProductById = async (req, res) => {
  try {
    const { name, description, price, stock, categoryName } = req.body;
    const { productId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Something is missing!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: "Product not found!",
      });
    }

    await Product.findByIdAndUpdate(productId, {
      $set: {
        name,
        description,
        stock,
        price,
        categoryName,
      },
    });

    ProductsCache.del("allProducts");
    ProductsCache.del("getProductById");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllProductsBasedOnCategories");

    return res.status(StatusCodes.OK).send({
      message: "Product updated successfully!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};

export const DeleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Permission denied you do not have the required role!",
      });
    }

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Something is missing!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: "Product not found!",
      });
    }

    await Product.findByIdAndDelete(productId);
    ProductsCache.del("allProducts");
    ProductsCache.del("getProductById");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllProductsBasedOnCategories");

    return res.status(StatusCodes.OK).send({
      message: "Product deleted successfully!",
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: error?.message });
  }
};
