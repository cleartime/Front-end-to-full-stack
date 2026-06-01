import { z } from "zod";
import { createSessionToken, setSessionCookie } from "@/server/auth";
import { getPrisma } from "@/server/db";
import { fail, getClientIp, HttpError, ok } from "@/server/http";
import { checkRateLimit } from "@/server/rate-limit";
import { verifyPassword } from "@/server/password";
import { recordLog } from "@/server/logs";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email("请输入合法邮箱"),
  password: z.string().min(8, "密码至少 8 位")
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = checkRateLimit({
      key: `login:${ip}`,
      limit: 8,
      windowMs: 60_000
    });

    if (!limited.allowed) {
      throw new HttpError(429, "RATE_LIMITED", "登录尝试过于频繁，请稍后再试");
    }

    const input = loginSchema.parse(await request.json());
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "邮箱或密码错误");
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    await setSessionCookie(token);
    await recordLog({
      level: "INFO",
      service: "auth",
      message: `User logged in: ${user.email}`,
      durationMs: 23
    });

    return ok({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        weeklyHours: user.weeklyHours
      },
      rateLimit: limited
    });
  } catch (error) {
    return fail(error);
  }
}
