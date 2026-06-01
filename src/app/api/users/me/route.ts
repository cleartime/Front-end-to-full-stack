import { requireUser } from "@/server/auth";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}
