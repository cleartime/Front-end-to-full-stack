import { requireUser } from "@/server/auth";
import { createTask, listTasks } from "@/server/tasks";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const result = await listTasks(new URL(request.url).searchParams, user.id);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const task = await createTask(user.id, await request.json());
    return ok({ task }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
