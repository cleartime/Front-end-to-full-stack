import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getPrisma } from "@/server/db";
import { HttpError } from "@/server/http";
import { getRuntimeEnv } from "@/server/runtime-env";

const COOKIE_NAME = "fstl_session";

function getSecretKey() {
  const secret = getRuntimeEnv().AUTH_SECRET ?? "dev-secret-change-me-for-production";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey());
    const prisma = getPrisma();
    return prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        weeklyHours: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new HttpError(401, "UNAUTHENTICATED", "请先登录");
  }

  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "当前账号没有权限执行该操作");
  }

  return user;
}
