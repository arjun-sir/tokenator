import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import userRouter from "./routes/user";
import { setupQueue } from "./queue";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/api", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await setupQueue();
  console.log("Token update queue initialized");
});
