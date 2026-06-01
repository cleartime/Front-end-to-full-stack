import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("fullstack123", 10);

  const user = await prisma.user.upsert({
    where: { email: "frontend@example.com" },
    update: {
      name: "前端转型同学",
      passwordHash,
      role: "FULLSTACK_LEARNER",
      level: "Frontend Senior",
      weeklyHours: 10
    },
    create: {
      email: "frontend@example.com",
      name: "前端转型同学",
      passwordHash,
      role: "FULLSTACK_LEARNER",
      level: "Frontend Senior",
      weeklyHours: 10
    }
  });

  await prisma.learningModule.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.interviewQuestion.deleteMany();
  await prisma.backendLog.deleteMany();

  await prisma.learningModule.createMany({
    data: [
      {
        title: "Node.js 与 HTTP 基础",
        category: "backend",
        summary: "理解事件循环、请求生命周期、中间件、错误处理和日志。",
        status: "DONE",
        progress: 100,
        sequence: 1,
        interviewFocus: "Node 事件循环、REST 状态码、幂等性"
      },
      {
        title: "数据库建模与 SQL",
        category: "database",
        summary: "用 Prisma + SQLite 练习关系建模、索引、分页和事务。",
        status: "IN_PROGRESS",
        progress: 72,
        sequence: 2,
        interviewFocus: "索引、N+1、事务隔离、分页性能"
      },
      {
        title: "认证、鉴权与安全",
        category: "security",
        summary: "实现 httpOnly Cookie、JWT、密码哈希、RBAC 和限流。",
        status: "IN_PROGRESS",
        progress: 58,
        sequence: 3,
        interviewFocus: "XSS/CSRF/CORS、JWT 续期、权限模型"
      },
      {
        title: "API 设计与可观测性",
        category: "api",
        summary: "统一响应、Zod 校验、错误码、日志、慢请求和接口演进。",
        status: "READY",
        progress: 35,
        sequence: 4,
        interviewFocus: "REST 资源设计、版本化、OpenAPI、监控"
      },
      {
        title: "AI 应用工程化",
        category: "ai",
        summary: "用流式接口模拟 AI Mentor，保留 provider adapter 扩展点。",
        status: "READY",
        progress: 25,
        sequence: 5,
        interviewFocus: "流式输出、prompt 注入、评测、成本与缓存"
      },
      {
        title: "部署、Docker 与系统设计",
        category: "devops",
        summary: "补齐容器化、环境变量、CI、缓存层和容量估算表达能力。",
        status: "LOCKED",
        progress: 10,
        sequence: 6,
        interviewFocus: "水平扩展、缓存穿透、队列、灰度发布"
      }
    ]
  });

  await prisma.projectTask.createMany({
    data: [
      {
        title: "实现任务列表的分页、搜索、排序",
        description: "从 URL query 解析参数，后端校验后返回 meta 信息。",
        type: "BACKEND",
        status: "DONE",
        priority: "HIGH",
        branch: "feature/tasks-pagination",
        storyPoints: 3,
        ownerId: user.id
      },
      {
        title: "给创建任务接口加入事务日志",
        description: "create task 和 backend log 必须在一个事务中提交。",
        type: "DATABASE",
        status: "IN_PROGRESS",
        priority: "HIGH",
        branch: "feature/transaction-log",
        storyPoints: 5,
        ownerId: user.id
      },
      {
        title: "补充登录接口的限流与错误码",
        description: "防暴力破解；错误响应不能泄漏账号是否存在。",
        type: "SECURITY",
        status: "REVIEW",
        priority: "CRITICAL",
        branch: "feature/auth-rate-limit",
        storyPoints: 3,
        ownerId: user.id
      },
      {
        title: "为 AI Mentor 接入真实模型 provider",
        description: "保持流式响应接口不变，替换本地模拟实现。",
        type: "AI",
        status: "TODO",
        priority: "MEDIUM",
        branch: "feature/ai-provider",
        storyPoints: 8,
        ownerId: user.id
      },
      {
        title: "写一份系统设计复盘",
        description: "围绕认证、任务流、日志、缓存、队列、部署讲清权衡。",
        type: "SYSTEM_DESIGN",
        status: "TODO",
        priority: "MEDIUM",
        branch: "docs/system-design-review",
        storyPoints: 2,
        ownerId: user.id
      },
      {
        title: "移动端训练台布局优化",
        description: "将三栏仪表盘折叠为顶部 tabs + 单列内容。",
        type: "FRONTEND",
        status: "IN_PROGRESS",
        priority: "LOW",
        branch: "feature/mobile-dashboard",
        storyPoints: 3,
        ownerId: user.id
      }
    ]
  });

  await prisma.interviewQuestion.createMany({
    data: [
      {
        category: "React/Next.js",
        title: "RSC、SSR、CSR、ISR 的边界分别是什么？什么时候选哪一个？",
        difficulty: "MEDIUM",
        status: "REVIEWED",
        answerHint: "从数据新鲜度、SEO、首屏、交互复杂度、缓存失效讲。"
      },
      {
        category: "Node.js",
        title: "Node.js 事件循环和微任务队列如何影响接口延迟？",
        difficulty: "MEDIUM",
        status: "NEW",
        answerHint: "说明 timers、poll、check、Promise microtask，并结合 CPU 密集任务。"
      },
      {
        category: "Database",
        title: "offset 分页为什么会慢？如何做 cursor pagination？",
        difficulty: "HARD",
        status: "NEW",
        answerHint: "解释扫描成本、稳定排序、复合索引和游标条件。"
      },
      {
        category: "Security",
        title: "httpOnly Cookie + JWT 还需要防 CSRF 吗？",
        difficulty: "HARD",
        status: "REVIEWED",
        answerHint: "Cookie 自动携带，仍要 SameSite、CSRF token 或双提交策略。"
      },
      {
        category: "System Design",
        title: "设计一个任务协作系统，如何处理权限、缓存、通知和审计？",
        difficulty: "HARD",
        status: "NEW",
        answerHint: "从领域模型、读写路径、缓存失效、消息队列、审计日志展开。"
      },
      {
        category: "AI Engineering",
        title: "AI 接口如何防 prompt injection、控制成本并评估输出质量？",
        difficulty: "MEDIUM",
        status: "NEW",
        answerHint: "输入边界、工具权限、输出校验、缓存、离线评测和人工兜底。"
      }
    ]
  });

  await prisma.backendLog.createMany({
    data: [
      {
        level: "INFO",
        service: "seed",
        message: "Demo database initialized",
        durationMs: 42
      },
      {
        level: "INFO",
        service: "auth",
        message: "Demo user ready: frontend@example.com",
        durationMs: 18
      },
      {
        level: "WARN",
        service: "tasks",
        message: "High priority security task is waiting for review",
        durationMs: 64
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
