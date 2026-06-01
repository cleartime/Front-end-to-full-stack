import { requireUser } from "@/server/auth";
import { fail, HttpError, ok } from "@/server/http";
import { updateTaskStatus } from "@/server/tasks";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const task = await updateTaskStatus(id, user.id, await request.json());

    if (!task) {
      throw new HttpError(404, "TASK_NOT_FOUND", "任务不存在或无权访问");
    }

    return ok({ task });
  } catch (error) {
    return fail(error);
  }
}
