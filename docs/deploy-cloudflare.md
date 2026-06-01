# Deploy to Cloudflare Workers

This project is a full-stack Next.js app, so deploy it to Cloudflare Workers with the OpenNext adapter.

Cloudflare Pages static deployment is not enough because the app uses API routes, auth cookies, Prisma, and server-side database reads/writes.

## Architecture

```text
Browser
  -> Cloudflare Worker
  -> OpenNext-rendered Next.js app
  -> Route Handlers (/api/*)
  -> Prisma Client with D1 adapter
  -> Cloudflare D1 binding DB
  -> fullstack-transition-lab-db
```

## Database choice

Local development defaults to SQLite because it is simple and requires no external service.

Production on Cloudflare Workers cannot use `prisma/dev.db` as a persistent database file. This deployment uses Cloudflare D1 so the whole demo can run inside one Cloudflare account.

Important: Prisma's D1 adapter does not preserve full ACID transaction guarantees. The app still teaches transaction concepts, but for a larger production system that must rely on transactions, use PostgreSQL behind Hyperdrive.

## One-time Cloudflare setup

1. Log in:

   ```bash
   npx wrangler login
   ```

2. Create a D1 database:

   ```bash
   npx wrangler d1 create fullstack-transition-lab-db
   ```

3. Add the returned `database_id` to `wrangler.jsonc` under `d1_databases`.

4. Seed D1:

   ```bash
   npm run cf:d1:seed
   ```

5. Put runtime secrets into Cloudflare:

   ```bash
   npm run cf:secret:auth
   ```

## Preview locally in the Cloudflare runtime

```bash
npm run cf:preview
```

This builds through OpenNext and runs in `workerd`, which is closer to production than `next dev`.

## Deploy

```bash
npm run cf:deploy
```

Wrangler prints the deployed Worker URL after a successful deployment.

## GitHub flow

This folder is currently local code. To push it:

```bash
git init
git add .
git commit -m "Initial fullstack transition lab"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

After the repository exists on GitHub, Cloudflare Workers Builds can connect to it. Use:

- Build command: `npm run cf:build`
- Deploy command for local/manual deploy: `npm run cf:deploy`
- Runtime secret: `AUTH_SECRET`
