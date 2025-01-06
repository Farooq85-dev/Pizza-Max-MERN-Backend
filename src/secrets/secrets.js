// Libraries Imports
import dotenv from "dotenv";

// Dotenv Configs
dotenv.config({ path: "./.env" });

const PORT = process.env?.PORT || 3500;
const allowedOrigins = process.env?.CORS_ORIGIN.split(",");

const MONGODB_URI = process.env?.MONGODB_URI;
const REFRESH_TOKEN_SECRET = process.env?.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env?.REFRESH_TOKEN_EXPIRY;
const ACCESS_TOKEN_SECRET = process.env?.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env?.ACCESS_TOKEN_EXPIRY;
const CLOUDINARY_CLOUD_NAME = process.env?.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env?.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env?.CLOUDINARY_API_SECRET;

export {
  PORT,
  allowedOrigins,
  MONGODB_URI,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
};
