import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");
const schemaPath = path.join(root, "prisma", "schema.prisma");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    env: process.env
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed${details ? `\n${details}` : ""}`);
  }

  return result.stdout;
}

function tableExists(tableName) {
  if (!existsSync(dbPath)) {
    return false;
  }

  const output = execFileSync(
    "sqlite3",
    [dbPath, `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`],
    { encoding: "utf8" }
  );

  return output.trim() === tableName;
}

run("npx", ["prisma", "generate"]);

if (tableExists("User")) {
  console.log(`SQLite schema already exists at ${dbPath}`);
  process.exit(0);
}

const sql = run(
  "npx",
  ["prisma", "migrate", "diff", "--from-empty", "--to-schema-datamodel", schemaPath, "--script"],
  { capture: true }
);

const sqlite = spawnSync("sqlite3", [dbPath], {
  input: sql,
  encoding: "utf8",
  stdio: ["pipe", "inherit", "inherit"]
});

if (sqlite.status !== 0) {
  throw new Error("sqlite3 schema initialization failed");
}

console.log(`SQLite schema initialized at ${dbPath}`);
