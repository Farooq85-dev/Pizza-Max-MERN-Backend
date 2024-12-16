import connectDB from "./db/db.js";
import { app } from "./app.js";
import { PORT } from "./env/secrets.js";

// Connecting To Database
connectDB();

// Listening App
app.listen(PORT, () => {
  console.log(`---- Server is running at PORT:- ${process.env.PORT} ----`);
});
