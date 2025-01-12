// Libraries Imports
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

// Local Imports
import { router } from "../routes/routes.js";
import { allowedOrigins } from "../secrets/secrets.js";

// Creating Express App
const app = express();

// Using Hemlet To Ensure Security
app.use(helmet());

// Using Morgan To View Logs in Better Way
app.use(morgan("dev"));

// Using Express Rate Limiter to limit number of requests
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  statusCode: StatusCodes.TOO_MANY_REQUESTS, // Status Code for Too Many Requests
  message: "Too many requests. Please try again after 1 minutes!", // Message to display
});

app.use(limiter);

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

// Exporting Main App
export { app };
