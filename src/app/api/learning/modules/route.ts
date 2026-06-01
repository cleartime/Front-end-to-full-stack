import { requireUser } from "@/server/auth";
import { getPrisma } from "@/server/db";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireUser();
    const prisma = getPrisma();
    const modules = await prisma.learningModule.findMany({
      orderBy: { sequence: "asc" },
      select: {
        id: true,
        title: true,
        category: true,
        summary: true,
        status: true,
        progress: true,
        sequence: true,
        interviewFocus: true
      }
    });

    return ok(
      { modules },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60"
        }
      }
    );
  } catch (error) {
    return fail(error);
  }
}
