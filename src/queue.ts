import { Queue, Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  }
);

const prisma = new PrismaClient();

const tokenUpdateQueue = new Queue("token-update-queue", {
  connection,
});

// Worker to process token updates
new Worker(
  "token-update-queue",
  async () => {
    const users = await prisma.user.findMany();

    for (const user of users) {
      const newToken = randomUUID();
      console.log(
        `Updating token for ${user.email}: ${user.token} -> ${newToken}`
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { token: newToken },
      });
    }
  },
  { connection }
);

// Schedule cron job every minute
async function scheduleTokenUpdate() {
  await tokenUpdateQueue.add(
    "updateTokens",
    {},
    { repeat: { pattern: "* * * * *" } }
  );
}

export async function setupQueue() {
  await scheduleTokenUpdate();
  console.log("Cron job scheduled.");
}

export { tokenUpdateQueue };
