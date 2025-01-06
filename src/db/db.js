import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { MONGODB_URI } from "../secrets/secrets.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log("---- MONGODB connected SUCCESSFULLY ----");
  } catch (error) {
    console.log("---- MONGODB connection FAILED ----", error);
    process.exit(1);
  }
};

export default connectDB;
