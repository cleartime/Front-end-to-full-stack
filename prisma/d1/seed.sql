PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'FULLSTACK_LEARNER',
  "level" TEXT NOT NULL DEFAULT 'Frontend Senior',
  "weeklyHours" INTEGER NOT NULL DEFAULT 8,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "LearningModule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'READY',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "sequence" INTEGER NOT NULL,
  "interviewFocus" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProjectTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "branch" TEXT NOT NULL,
  "storyPoints" INTEGER NOT NULL DEFAULT 2,
  "dueDate" DATETIME,
  "ownerId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "InterviewQuestion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "answerHint" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BackendLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "level" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "LearningModule_category_status_idx" ON "LearningModule" ("category", "status");
CREATE INDEX IF NOT EXISTS "LearningModule_sequence_idx" ON "LearningModule" ("sequence");
CREATE INDEX IF NOT EXISTS "ProjectTask_ownerId_updatedAt_idx" ON "ProjectTask" ("ownerId", "updatedAt");
CREATE INDEX IF NOT EXISTS "ProjectTask_status_priority_idx" ON "ProjectTask" ("status", "priority");
CREATE INDEX IF NOT EXISTS "ProjectTask_type_idx" ON "ProjectTask" ("type");
CREATE INDEX IF NOT EXISTS "InterviewQuestion_category_difficulty_idx" ON "InterviewQuestion" ("category", "difficulty");
CREATE INDEX IF NOT EXISTS "InterviewQuestion_status_idx" ON "InterviewQuestion" ("status");
CREATE INDEX IF NOT EXISTS "BackendLog_createdAt_idx" ON "BackendLog" ("createdAt");
CREATE INDEX IF NOT EXISTS "BackendLog_service_level_idx" ON "BackendLog" ("service", "level");

DELETE FROM "BackendLog";
DELETE FROM "InterviewQuestion";
DELETE FROM "ProjectTask";
DELETE FROM "LearningModule";
DELETE FROM "User";

INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "level", "weeklyHours") VALUES
('demo-user-frontend', 'frontend@example.com', '前端转型同学', '$2b$10$kzpyWmUkz/j0OsnO4Gce5OyvxjQGGvi3hvZHfeGzvGo/Xq7aYDhKy', 'FULLSTACK_LEARNER', 'Frontend Senior', 10);

INSERT INTO "LearningModule" ("id", "title", "category", "summary", "status", "progress", "sequence", "interviewFocus") VALUES
('module-node-http', 'Node.js 与 HTTP 基础', 'backend', '理解事件循环、请求生命周期、中间件、错误处理和日志。', 'DONE', 100, 1, 'Node 事件循环、REST 状态码、幂等性'),
('module-database', '数据库建模与 SQL', 'database', '用 Prisma + SQLite 练习关系建模、索引、分页和事务。', 'IN_PROGRESS', 72, 2, '索引、N+1、事务隔离、分页性能'),
('module-security', '认证、鉴权与安全', 'security', '实现 httpOnly Cookie、JWT、密码哈希、RBAC 和限流。', 'IN_PROGRESS', 58, 3, 'XSS/CSRF/CORS、JWT 续期、权限模型'),
('module-api-observability', 'API 设计与可观测性', 'api', '统一响应、Zod 校验、错误码、日志、慢请求和接口演进。', 'READY', 35, 4, 'REST 资源设计、版本化、OpenAPI、监控'),
('module-ai-engineering', 'AI 应用工程化', 'ai', '用流式接口模拟 AI Mentor，保留 provider adapter 扩展点。', 'READY', 25, 5, '流式输出、prompt 注入、评测、成本与缓存'),
('module-devops-design', '部署、Docker 与系统设计', 'devops', '补齐容器化、环境变量、CI、缓存层和容量估算表达能力。', 'LOCKED', 10, 6, '水平扩展、缓存穿透、队列、灰度发布');

INSERT INTO "ProjectTask" ("id", "title", "description", "type", "status", "priority", "branch", "storyPoints", "ownerId") VALUES
('task-pagination', '实现任务列表的分页、搜索、排序', '从 URL query 解析参数，后端校验后返回 meta 信息。', 'BACKEND', 'DONE', 'HIGH', 'feature/tasks-pagination', 3, 'demo-user-frontend'),
('task-transaction-log', '给创建任务接口加入事务日志', 'create task 和 backend log 必须在一个事务中提交。', 'DATABASE', 'IN_PROGRESS', 'HIGH', 'feature/transaction-log', 5, 'demo-user-frontend'),
('task-auth-rate-limit', '补充登录接口的限流与错误码', '防暴力破解；错误响应不能泄漏账号是否存在。', 'SECURITY', 'REVIEW', 'CRITICAL', 'feature/auth-rate-limit', 3, 'demo-user-frontend'),
('task-ai-provider', '为 AI Mentor 接入真实模型 provider', '保持流式响应接口不变，替换本地模拟实现。', 'AI', 'TODO', 'MEDIUM', 'feature/ai-provider', 8, 'demo-user-frontend'),
('task-system-design-review', '写一份系统设计复盘', '围绕认证、任务流、日志、缓存、队列、部署讲清权衡。', 'SYSTEM_DESIGN', 'TODO', 'MEDIUM', 'docs/system-design-review', 2, 'demo-user-frontend'),
('task-mobile-dashboard', '移动端训练台布局优化', '将三栏仪表盘折叠为顶部 tabs + 单列内容。', 'FRONTEND', 'IN_PROGRESS', 'LOW', 'feature/mobile-dashboard', 3, 'demo-user-frontend');

INSERT INTO "InterviewQuestion" ("id", "category", "title", "difficulty", "status", "answerHint") VALUES
('question-rsc-ssr-csr-isr', 'React/Next.js', 'RSC、SSR、CSR、ISR 的边界分别是什么？什么时候选哪一个？', 'MEDIUM', 'REVIEWED', '从数据新鲜度、SEO、首屏、交互复杂度、缓存失效讲。'),
('question-node-event-loop', 'Node.js', 'Node.js 事件循环和微任务队列如何影响接口延迟？', 'MEDIUM', 'NEW', '说明 timers、poll、check、Promise microtask，并结合 CPU 密集任务。'),
('question-cursor-pagination', 'Database', 'offset 分页为什么会慢？如何做 cursor pagination？', 'HARD', 'NEW', '解释扫描成本、稳定排序、复合索引和游标条件。'),
('question-cookie-csrf', 'Security', 'httpOnly Cookie + JWT 还需要防 CSRF 吗？', 'HARD', 'REVIEWED', 'Cookie 自动携带，仍要 SameSite、CSRF token 或双提交策略。'),
('question-task-system-design', 'System Design', '设计一个任务协作系统，如何处理权限、缓存、通知和审计？', 'HARD', 'NEW', '从领域模型、读写路径、缓存失效、消息队列、审计日志展开。'),
('question-ai-safety-cost', 'AI Engineering', 'AI 接口如何防 prompt injection、控制成本并评估输出质量？', 'MEDIUM', 'NEW', '输入边界、工具权限、输出校验、缓存、离线评测和人工兜底。');

INSERT INTO "BackendLog" ("id", "level", "service", "message", "durationMs") VALUES
('log-seed-ready', 'INFO', 'seed', 'Demo database initialized', 42),
('log-auth-ready', 'INFO', 'auth', 'Demo user ready: frontend@example.com', 18),
('log-task-review', 'WARN', 'tasks', 'High priority security task is waiting for review', 64);
