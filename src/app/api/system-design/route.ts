import { requireUser } from "@/server/auth";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

const architecture = {
  requestPath: [
    "Browser UI",
    "Next.js Route Handler",
    "Auth Guard",
    "Zod Validation",
    "Service Layer",
    "Prisma ORM",
    "SQLite Database"
  ],
  modules: [
    {
      name: "认证鉴权",
      detail: "httpOnly Cookie 保存 JWT；服务端校验用户；预留 RBAC。"
    },
    {
      name: "任务域模型",
      detail: "User 与 ProjectTask 一对多；列表接口支持分页、搜索、排序。"
    },
    {
      name: "数据一致性",
      detail: "创建和更新任务时使用 Prisma transaction 同步写审计日志。"
    },
    {
      name: "安全与稳定性",
      detail: "登录和 AI Mentor 接口有内存限流；输入统一走 Zod 校验。"
    },
    {
      name: "AI 工程扩展点",
      detail: "当前本地模拟流式输出；真实模型可替换 provider，保持前端协议不变。"
    }
  ],
  interviewAngles: [
    "如何把 SQLite 换成 PostgreSQL？",
    "为什么 Cookie 要 httpOnly / sameSite？",
    "列表页如何避免慢查询和 N+1？",
    "AI 流式接口失败时如何重试和降级？",
    "日志、监控、告警应该放在哪一层？"
  ]
};

export async function GET() {
  try {
    await requireUser();
    return ok({ architecture });
  } catch (error) {
    return fail(error);
  }
}
