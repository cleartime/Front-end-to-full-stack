import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaPg } from "@prisma/adapter-pg";
import type { D1Database } from "@cloudflare/workers-types";
import { cache } from "react";
import { getRuntimeEnv } from "@/server/runtime-env";

function createPrismaClient(databaseUrl?: string, d1Database?: D1Database) {
  const log = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  if (d1Database) {
    const adapter = new PrismaD1(d1Database);
    return new PrismaClient({ adapter, log } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  if (databaseUrl?.startsWith("postgres://") || databaseUrl?.startsWith("postgresql://")) {
    const adapter = new PrismaPg({ connectionString: databaseUrl, maxUses: 1 });
    return new PrismaClient({ adapter, log } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const getPrisma = cache(() => {
  const env = getRuntimeEnv();
  return createPrismaClient(env.DATABASE_URL, env.DB);
});
