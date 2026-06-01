import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

type RuntimeEnv = {
  AUTH_SECRET?: string;
  DATABASE_URL?: string;
  DB?: D1Database;
  HYPERDRIVE?: {
    connectionString?: string;
  };
};

function getCloudflareEnv() {
  try {
    return getCloudflareContext().env as RuntimeEnv;
  } catch {
    return {};
  }
}

export function getRuntimeEnv() {
  const cloudflareEnv = getCloudflareEnv();

  return {
    AUTH_SECRET: cloudflareEnv.AUTH_SECRET ?? process.env.AUTH_SECRET,
    DATABASE_URL: cloudflareEnv.HYPERDRIVE?.connectionString ?? cloudflareEnv.DATABASE_URL ?? process.env.DATABASE_URL,
    DB: cloudflareEnv.DB
  };
}
