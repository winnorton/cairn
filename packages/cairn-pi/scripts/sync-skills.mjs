#!/usr/bin/env node
// Delegates to the shared sync guard at <repo>/scripts/sync-skills.mjs.
// Run via `npm run sync` or `npm run check` from packages/cairn-pi/.
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const pkgRoot = dirname(fileURLToPath(import.meta.url)) + "/..";
const repoRoot = resolve(pkgRoot, "..", "..");
const shared = resolve(repoRoot, "scripts", "sync-skills.mjs");

const result = spawnSync(
  process.execPath,
  [shared, "--pkg", "packages/cairn-pi", ...process.argv.slice(2)],
  { stdio: "inherit", cwd: repoRoot },
);
process.exit(result.status ?? 1);
