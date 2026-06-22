import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../../../generated/client.js";
import { logger } from "../../../utils/logger.js";

const connectionString = process.env.POSTGRES_URL || "";

const isAccelerate =
  connectionString.startsWith("prisma://") ||
  connectionString.startsWith("prisma+postgres://");

const logConfig = [
  { emit: "event" as const, level: "query" as const },
  { emit: "event" as const, level: "error" as const },
  { emit: "event" as const, level: "info" as const },
  { emit: "event" as const, level: "warn" as const },
];

function createExtendedClient(baseClient: PrismaClient) {
  return baseClient.$extends(withAccelerate());
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

const createClientInstance = () => {
  if (isAccelerate) {
    return new PrismaClient({
      log: logConfig,
      accelerateUrl: connectionString,
    });
  } else {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      log: logConfig,
      adapter,
    });
  }
};

const basePrisma = createClientInstance();

basePrisma.$on("query", (e) => {
  logger.debug(
    { query: e.query, duration: e.duration + "ms" },
    "Prisma Query Executed",
  );
});

basePrisma.$on("error", (e) =>
  logger.error({ message: e.message }, "Prisma DB Error"),
);
basePrisma.$on("warn", (e) =>
  logger.warn({ message: e.message }, "Prisma DB Warning"),
);
basePrisma.$on("info", (e) =>
  logger.info({ message: e.message }, "Prisma DB Info"),
);

export const prismaClient: ExtendedPrismaClient =
  basePrisma.$extends(withAccelerate());
