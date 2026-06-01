# 生产上线检查清单

这个项目可以部署给别人看。要承载真实用户，按下面清单补齐。

## 必须改

- 数据库：把 SQLite 换成 PostgreSQL。SQLite 适合本地学习，不适合多实例正式服务。
- 密钥：设置强 `AUTH_SECRET`，不要使用 `.env.example` 里的示例值。
- HTTPS：生产环境必须启用 HTTPS，Cookie 才能安全传输。
- 环境变量：把 `DATABASE_URL`、`AUTH_SECRET`、AI provider key 放到部署平台的 Secret 管理里。
- 日志监控：把 BackendLog 扩展为真实日志平台，至少看错误率、慢接口、登录失败、AI 调用失败。

## 建议补

- PostgreSQL migration：用 Prisma migrate 管理生产表结构。
- E2E 测试：覆盖登录、任务新建、状态更新、AI Mentor。
- RBAC：把 `role` 从演示字段变成真实权限策略。
- CSRF：如果继续使用 Cookie 登录态，生产写接口建议加 CSRF 防护。
- CORS 白名单：只允许正式域名访问 API。
- 限流持久化：内存限流换 Redis 或网关限流。
- AI 安全：加 prompt injection 防护、输出校验、成本限制和调用审计。
- 备份恢复：PostgreSQL 做自动备份，准备恢复演练。

## 面试表达

```text
这个项目本地用 SQLite 是为了降低学习成本。
如果正式上线，我会换 PostgreSQL，用 Prisma migration 管理表结构；
部署层用 Docker 或平台构建，环境变量走 Secret；
安全层启用 HTTPS、强密钥、CSRF/CORS 策略；
质量层跑 typecheck、unit test、build、e2e；
运行层接日志、监控、告警和数据库备份。
```
