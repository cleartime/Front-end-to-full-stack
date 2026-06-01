import { requireUser } from "@/server/auth";
import { getPrisma } from "@/server/db";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();
    const prisma = getPrisma();
    const logs = await prisma.backendLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        level: true,
        service: true,
        message: true,
        durationMs: true,
        createdAt: true
      }
    });

    return ok({ logs });
  } catch (error) {
    return fail(error);
  }
}
