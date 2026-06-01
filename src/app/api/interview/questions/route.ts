import { requireUser } from "@/server/auth";
import { getPrisma } from "@/server/db";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireUser();
    const prisma = getPrisma();
    const searchParams = new URL(request.url).searchParams;
    const category = searchParams.get("category")?.trim();

    const questions = await prisma.interviewQuestion.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ difficulty: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        category: true,
        title: true,
        difficulty: true,
        status: true,
        answerHint: true
      }
    });

    const summary = questions.reduce<Record<string, number>>((acc, question) => {
      acc[question.category] = (acc[question.category] ?? 0) + 1;
      return acc;
    }, {});

    return ok({ questions, summary });
  } catch (error) {
    return fail(error);
  }
}
