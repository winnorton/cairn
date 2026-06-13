# SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 03, 05, 07 · **Parallel-safe-with:** 06

## Goal
Generalize cairn-pi's `sync-skills.mjs` into a shared guard so every distribution package stays byte-synced from the one source of truth, wired to CI/`prepublishOnly`.

## Scope
- One source of truth: `files/skills/<name>/SKILL.md` (Contract §2.4).
- Sync + `--check` covering BOTH `packages/cairn-pi/` and `packages/cairn-claude/` (WS03).
- Enforce: byte-identity, frontmatter `description` ≤ 1024, `name` == dir, version-lockstep with `VERSION`, no orphaned copies (the checks already in cairn-pi's guard).
- Wire `--check` to `prepublishOnly` (npm) + a repo CI step (covers the plugin + sources).

## Telemetry hook
N/A: dev tooling, not shipped runtime.

## Diagnostics path
`npm run check` per package; corrupting one copy makes it red; CI surfaces drift on PR.

## Rollback story
`git revert`; the guard is dev-time only, never in a published tarball.

## Gate
`--check` green across all packages, wired to prepublish + CI; a planted drift/over-cap/orphan each fails the check.

## Files
shared `scripts/sync-skills.mjs` (or per-package), CI config, `packages/*/package.json` scripts.

---

## Pre-flight

Run each command and confirm the expected result before touching any file. This is a
**HALTING gate** — if any expectation fails, STOP and surface the discrepancy before
Phase 1.

<!-- Shell dialect: POSIX (bash) unless noted; PowerShell equivalents shown where they differ. -->

**PF-1. Confirm worktree is clean and on the WS11 branch.**

```bash
git status --short
```

Expected: no modified or staged files. If dirty, stash or resolve before proceeding.

**PF-2. Confirm dependencies are complete (WS03, WS05, WS07 must be COMPLETE).**

```bash
# Check the program status table manually — open the master and read §9.4.
# WS03 must be COMPLETE: packages/cairn-claude/ exists with a skills/ subdirectory.
ls packages/cairn-claude/skills/
# WS05 must be COMPLETE: packages/cairn-pi/README.md references .cairn/
grep -c ".cairn/" packages/cairn-pi/README.md
# WS07 must be COMPLETE: no vendor memory paths remain in files/skills/
rg -c "~/.claude/memory|~/.pi/agent/memory" files/skills/ || echo "0 — WS07 clean"
```

Expected: `ls packages/cairn-claude/skills/` lists at least one skill directory; grep returns ≥ 1; rg returns 0 (or "0 — WS07 clean"). If `packages/cairn-claude/` is absent, WS03 is not yet COMPLETE — STOP.

**PF-3. Confirm the existing cairn-pi sync guard runs cleanly.**

```bash
cd packages/cairn-pi && node scripts/sync-skills.mjs --check && cd ../..
```

Expected: exits 0, prints `check OK — 6 skills in sync, lockstep 0.13.1` (or the current VERSION). If this fails, do NOT proceed — unblock cairn-pi's guard first.

**PF-4. Count source skills programmatically (do NOT hard-code).**

```bash
# Count skill directories in files/skills/ — each subdirectory is one skill.
rg --files files/skills/ --glob "SKILL.md" | wc -l
```

Expected: a number ≥ 18 (current count as of spec authoring; the guard must derive this at runtime, not from a frozen list). Record the actual number as N_SRC.

**PF-5. Identify which skills ship in each package (set by WS03 and WS05).**

```bash
ls packages/cairn-pi/skills/
ls packages/cairn-claude/skills/
```

Expected: cairn-pi currently ships 6 skills (fast-execute, note, peer-review, program, round-review, spec). cairn-claude's set is determined by WS03's elaboration. Record both lists — the sync script per package uses its own frozen SKILLS array (derived from these lists at the time the package is built, then committed).

**PF-6. Confirm no .github/workflows/ directory exists yet (CI creation is in Phase 3).**

```bash
ls .github/workflows/ 2>/dev/null || echo "absent — CI to be created"
```

Expected: "absent — CI to be created". If workflows exist, read them before Phase 3 to avoid duplicate jobs.

---

## Phase 1 — Generalize the sync script as a shared utility

**Goal:** Extract a single `scripts/sync-skills.mjs` at repo root that both packages can invoke with package-specific configuration, eliminating the per-package duplication.

**Context:** `packages/cairn-pi/scripts/sync-skills.mjs` (the precedent) hard-codes a `SKILLS` array and infers `pkgRoot`/`repoRoot` from `import.meta.url`. The shared utility will accept the SKILLS list and package root as parameters — either CLI args or a sidecar config file per package.

### Step 1.1 — Create `scripts/sync-skills.mjs` at the repo root

**Current state:** No `scripts/` directory at repo root exists.

**Replacement (create new file):**

```javascript
// scripts/sync-skills.mjs (PowerShell: node scripts/sync-skills.mjs --check --pkg packages/cairn-pi)
// Shell dialect: POSIX and PowerShell compatible (node invocation)
//
// Shared sync/check guard for all cairn distribution packages.
// Source of truth: <repo>/files/skills/<name>/SKILL.md.
// Committed copies under <pkg>/skills/ are build artifacts — byte-identical or --check fails.
//
// Usage:
//   node scripts/sync-skills.mjs --pkg <rel-path-to-package>          # sync mode
//   node scripts/sync-skills.mjs --pkg <rel-path-to-package> --check  # check mode
//
// The package directory must contain sync-config.json:
//   { "skills": ["name1", "name2", ...] }
//
// Enforced:
//   - frontmatter `name:` equals dir name and matches ^[a-z0-9][a-z0-9-]{0,63}$
//   - frontmatter `description:` <= 1024 chars (after YAML line-folding)
//   - package.json `version` === <repo>/VERSION
//   - no orphaned copies (dirs in <pkg>/skills/ not in the skills list)
//   - byte-identity between source and copy (--check mode)

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_DESCRIPTION = 1024;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const args = process.argv.slice(2);
const pkgArg = args[args.indexOf("--pkg") + 1];
const check = args.includes("--check");

if (!pkgArg) {
  console.error("Usage: node scripts/sync-skills.mjs --pkg <path-to-package> [--check]");
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgRoot = resolve(repoRoot, pkgArg);

// Load per-package skill list from sync-config.json
let SKILLS;
try {
  const cfg = JSON.parse(readFileSync(join(pkgRoot, "sync-config.json"), "utf8"));
  if (!Array.isArray(cfg.skills) || cfg.skills.length === 0) throw new Error("skills must be a non-empty array");
  SKILLS = cfg.skills;
} catch (err) {
  console.error(`Cannot load ${pkgRoot}/sync-config.json: ${err.message}`);
  process.exit(1);
}

const errors = [];

function frontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    errors.push(`${file}: no YAML frontmatter`);
    return {};
  }
  const name = (m[1].match(/(?:^|\n)name:[ \t]*(.+)/) ?? [])[1]?.trim();
  const desc = (m[1].match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[A-Za-z][\w-]*:|$)/) ?? [])[1]
    ?.replace(/\r?\n[ \t]+/g, " ")
    .trim();
  return { name, desc };
}

// Version lockstep
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
const repoVersion = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
if (pkg.version !== repoVersion) {
  errors.push(`version lockstep: package.json has ${pkg.version}, VERSION has ${repoVersion}`);
}

// Sync or check each skill
for (const skill of SKILLS) {
  const srcPath = join(repoRoot, "files", "skills", skill, "SKILL.md");
  const destPath = join(pkgRoot, "skills", skill, "SKILL.md");

  let src;
  try {
    src = readFileSync(srcPath, "utf8");
  } catch {
    errors.push(`${skill}: missing source ${srcPath}`);
    continue;
  }

  const { name, desc } = frontmatter(src, srcPath);
  if (name !== skill || !NAME_RE.test(name ?? "")) {
    errors.push(`${skill}: frontmatter name "${name}" must equal the dir name and match ${NAME_RE}`);
  }
  if (!desc) {
    errors.push(`${skill}: frontmatter description missing`);
  } else if (desc.length > MAX_DESCRIPTION) {
    errors.push(
      `${skill}: description ${desc.length} chars > ${MAX_DESCRIPTION} cap — ` +
        `trim files/skills/${skill}/SKILL.md (the source), never the copy`,
    );
  }

  if (check) {
    let dest = null;
    try {
      dest = readFileSync(destPath, "utf8");
    } catch {
      /* fall through to the missing-copy error */
    }
    if (dest === null) errors.push(`${skill}: missing copy — run \`npm run sync\` in ${pkgArg}`);
    else if (dest !== src) errors.push(`${skill}: copy drifted from source — run \`npm run sync\` in ${pkgArg}`);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    console.log(`synced ${skill}`);
  }
}

