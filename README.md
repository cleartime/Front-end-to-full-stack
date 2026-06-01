# FullStack Transition Lab

这是一个给「前端同学转全栈」准备的可运行训练项目。它不是纯页面 Demo，而是把常见面试点落到代码里：登录鉴权、REST API、Zod 校验、Prisma ORM、SQLite 数据库、分页搜索排序、事务日志、限流、AI 流式接口模拟、系统设计表达和基础测试。

## 技术栈

- Next.js + React + TypeScript：统一前端页面和后端 Route Handlers。
- Prisma + SQLite / D1：本地用 SQLite 快速学习，Cloudflare 部署用 D1 持久化演示数据。
- httpOnly Cookie + JWT：练习登录态、服务端鉴权和 RBAC 扩展。
- Zod：接口入参校验和错误响应。
- Vitest：覆盖工具函数和限流逻辑。
- Dockerfile / Cloudflare Workers：支持容器化部署，也支持 OpenNext 部署到 Cloudflare。

## 本地运行

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

说明：`npm run db:push` 在这个项目里会先执行 `prisma generate`，再根据 Prisma schema 生成 SQLite 初始化 SQL。这样可以规避少数本机上 `prisma db push` 的 schema-engine 空错误，同时运行时仍使用 Prisma Client。

打开 http://localhost:3000

演示账号：

```text
frontend@example.com
fullstack123
```

## 项目结构

```text
.
├── prisma/
│   ├── schema.prisma          # 数据模型、索引、关系
│   └── seed.ts                # 演示账号、学习模块、任务、面试题、日志
├── src/
│   ├── app/
│   │   ├── api/               # Next.js Route Handlers，也就是后端接口
│   │   ├── globals.css        # 训练台 UI 设计系统
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── features/dashboard/    # 可交互训练台主界面
│   ├── lib/                   # 纯函数、状态枚举、可测试工具
│   └── server/                # DB、Auth、HTTP、限流、任务服务层
├── tests/                     # Vitest 单元测试
├── docs/
│   ├── fullstack-roadmap.md   # 转型路线
│   └── interview-topics.md    # 主流面试题和项目对应点
├── Dockerfile
└── package.json
```

## 你应该重点读的代码

- `src/app/api/auth/login/route.ts`：登录接口、密码校验、限流、Cookie 写入。
- `src/server/auth.ts`：JWT 签发、httpOnly Cookie、服务端用户校验。
- `src/app/api/tasks/route.ts` + `src/server/tasks.ts`：分页、搜索、排序、事务写日志。
- `src/app/api/ai/mentor/route.ts`：流式响应接口，后续可替换成真实模型 provider。
- `prisma/schema.prisma`：关系建模、索引、外键删除策略。
- `src/features/dashboard/DashboardApp.tsx`：前端如何消费这些接口并展示状态。

## 网页内学习入口

登录后打开 `/#architecture`，页面里有“全栈面试地图”：

- 整体架构、前端架构、后端架构、数据库架构、安全架构、AI 架构、运维部署架构、测试质量。
- 每一块都用最直白的话解释“这是什么、流程怎么走、面试会问什么、怎么回答”。
- 适合部署后给别人直接浏览学习。

生产上线前看 [docs/production-checklist.md](docs/production-checklist.md)。

## Cloudflare 部署

这个项目是 SSR/全栈 Next.js，Cloudflare 推荐用 Workers + OpenNext adapter。项目已经包含 `wrangler.jsonc`、`open-next.config.ts` 和 `cf:*` 脚本。

正式部署不要使用本地 SQLite 文件。当前 Cloudflare 部署使用 D1；如果业务强依赖事务一致性，再切 PostgreSQL + Hyperdrive。完整流程看 [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md)。

```bash
npm run cf:d1:seed
npm run cf:secret:auth
npm run cf:preview
npm run cf:deploy
```

## 本地 PostgreSQL

默认 SQLite 适合快速学习。如果要切到本地 PostgreSQL，看 [docs/local-postgresql.md](docs/local-postgresql.md)。

最短流程：

```bash
npm run postgres:up
cp .env.postgres.example .env
npm run db:pg:generate
npm run db:pg:push
npm run db:seed
npm run dev:pg
```

查看数据库：

```bash
npm run db:pg:studio
```

## 练习路径

1. 先跑起来，点登录、任务状态切换、新建任务、API Explorer、AI Mentor。
2. 打开 Prisma schema，解释每个表为什么这么建，索引为什么这么加。
3. 打开任务 API，讲清分页、搜索、排序、事务和错误处理。
4. 把 SQLite 换成 PostgreSQL，或把 AI Mentor 接到真实模型，作为二阶段升级。
5. 按 `docs/interview-topics.md` 的题目准备每个模块的面试回答。
