import { clearSessionCookie, requireUser } from "@/server/auth";
import { fail, ok } from "@/server/http";
import { recordLog } from "@/server/logs";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireUser();
    await clearSessionCookie();
    await recordLog({
      level: "INFO",
      service: "auth",
      message: `User logged out: ${user.email}`,
      durationMs: 12
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
