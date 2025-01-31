import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        token: randomUUID(),
      },
    });
    res.json({ message: "Authenticated", user });
  } else {
    res.json({
      message: "Already Authenticated, below are your details",
      user,
    });
  }
});

router.get("/user", async (req: Request, res: Response) => {
  // get user from email
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  res.json({ message: "User details", user });
});

export default router;
