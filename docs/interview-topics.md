# 主流全栈面试题与本项目对应点

## React / Next.js

- RSC、SSR、CSR、ISR 的区别是什么？本项目为什么用客户端 dashboard + API？
- Next.js Route Handler 和传统 Express Controller 有什么异同？
- 前端如何处理接口 loading、错误、空态和并发请求？
- 如何做移动端响应式，不让表格和控制区溢出？

项目对应：`src/features/dashboard/DashboardApp.tsx`、`src/app/api/*/route.ts`、`src/app/globals.css`

## Node.js / API

- Node.js 事件循环如何影响接口延迟？
- REST 资源如何设计？什么时候用 GET/POST/PATCH？
- 统一响应结构、错误码、参数校验怎么做？
- 登录接口为什么要限流？限流放内存、Redis、网关分别有什么差异？

项目对应：`src/server/http.ts`、`src/server/rate-limit.ts`、`src/app/api/auth/login/route.ts`

## 数据库

- 一对多关系怎么建？什么时候加索引？
- offset 分页慢在哪里？cursor pagination 如何设计？
- 事务为什么必要？哪些操作必须在同一个事务里？
- Prisma 好处是什么？什么时候需要写原生 SQL？

项目对应：`prisma/schema.prisma`、`src/server/tasks.ts`

## 认证与安全

- Cookie、Session、JWT 的区别是什么？
- httpOnly Cookie 能防 XSS 读 token，但为什么仍要考虑 CSRF？
- RBAC 和 ABAC 有什么差异？
- Prompt injection 在 AI 应用里如何防？

项目对应：`src/server/auth.ts`、`src/app/api/ai/mentor/route.ts`

## 系统设计

- 如何设计一个任务协作系统？
- 如何扩展到多人、多租户、审计、通知？
- 缓存层应该缓存什么？如何失效？
- 如何观测慢接口、错误率和 AI 调用成本？

项目对应：`src/app/api/system-design/route.ts`、`src/app/api/logs/route.ts`

## 面试表达模板

```text
场景：这个功能解决什么业务问题？
设计：数据模型、接口、权限、错误处理如何拆？
代码：对应到哪个文件，关键实现是什么？
权衡：为什么这么做，有什么替代方案，下一步如何扩展？
```