// Orphan check: dirs under <pkg>/skills/ not in SKILLS
let shipped = [];
try {
  shipped = readdirSync(join(pkgRoot, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
} catch {
  /* skills/ absent on first sync run */
}
for (const dir of shipped) {
  if (!SKILLS.includes(dir)) {
    errors.push(`orphaned copy skills/${dir}/ in ${pkgArg} — delete it or add to sync-config.json`);
  }
}

if (errors.length) {
  console.error(`\n${check ? "check" : "sync"} FAILED (${pkgArg}):\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(
  check
    ? `check OK — ${SKILLS.length} skills in sync, lockstep ${repoVersion} (${pkgArg})`
    : `sync complete — ${SKILLS.length} skills (${pkgArg})`,
);
```

**Why:** Extracts the logic once at repo root so both packages invoke it without duplication. The `sync-config.json` sidecar keeps per-package configuration next to the package it configures; adding a third package (e.g., cairn-agy) requires only a new sidecar and two package.json script lines.

### Step 1.2 — Create `packages/cairn-pi/sync-config.json`

**Current state:** No `sync-config.json` exists in `packages/cairn-pi/`.

**Replacement (create new file):**

```json
{
  "skills": ["fast-execute", "note", "peer-review", "program", "round-review", "spec"]
}
```

**Why:** Externalizes the cairn-pi SKILLS array so the shared script can read it. The list matches the existing `SKILLS` constant in `packages/cairn-pi/scripts/sync-skills.mjs` exactly — no behavioral change.

### Step 1.3 — Create `packages/cairn-claude/sync-config.json`

**Current state:** No `sync-config.json` exists in `packages/cairn-claude/`.

**IMPORTANT:** The cairn-claude skill list is determined by WS03's elaboration. Before writing this file, read `packages/cairn-claude/package.json` (or WS03's spec) to find the authoritative list.

**Replacement (create new file, substituting the WS03-determined list):**

```json
{
  "skills": ["<skill-1-from-WS03>", "<skill-2-from-WS03>"]
}
```

If `packages/cairn-claude/` does not yet have a `skills/` directory or the package is incomplete, STOP — WS03 is not done. The `sync-config.json` must list exactly the skills WS03 committed to `packages/cairn-claude/skills/`.

**Why:** Same pattern as cairn-pi — declarative, next to the package, no logic in the list itself.

### Step 1.4 — Update `packages/cairn-pi/scripts/sync-skills.mjs` to delegate to the shared script

**Current state:** `packages/cairn-pi/scripts/sync-skills.mjs` is a standalone 118-line script.

**Replacement (replace entire file content):**

```javascript
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
  { stdio: "inherit", cwd: repoRoot }
);
process.exit(result.status ?? 1);
```

**Why:** Keeps `npm run sync` / `npm run check` working from inside the cairn-pi package (the existing developer workflow), while routing through the shared logic. No duplication of the 118-line body.

### Step 1.5 — Create `packages/cairn-claude/scripts/sync-skills.mjs`

**Current state:** No scripts directory exists under `packages/cairn-claude/` (WS03 created the package but likely did not add the sync delegate).

**Replacement (create new file — same delegate pattern as Step 1.4):**

```javascript
#!/usr/bin/env node
// Delegates to the shared sync guard at <repo>/scripts/sync-skills.mjs.
// Run via `npm run sync` or `npm run check` from packages/cairn-claude/.
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const pkgRoot = dirname(fileURLToPath(import.meta.url)) + "/..";
const repoRoot = resolve(pkgRoot, "..", "..");
const shared = resolve(repoRoot, "scripts", "sync-skills.mjs");

const result = spawnSync(
  process.execPath,
  [shared, "--pkg", "packages/cairn-claude", ...process.argv.slice(2)],
  { stdio: "inherit", cwd: repoRoot }
);
process.exit(result.status ?? 1);
```

**Why:** Same delegate pattern; allows `cd packages/cairn-claude && npm run check` to work identically to the cairn-pi workflow.

**CHECKPOINT — Phase 1:**

```bash
# POSIX / bash:
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check

node scripts/sync-skills.mjs --pkg packages/cairn-claude --check
```

```powershell
# PowerShell equivalent:
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
node scripts/sync-skills.mjs --pkg packages/cairn-claude --check
```

Expected: both commands exit 0 with "check OK — N skills in sync, lockstep 0.13.1". If cairn-pi fails, the delegate or sync-config.json is wrong — re-read Step 1.2 and 1.4. If cairn-claude fails, WS03's skill copies may be out of date — run `node scripts/sync-skills.mjs --pkg packages/cairn-claude` (sync mode, not check) to regenerate from source, then commit.

---

## Phase 2 — Wire `prepublishOnly` and package-local scripts

**Goal:** Ensure `npm publish` from either package runs `--check` automatically, and package-local `npm run sync` / `npm run check` still work via the delegate.

### Step 2.1 — Update `packages/cairn-pi/package.json` scripts

**Current state (`packages/cairn-pi/package.json` scripts block):**

```json
"scripts": {
  "sync": "node scripts/sync-skills.mjs",
  "check": "node scripts/sync-skills.mjs --check",
  "prepublishOnly": "node scripts/sync-skills.mjs --check"
}
```

**Replacement:**

```json
"scripts": {
  "sync": "node scripts/sync-skills.mjs",
  "check": "node scripts/sync-skills.mjs --check",
  "prepublishOnly": "node scripts/sync-skills.mjs --check"
}
```

**Why:** No change needed — the delegate script (Step 1.4) passes `--check` through `process.argv.slice(2)`, so `prepublishOnly` still invokes check mode correctly via the new shared script. Confirm by running `npm run check` from inside `packages/cairn-pi/` after Phase 1 completes.

If the cairn-pi package.json uses `"node scripts/sync-skills.mjs"` (which now delegates), the scripts stay identical. If WS03 wired `packages/cairn-claude/package.json` differently, adjust Step 2.2 accordingly.

### Step 2.2 — Update `packages/cairn-claude/package.json` to add sync scripts

**Current state:** Read `packages/cairn-claude/package.json` — WS03 may or may not have added these scripts.

If the scripts block is absent or missing `sync`/`check`/`prepublishOnly`, add (merge into the existing scripts block):

```json
"scripts": {
  "sync": "node scripts/sync-skills.mjs",
  "check": "node scripts/sync-skills.mjs --check",
  "prepublishOnly": "node scripts/sync-skills.mjs --check"
}
```

**Why:** Mirrors the cairn-pi pattern exactly so every package enforces sync before publish. `prepublishOnly` runs on `npm publish` and `npm pack`; it does not run on `npm install` by adopters.

**CHECKPOINT — Phase 2:**

```bash
# POSIX / bash:
cd packages/cairn-pi && npm run check && cd ../..
cd packages/cairn-claude && npm run check && cd ../..
```

```powershell
# PowerShell:
Set-Location packages/cairn-pi; npm run check; Set-Location ../..
Set-Location packages/cairn-claude; npm run check; Set-Location ../..
```

Expected: both exit 0. If cairn-claude's `npm run check` fails with "Cannot find module scripts/sync-skills.mjs", the `scripts/` directory or delegate file from Phase 1 is missing — go back and create Step 1.5.

Recovery: if `npm run check` fails with a version lockstep error, the package.json `version` field doesn't match `VERSION`. Do not fix the version here — that is WS05's responsibility for cairn-pi. For cairn-claude, check what WS03 set and align. If neither WS05 nor WS03 has addressed version lockstep yet, note the issue and leave the version field for those workstreams; the CI gate (Phase 3) will catch it on the merge PR.

---

## Phase 3 — Wire the repo-level CI check

**Goal:** A GitHub Actions workflow runs `--check` across ALL packages on every PR so drift is caught before merge.

**Context:** No `.github/workflows/` directory exists yet. This phase creates it. The CI step is a repo-level check (not per-package `npm publish`), covering both the shared script and both packages.

### Step 3.1 — Create `.github/workflows/sync-guard.yml`

**Current state:** `.github/workflows/` does not exist.

**Replacement (create new file):**

```yaml
# .github/workflows/sync-guard.yml
# Shell dialect: POSIX (GitHub Actions runners)
#
# Runs the cairn skill sync guard in --check mode across all distribution packages.
# Fails if any package's committed skill copies drift from files/skills/<name>/SKILL.md,
# if any description exceeds 1024 chars, if any frontmatter name mismatches, or if
# package.json version != VERSION (version-lockstep enforcement).
#
# Gate: required status check on PRs to main per the program's §8 operational policy.

name: sync-guard

on:
  push:
    branches: [main]
    paths:
      - "files/skills/**"
      - "packages/*/skills/**"
      - "packages/*/package.json"
      - "packages/*/sync-config.json"
      - "scripts/sync-skills.mjs"
      - "VERSION"
  pull_request:
    paths:
      - "files/skills/**"
      - "packages/*/skills/**"
      - "packages/*/package.json"
      - "packages/*/sync-config.json"
      - "scripts/sync-skills.mjs"
      - "VERSION"

jobs:
  check:
    name: Skill sync check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check cairn-pi skills in sync
        run: node scripts/sync-skills.mjs --pkg packages/cairn-pi --check

      - name: Check cairn-claude skills in sync
        run: node scripts/sync-skills.mjs --pkg packages/cairn-claude --check
```

**Why:** Separate steps per package so CI output clearly names which package drifted. The `paths:` filter avoids running on pure-docs changes. `actions/checkout@v4` is the current LTS action. No `npm install` needed — the shared script uses only Node built-ins.

**CHECKPOINT — Phase 3:**

Validate the YAML locally before pushing:

```bash
# POSIX / bash — validate YAML syntax (requires python3):
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/sync-guard.yml'))" && echo "YAML valid"
```

```powershell
# PowerShell — if python3 unavailable, inspect manually:
Get-Content .github/workflows/sync-guard.yml | Select-String "run:" | Select-Object -First 5
```

Expected: YAML valid (no exceptions). If python3 is unavailable, review the indentation manually — YAML is indent-sensitive and the `run:` blocks must be under `steps:`.

After pushing the branch, verify the workflow appears under the repo's Actions tab. If the workflow does not trigger on the PR, confirm the `paths:` filter includes the files changed by this WS.

Recovery: if the workflow fails because `packages/cairn-claude/` does not yet exist (WS03 incomplete), that is a dependency failure — WS11 cannot merge until WS03 is COMPLETE. Do not remove cairn-claude from the CI step; instead, hold WS11's merge.

---

## Phase 4 — Plant and verify deliberate drift (gate validation)

**Goal:** Prove the guard catches every failure mode it claims to catch. This phase is mandatory; it is the spec's Gate.

**IMPORTANT:** Every planted corruption in this phase must be reverted before committing. Use `git stash` or `git checkout -- <file>` after each sub-check.

### Step 4.1 — Plant byte drift in a cairn-pi skill copy and confirm --check fails

```bash
# POSIX:
echo "# planted drift" >> packages/cairn-pi/skills/spec/SKILL.md
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
echo "exit code: $?"
git checkout -- packages/cairn-pi/skills/spec/SKILL.md
```

```powershell
# PowerShell:
Add-Content packages/cairn-pi/skills/spec/SKILL.md "# planted drift"
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
Write-Host "exit code: $LASTEXITCODE"
git checkout -- packages/cairn-pi/skills/spec/SKILL.md
```

Expected: exits 1, prints "spec: copy drifted from source".

### Step 4.2 — Plant a missing copy and confirm --check fails

```bash
# POSIX:
mv packages/cairn-pi/skills/note/SKILL.md packages/cairn-pi/skills/note/SKILL.md.bak
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
echo "exit code: $?"
mv packages/cairn-pi/skills/note/SKILL.md.bak packages/cairn-pi/skills/note/SKILL.md
```

```powershell
# PowerShell:
Rename-Item packages/cairn-pi/skills/note/SKILL.md SKILL.md.bak
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
Write-Host "exit code: $LASTEXITCODE"
Rename-Item packages/cairn-pi/skills/note/SKILL.md.bak SKILL.md
```

Expected: exits 1, prints "note: missing copy".

### Step 4.3 — Plant an orphaned copy and confirm --check fails

```bash
# POSIX:
mkdir -p packages/cairn-pi/skills/orphan-test
echo "orphan" > packages/cairn-pi/skills/orphan-test/SKILL.md
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
echo "exit code: $?"
rm -r packages/cairn-pi/skills/orphan-test/
```

```powershell
# PowerShell:
New-Item -ItemType Directory -Path packages/cairn-pi/skills/orphan-test -Force | Out-Null
Set-Content packages/cairn-pi/skills/orphan-test/SKILL.md "orphan"
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
Write-Host "exit code: $LASTEXITCODE"
Remove-Item -Recurse -Force packages/cairn-pi/skills/orphan-test/
```

Expected: exits 1, prints "orphaned copy skills/orphan-test/".

### Step 4.4 — Plant a version lockstep break and confirm --check fails

```bash
# POSIX — temporarily set wrong version in cairn-pi's package.json:
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('packages/cairn-pi/package.json','utf8'));const orig=p.version;p.version='0.0.0-test';fs.writeFileSync('packages/cairn-pi/package.json',JSON.stringify(p,null,2)+'\n');console.log('set to 0.0.0-test, was '+orig)"
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
echo "exit code: $?"
git checkout -- packages/cairn-pi/package.json
```

```powershell
# PowerShell:
$p = Get-Content packages/cairn-pi/package.json | ConvertFrom-Json
$orig = $p.version; $p.version = "0.0.0-test"
$p | ConvertTo-Json -Depth 10 | Set-Content packages/cairn-pi/package.json
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
Write-Host "exit code: $LASTEXITCODE"
git checkout -- packages/cairn-pi/package.json
```

Expected: exits 1, prints "version lockstep: package.json has 0.0.0-test, VERSION has 0.13.1".

### Step 4.5 — Confirm --check is green after all revert operations

```bash
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
node scripts/sync-skills.mjs --pkg packages/cairn-claude --check
```

Expected: both exit 0. If not, one of the revert operations above missed — run `git status` and `git checkout -- <file>` on anything dirty.

**CHECKPOINT — Phase 4:**

All four failure modes (drift, missing, orphan, version) fail the check; both packages are green after reverts. If any failure mode passes (exits 0 when it should fail), the guard logic is broken — re-examine the shared script and do NOT proceed to post-flight.

---

## Post-flight

**PF-OUT-1. Final green check across all packages.**

```bash
node scripts/sync-skills.mjs --pkg packages/cairn-pi --check
node scripts/sync-skills.mjs --pkg packages/cairn-claude --check
```

Both must exit 0.

**PF-OUT-2. Confirm no vendor paths were written.**

```bash
rg -n "~/.claude|~/.gemini|~/.pi/agent|~/.agents" scripts/sync-skills.mjs .github/workflows/sync-guard.yml packages/cairn-pi/scripts/sync-skills.mjs packages/cairn-claude/scripts/sync-skills.mjs packages/cairn-pi/sync-config.json packages/cairn-claude/sync-config.json
```

Expected: zero matches. The guard touches only `files/skills/`, `packages/*/skills/`, and `packages/*/package.json` — all repo-internal paths.

**PF-OUT-3. Confirm no sentinel lines needed.** (§4 migration-reference exception does not apply — this workstream creates dev tooling, not adopt.md migration instructions. No `<!-- migration-ref -->` sentinels are required in files this WS creates.)

**PF-OUT-4. Confirm `packages/cairn-pi/skills/` is unchanged.** The refactor preserves byte-identical skill copies — git should show the scripts/ changes and new config files, but no diff to `packages/cairn-pi/skills/**`.

```bash
git diff --name-only packages/cairn-pi/skills/
```

Expected: empty (no skill copies changed by this WS).

**Commit message template:**

```
feat(ws11): generalize sync-skills guard across cairn-pi and cairn-claude

Extracts the per-package sync/check logic into a shared scripts/sync-skills.mjs,
wired per-package via a sync-config.json sidecar and a thin delegate. Adds a
.github/workflows/sync-guard.yml CI step that enforces byte-identity, description
cap, frontmatter name, and version-lockstep across all distribution packages before
merge. Gate: --check green; all four failure modes (drift, missing, orphan, version)
confirmed red. [LAW own-your-namespace] — zero writes to vendor paths.

Co-Authored-By: <your-model-id> <noreply@anthropic.com>
```

**Archive line (mark WS11 complete in the program master):**

After the commit lands, open `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §9.4 and update the WS11 row:

```
| 11 | `SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD.md` | COMPLETE | <your-agent-id> | 03, 05, 07 |
```

(Do NOT edit the program master file in this worktree — that edit is a coordination step done by the integration context after the WS11 worktree is merged.)

---

## Executor Handoff

**Read these first (in order):**

1. `packages/cairn-pi/scripts/sync-skills.mjs` — the existing 118-line precedent. Every rule in the shared script must be traceable to behavior already present here.
2. `packages/cairn-pi/sync-config.json` (after Step 1.2 creates it) or equivalently the `SKILLS` constant on line 22 of the existing script — the source-of-truth list for cairn-pi.
3. `packages/cairn-claude/package.json` + `packages/cairn-claude/skills/` — to know what WS03 committed before writing the cairn-claude sync-config.

**The one constraint most likely to cause a mistake:**

WS03 (cairn-claude package) must be COMPLETE before Phase 1, Step 1.3. If `packages/cairn-claude/skills/` doesn't exist or is empty, do NOT create a sync-config.json with placeholder skill names — the orphan check will pass with an empty list and the copy check will fail when skills are later added. STOP and wait for WS03.

**Common failure recoveries:**

- `--check` fails with "missing copy" for a skill you just added to `sync-config.json`: run sync mode first (`node scripts/sync-skills.mjs --pkg packages/<name>`) to generate the copy from source, then re-run `--check`.
- `spawnSync` in the delegate returns status 1 with no output: the shared script path is wrong — verify that `resolve(repoRoot, "scripts", "sync-skills.mjs")` correctly resolves. Run `node -e "const {resolve}=require('path');console.log(resolve(__dirname,'../..','scripts','sync-skills.mjs'))"` from `packages/<name>/scripts/`.
- CI workflow doesn't appear in Actions: GitHub requires `.github/workflows/` to exist on the default branch. Push to a PR branch; the workflow will trigger on the PR.
- Version lockstep error in CI: the package.json `version` is WS05's (cairn-pi) or WS03's (cairn-claude) responsibility. If their versioning hasn't landed yet, note the failure and do not merge WS11 until they do.

---

## Review Checklist

Before requesting peer-review, confirm each item:

- [ ] `scripts/sync-skills.mjs` exists at repo root with `--pkg` parameter and `sync-config.json` sidecar pattern.
- [ ] `packages/cairn-pi/sync-config.json` lists exactly the 6 skills currently shipped (fast-execute, note, peer-review, program, round-review, spec).
- [ ] `packages/cairn-claude/sync-config.json` lists exactly the skills WS03 committed.
- [ ] `packages/cairn-pi/scripts/sync-skills.mjs` is the thin delegate (no duplicated logic); `packages/cairn-claude/scripts/sync-skills.mjs` is the same pattern.
- [ ] Both packages' `package.json` include `sync`, `check`, and `prepublishOnly` scripts pointing at `scripts/sync-skills.mjs`.
- [ ] `.github/workflows/sync-guard.yml` exists and has a step per package.
- [ ] All four Phase 4 failure modes (drift, missing, orphan, version) were tested and failed; all reverted; both packages are green.
- [ ] `git diff --name-only packages/cairn-pi/skills/` is empty — no skill copy bytes changed.
- [ ] `rg "~/.claude|~/.gemini|~/.pi/agent" scripts/sync-skills.mjs .github/` returns zero — no vendor paths in this WS's new files.
- [ ] Program master §9.4 row 11 updated to COMPLETE (by integration context after merge).
