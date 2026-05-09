import "source-map-support/register";
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const app = express();
const PORT = process.env.SERVER_PORT;

const userRouter = require("./routes/user");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port 🗼 🗼 ${PORT} 🗼 🗼`);
});
