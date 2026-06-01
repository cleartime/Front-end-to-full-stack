import { z } from "zod";
import { requireUser } from "@/server/auth";
import { fail, getClientIp, HttpError } from "@/server/http";
import { recordLog } from "@/server/logs";
import { checkRateLimit } from "@/server/rate-limit";

export const runtime = "nodejs";

const mentorSchema = z.object({
  prompt: z.string().trim().min(6, "问题至少 6 个字符").max(800, "问题过长"),
  focus: z.enum(["roadmap", "interview", "backend", "system-design", "ai"]).default("roadmap")
});

function buildMentorAnswer(input: z.infer<typeof mentorSchema>, userName: string) {
  const focusMap: Record<typeof input.focus, string> = {
    roadmap: "学习路线",
    interview: "面试表达",
    backend: "后端工程",
    "system-design": "系统设计",
    ai: "AI 工程化"
  };

  return [
    `${userName}，我会按「${focusMap[input.focus]}」来拆。`,
    "",
    `你的问题：${input.prompt}`,
    "",
    "1. 先把前端优势转成全栈优势：组件化思维对应服务分层，状态管理对应领域状态，性能优化对应链路耗时。",
    "2. 每个后端知识点都要落到项目代码：接口、校验、事务、索引、日志、鉴权、限流和部署。",
    "3. 面试回答不要只背概念，要讲清楚这个项目里为什么这么做、替代方案是什么、风险在哪里。",
    "4. AI 方向重点不是会调用模型，而是会做权限边界、流式体验、输出校验、成本控制和评测。",
    "",
    "下一步建议：打开 docs/interview-topics.md，挑一个题，把答案写成「场景 -> 决策 -> 代码位置 -> 权衡」四段。"
  ].join("\n");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const ip = getClientIp(request);
    const limited = checkRateLimit({
      key: `mentor:${user.id}:${ip}`,
      limit: 12,
      windowMs: 60_000
    });

    if (!limited.allowed) {
      throw new HttpError(429, "RATE_LIMITED", "AI Mentor 调用过于频繁，请稍后再试");
    }

    const input = mentorSchema.parse(await request.json());
    const answer = buildMentorAnswer(input, user.name);
    const encoder = new TextEncoder();

    await recordLog({
      level: "INFO",
      service: "ai-mentor",
      message: `Generated mentor stream for focus=${input.focus}`,
      durationMs: 88
    });

    const stream = new ReadableStream({
      async start(controller) {
        for (const line of answer.split("\n")) {
          controller.enqueue(encoder.encode(`${line}\n`));
          await sleep(35);
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-RateLimit-Remaining": String(limited.remaining)
      }
    });
  } catch (error) {
    return fail(error);
  }
}
