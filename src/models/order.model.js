import mongoose, { model, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required!"],
      validate: {
        validator: function (value) {
          const phoneRegex = /^\+92[0-9]{10}$/;
          return phoneRegex.test(value);
        },
        message: "Phone number must follow +92XXXXXXXXXX format!",
      },
      trim: true,
    },
    emailAddress: {
      type: String,
      required: [true, "Email address is required!"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return emailRegex.test(value);
        },
        message: "Please enter a valid email address!",
      },
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    promoCode: {
      type: String,
      trim: true,
      default: null,
    },
    specialMessage: {
      type: String,
      trim: true,
    },
    deliveryPreference: {
      type: Number,
      enum: [100, 200, 250], 
      default: 100,
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required!"],
      min: [0, "Subtotal must be a positive number!"],
    },
    deliveryCharges: {
      type: Number,
      required: [true, "Delivery charges are required!"],
      min: [0, "Delivery charges must be a positive number!"],
    },
    grandTotal: {
      type: Number,
      required: [true, "Grand total amount is required!"],
      min: [0, "Grand total must be a positive number!"],
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
    },
    products: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Product name is required!"],
          },
          image: {
            type: String,
            required: [true, "Product image is required!"],
          },
          quantity: {
            type: Number,
            required: [true, "Product quantity is required!"],
            min: [1, "Quantity must be at least 1"],
          },
          price: {
            type: Number,
            required: [true, "Product price is required!"],
            min: [0, "Product price must be a positive number!"],
          },
        },
      ],
      validate: {
        validator: function (products) {
          return products.length > 0;
        },
        message: "At least one product must be included in the order!",
      },
      required: [true, "Products are required!"],
    },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || model("Order", OrderSchema);
