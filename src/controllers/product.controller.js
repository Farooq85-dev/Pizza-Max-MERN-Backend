// Libraries Imports
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import path from "path";
import NodeCache from "node-cache";
const ProductsCache = new NodeCache({ stdTTL: 604800 }); // At Least for 7 Days

// Local Imports
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../secrets/secrets.js";
import { Product } from "../models/products.model.js";
import {
  categoriesFounded,
  invalidProductImg,
  productAdded,
  ProductDeleted,
  productNotFound,
  productsFounded,
  productsOnCategory,
  productUpdate,
} from "../messages/product.messages.js";
import {
  permissionDenied,
  serverError,
  somethingMissing,
} from "../messages/global.message.js";

// Clodinary Configs
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const GetAllCategories = async (req, res) => {
  try {
    const categories = ProductsCache.get("getAllCategories");

    if (categories) {
      return res
        .status(StatusCodes.OK)
        .send({ categories, message: categoriesFounded });
    } else {
      const categories = await Product.find().distinct("categoryName");
      return res
        .status(StatusCodes.OK)
        .send({ categories, message: categories });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const GetAllProductsBasedOnCategories = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: somethingMissing });
    }

    const products = ProductsCache.get("getAllProductsBasedOnCategories");
    if (products) {
      return res.status(StatusCodes.OK).send({
        products,
        message: productsOnCategory,
      });
    } else {
      const products = await Product.find({ categoryName });
      return res.status(StatusCodes.OK).send({
        products,
        message: productsOnCategory,
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

// Admin
export const AddProduct = async (req, res) => {
  try {
    const { image, name, description, price, stock, categoryName } = req.body;
    console.log(req.body);

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!image || !name || !description || !price || !stock || !categoryName) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: somethingMissing,
      });
    }

    // const filePath = path.join(req?.file?.destination, req?.file?.filename);
    // const uploadResult = await cloudinary.uploader.upload(filePath, {
    //   folder: "Pizza-Max-App",
    //   transformation: [
    //     { width: 800, crop: "scale" },
    //     { fetch_format: "webp" },
    //     { quality: "auto:low" },
    //   ],
    // });

    // fs.unlinkSync(filePath);

    await Product.create(req.body);

    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllProductsBasedOnCategories");
    ProductsCache.del("allProducts");
    ProductsCache.del("getProductById");

    return res.status(StatusCodes.OK).send({
      message: productAdded,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const GetAllProducts = async (req, res) => {
  try {
    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    const products = ProductsCache.get("allProducts");
    if (products) {
      return res.status(StatusCodes.OK).send({
        products: products,
        message: productsFounded,
      });
    } else {
      const products = await Product.find();
      ProductsCache.set("allProducts", products);
      return res.status(StatusCodes.OK).send({
        products,
        message: productsFounded,
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const UpdateProductById = async (req, res) => {
  try {
    const { name, description, price, stock, categoryName } = req.body;
    const { productId } = req.params;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: somethingMissing,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: productNotFound,
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
      message: productUpdate,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};

export const DeleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const { productImgId } = req.body;

    if (req?.user?.role !== "admin") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: permissionDenied,
      });
    }

    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: somethingMissing,
      });
    }

    const match = productImgId.match(/\/([^\/]+)\/([^\/]+)\.webp$/);
    if (match && match[1] && match[2]) {
      const folderName = match[1];
      const fileName = match[2];
      const id = `${folderName}/${fileName}`;

      const result = await cloudinary.uploader.destroy(id, {
        invalidate: true,
      });

      if (result.result === "not found") {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: invalidProductImg,
        });
      }
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).send({
        message: productNotFound,
      });
    }

    await Product.findByIdAndDelete(productId);
    ProductsCache.del("allProducts");
    ProductsCache.del("getProductById");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllCategories");
    ProductsCache.del("getAllProductsBasedOnCategories");

    return res.status(StatusCodes.OK).send({
      message: ProductDeleted,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: serverError });
  }
};
