import { getPrisma } from "@/server/db";

export async function recordLog(input: {
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  message: string;
  durationMs?: number;
}) {
  const prisma = getPrisma();
  return prisma.backendLog.create({
    data: {
      level: input.level,
      service: input.service,
      message: input.message,
      durationMs: input.durationMs ?? 0
    }
  });
}
