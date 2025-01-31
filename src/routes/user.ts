import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const router = Router();
const prisma = new PrismaClient();

router.post("/login", async (req: Request, res: Response) => {
  const { email } = req.body;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        token: randomUUID(),
      },
    });
  }

  res.json({ message: "Authenticated", user });
});

export default router;
