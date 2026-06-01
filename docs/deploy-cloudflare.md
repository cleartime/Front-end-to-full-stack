# Deploy to Cloudflare Workers

This project is a full-stack Next.js app, so deploy it to Cloudflare Workers with the OpenNext adapter.

Cloudflare Pages static deployment is not enough because the app uses API routes, auth cookies, Prisma, and server-side database reads/writes.

## Architecture

```text
Browser
  -> Cloudflare Worker
  -> OpenNext-rendered Next.js app
  -> Route Handlers (/api/*)
  -> Prisma Client with PostgreSQL adapter
  -> DATABASE_URL secret or Hyperdrive binding
  -> PostgreSQL
```

## Why PostgreSQL instead of local SQLite

Local development defaults to SQLite because it is simple and requires no external service.

Production on Cloudflare Workers cannot use `prisma/dev.db` as a persistent database file. Use one of these:

- Recommended: external PostgreSQL, optionally behind Cloudflare Hyperdrive.
- Alternative: Cloudflare D1, but Prisma + D1 currently does not preserve transaction guarantees, so it does not match the transaction lesson in this project.

## One-time Cloudflare setup

1. Log in:

   ```bash
   npx wrangler login
   ```

2. Create or choose a production PostgreSQL database.

3. Put runtime secrets into Cloudflare:

   ```bash
   npm run cf:secret:database
   npm run cf:secret:auth
   ```

4. If using Hyperdrive, create a Hyperdrive config in Cloudflare, then uncomment the `hyperdrive` block in `wrangler.jsonc` and replace `YOUR_HYPERDRIVE_ID`.

## Database setup

Copy the local Cloudflare variable template:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set `DATABASE_URL` to your PostgreSQL connection string.

Create tables and seed demo data:

```bash
npm run cf:db:push
npm run cf:db:seed
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
- Runtime secrets: `DATABASE_URL`, `AUTH_SECRET`
