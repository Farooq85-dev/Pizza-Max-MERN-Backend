import dotenv from "dotenv";

// Dotenv Configs
dotenv.config({ path: "./.env" });

const PORT = process.env?.PORT || 3500;
const allowedOrigins = process.env?.CORS_ORIGIN.split(",");
const MONGODB_URI = process.env?.MONGODB_URI;

export { PORT, allowedOrigins, MONGODB_URI };
