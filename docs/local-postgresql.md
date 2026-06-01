# 本地 PostgreSQL 使用说明

这个项目默认用 SQLite，是为了让新同学不用装数据库也能跑起来。你也可以切到本地 PostgreSQL，更接近真实生产环境。

## 需要安装什么

推荐方案：

- Docker Desktop：用于本地启动 PostgreSQL 容器。
- Prisma Studio：项目已安装 Prisma，运行命令即可打开数据库管理页面。

可选方案：

- DBeaver、TablePlus、pgAdmin：图形化数据库客户端。
- `psql`：命令行客户端，可以通过 Homebrew 安装 `brew install libpq` 或 `brew install postgresql@16`。

当前项目已经提供 `docker-compose.postgres.yml`，不需要你手动安装 PostgreSQL 服务。

## 启动本地 PostgreSQL

```bash
npm run postgres:up
cp .env.postgres.example .env
npm run db:pg:generate
npm run db:pg:push
npm run db:seed
npm run dev:pg
```

打开：

```text
http://localhost:3000
```

## 查看数据库

方式一：Prisma Studio

```bash
npm run db:pg:studio
```

然后打开 Prisma Studio 输出的地址，通常是：

```text
http://localhost:5555
```

方式二：图形化客户端

```text
Host: localhost
Port: 5432
Database: fullstack_lab
User: fullstack
Password: fullstack123
Schema: public
```

方式三：psql

```bash
psql "postgresql://fullstack:fullstack123@localhost:5432/fullstack_lab?schema=public"
```

## SQLite 和 PostgreSQL 的区别

- SQLite：一个本地文件，适合学习、演示、单人本地开发。
- PostgreSQL：真正的数据库服务，适合多用户、线上部署、连接池、备份、监控、权限管理。

## 面试怎么说

```text
项目默认 SQLite 是为了降低学习成本。
如果部署成正式服务，我会切到 PostgreSQL。
本地可以用 Docker 启动 PostgreSQL，再用 Prisma db push 建表，用 seed 写入演示数据。
看数据可以用 Prisma Studio、DBeaver、TablePlus、pgAdmin 或 psql。
```
