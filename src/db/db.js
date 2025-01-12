import mongoose from "mongoose";
import { MONGODB_URI } from "../secrets/secrets.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGODB_URI}`);
    console.log("🚀 MONGODB connected SUCCESSFULLY 🚀");
  } catch (error) {
    console.log("😢 MONGODB connection FAILED 😢", error);
    process.exit(1);
  }
};

export default connectDB;
