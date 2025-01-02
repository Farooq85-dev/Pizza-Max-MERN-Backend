import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./routes/routes.js";
import { allowedOrigins } from "./env/secrets.js";
import helmet from "helmet";
import morgan from "morgan";

// Creating Express App
const app = express();
app.use(helmet());
app.use(morgan("dev"));

// Using Cors To Allow Request From Only Allowed Origins
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Using Express JSON To Parse Data
app.use(express.json({ limit: "15kb" }));

// Using Cookie Parser To Parse Data
app.use(cookieParser());

// Using Cookie Parser To Parse Cookies
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//Creating Main Route For All Request
app.use("/api/v1/", router);

// Exporting App
export { app };
