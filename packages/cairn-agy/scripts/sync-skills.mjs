#!/usr/bin/env node
// Delegates to the shared sync guard at <repo>/scripts/sync-skills.mjs.
// Invoked directly: node scripts/sync-skills.mjs --pkg packages/cairn-agy [--check]
// (cairn-agy is a non-npm plugin — no prepublishOnly hook; this delegate is for
//  manual invocation and is called by the CI step in .github/workflows/sync-guard.yml.)
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const pkgRoot = dirname(fileURLToPath(import.meta.url)) + "/..";
const repoRoot = resolve(pkgRoot, "..", "..");
const shared = resolve(repoRoot, "scripts", "sync-skills.mjs");

const result = spawnSync(
  process.execPath,
  [shared, "--pkg", "packages/cairn-agy", ...process.argv.slice(2)],
  { stdio: "inherit", cwd: repoRoot },
);
process.exit(result.status ?? 1);
