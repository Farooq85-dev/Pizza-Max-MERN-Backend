import mongoose, { model, Schema } from "mongoose";

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name!"],
    },
    description: {
      type: String,
      trim: [true, "Please provide description!"],
    },
    price: {
      type: Number,
      required: [true, "Please provide price!"],
    },
    image: {
      type: String,
      trim: [true, "Please provide image!"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock availability!"],
      default: 0,
    },
    categoryName: {
      type: String,
      required: [true, "Please provide the category name of this product!"],
    },
  },
  {
    timestamps: true,
  }
);

export const Product =
  mongoose.models.Product || model("Product", productSchema);
