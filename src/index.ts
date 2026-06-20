import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { globalErrorHandler } from "./middleware/errorHandler/globalErrorHandler.js";

const app = express();
const PORT = process.env.SERVER_PORT;

import danira from "./routes/danira/daniraRouter.js";
import authRouter from "./routes/auth/authRouter.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

/**
 *    This route handles all kind of danira admin process
 *
 *    • 1   Signup single school
 */
app.use("/danira", danira);

/**
 *    This route handles all kind of onboarding process
 *
 *    • 1   Login of all types of user
 *    • 2   Forgot password
 *    • 3   Reset password
 */
app.use("/auth", authRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port 🗼 🗼 ${PORT} 🗼 🗼`);
});
