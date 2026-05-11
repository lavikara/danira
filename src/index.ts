import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { prisma } from "./utils/prisma.js";
import { Router } from "express";

const router = Router();
const app = express();
const PORT = process.env.SERVER_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  const allStaffs = await prisma.student.findMany({
    include: {
      school: true,
      attendances: true,
      fees: true,
      subject: true,
    },
  });
  res.status(200).send({
    status: "success",
    data: allStaffs,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port 🗼 🗼 ${PORT} 🗼 🗼`);
});
