import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { cache } from "react";
import { getRuntimeEnv } from "@/server/runtime-env";

function createPrismaClient(databaseUrl?: string) {
  const log = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  if (databaseUrl?.startsWith("postgres://") || databaseUrl?.startsWith("postgresql://")) {
    const adapter = new PrismaPg({ connectionString: databaseUrl, maxUses: 1 });
    return new PrismaClient({ adapter, log } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const getPrisma = cache(() => createPrismaClient(getRuntimeEnv().DATABASE_URL));
