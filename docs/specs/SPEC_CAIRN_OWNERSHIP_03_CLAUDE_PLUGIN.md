# SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 02 · **Parallel-safe-with:** 05, 06, 07

## Goal
Package cairn's authoring/review/maintenance skills as a cairn-named **Claude Code plugin** the Claude installer places — no agent curl into `~/.claude/skills/`.

## Scope
- **Verify the Claude Code plugin format first** (`.claude-plugin/plugin.json`, marketplace.json, skills discovery) against a real install — do NOT assume.
- New `packages/cairn-claude/` with plugin manifest + `skills/` (byte-identical copies of `files/skills/`, synced per WS11).
- Decide which skills ship in the plugin vs stay source-only.
- Install path: `/plugin marketplace add` + `/plugin install` (confirm current Claude Code syntax).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`/plugin` list shows the cairn plugin loaded; a smoke-invoke of one skill confirms.

## Rollback story
Pre-production package → `git revert`; uninstall via Claude's plugin manager.

## Gate
The `cairn` plugin installs in a real Claude Code session and its skills are invocable; tarball/contents are markdown-only.

## Files
`packages/cairn-claude/**` (manifest, README, synced `skills/`).

---

## Pre-flight

Shell dialect for all command blocks below: **PowerShell** unless explicitly labelled `(POSIX)`. This executor runs on Windows 11; the cairn-pi precedent spec used POSIX — translate accordingly.

Run all commands from the cairn repo root (`C:\Users\winno\projects\cairn\cairn` on the maintainer machine). **HALTING GATE: if any expectation fails, STOP and surface the failure before Phase 1.**

```powershell
# 1. Clean working tree (or a dedicated git worktree per §9.3)
git status
# EXPECT: nothing unexpected staged; clean or feature-branch

# 2. Confirm Wave 0 deps are complete
Test-Path docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md
Test-Path docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md
# EXPECT: True True — both files exist and are COMPLETE per §9.4 table
# HALT if either is still OPEN: WS03 depends on WS01 and WS02

# 3. Source-of-truth skill count (live, not frozen)
(Get-ChildItem files/skills -Directory).Count
# EXPECT: 18 skill directories (advocate audit bridge fast-execute feedback note
# peer-review plan program prompt-evolve prune reflect reframe resume round-review
# session-distill spec tour). If count differs, rg the manifest.json for actual list
# and update the SKILLS array in Phase 3 STEP 3.1 accordingly.

# 4. Node available (needed for sync script)
node --version
# EXPECT: any v18+ (v24.x at spec time)

# 5. No packages/cairn-claude/ yet
Test-Path packages/cairn-claude
# EXPECT: False — directory does not exist yet (Phase 2 creates it)

# 6. VERSION baseline
Get-Content VERSION
# EXPECT: 0.13.1

# 7. cairn-pi precedent intact (the pattern we're replicating)
Test-Path packages/cairn-pi/scripts/sync-skills.mjs
# EXPECT: True
```

If step 2 fails (WS01 or WS02 not COMPLETE): block and notify the program orchestrator. Do not proceed past pre-flight.

If step 3 returns a count other than 18: the skill tree has grown or shrunk since spec time. Enumerate the actual directories, update Phase 3's SKILLS array to match, and note the delta in the commit message. Do NOT use the frozen count 18 — use the live count.

---

## Phase 1 — Verify the Claude Code plugin format (HALTING gate before build)

**This phase is load-bearing for WS04 (agy) and all downstream workstreams.** The program master flags the plugin format as a known risk (§6, Risk 1). Do not skip or compress this phase. Do not assume based on memory — verify against actual Claude Code behavior.

### STEP 1.1 — Probe `claude plugin` command surface

```powershell
# Shell: PowerShell
claude --help 2>&1 | Select-String -Pattern "plugin"
# Record: does 'plugin' appear as a subcommand?

claude plugin --help 2>&1
# Record the full output verbatim — capture subcommands, flags, accepted args

claude plugin list 2>&1
# Record: current installed plugins (if any) and the column format
```

EXPECTED OUTCOMES — accept any of:
- `claude plugin list` → table or list of installed plugins → plugin subcommand exists
- An error indicating no plugins installed → subcommand exists but list is empty
- "unknown command: plugin" → subcommand does NOT exist under this name; check `claude --help` for the actual term used (may be "extension", "addon", "skill-pack")

HALT IF: `claude` binary is not on PATH. Locate the Claude Code installation and add to PATH, or run from the Claude Code integrated terminal.

### STEP 1.2 — Identify plugin manifest format

The stub names `.claude-plugin/plugin.json` and `marketplace.json` as candidates. Verify the actual format:

```powershell
# Option A: inspect an existing plugin if one is installed
claude plugin list 2>&1
# If any plugin is shown, use its name below:
# claude plugin inspect <name> 2>&1  (or equivalent — check --help)

# Option B: check Claude Code docs path on disk
Get-ChildItem "$env:LOCALAPPDATA\AnthropicClaude" -Recurse -Filter "*.json" |
  Select-String -Pattern "skills|plugin" -List |
  Select-Object -First 10
# Record: any plugin.json schema fragments or examples found

# Option C: probe with a minimal candidate
# Create a temp dir outside the cairn repo:
$tmp = New-Item -ItemType Directory -Path "$env:TEMP\cairn-plugin-probe"
# Try the stub's named format:
@{ name = "cairn-probe"; version = "0.0.1"; description = "probe" } |
  ConvertTo-Json | Set-Content "$tmp\plugin.json"
claude plugin install $tmp 2>&1
# Record: success message, error, or schema-validation output
# Cleanup regardless:
Remove-Item -Recurse -Force $tmp
```

DOCUMENT the following before proceeding to Phase 2:
1. The exact manifest filename (`plugin.json`, `package.json`, `.claude-plugin`, or other).
2. The required fields in the manifest.
3. How skills are declared in the manifest (a `skills` array pointing at paths? auto-discovery of `skills/<name>/SKILL.md`?).
4. The install command (`claude plugin install <path>`, `claude plugin add <url>`, or other).
5. The list/verify command.
6. Whether a GitHub URL install is supported (important for WS04 agy's `import claude` to work against the same artifact).

### STEP 1.3 — Record findings as a comment block in the spec

After the probe, insert findings as a `<!-- PHASE-1-VERIFIED: -->` HTML comment directly below this step in the spec file (this file). This makes the format ground truth visible to WS04 without a separate document.

Example comment shape (fill in actual findings):

```
<!-- PHASE-1-VERIFIED: 2026-XX-XX
  manifest: plugin.json  required fields: name, version, description, skills
  skills: declared as { "skills": ["./skills"] } or auto-discovered from skills/<name>/SKILL.md
  install: claude plugin install <local-path>
  github: claude plugin install github:winnorton/cairn//packages/cairn-claude@main
  list/verify: claude plugin list
  notes: <any deviations from the stub's assumptions>
-->
```

**CHECKPOINT 1**

```powershell
# Verify the comment was inserted:
Select-String -Path docs/specs/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md -Pattern "PHASE-1-VERIFIED"
# EXPECT: 1 match

# The plugin subcommand is known and documented:
# (executor asserts manually) — Yes / No
```

If the Claude Code plugin format is substantially different from `plugin.json + skills/` (e.g., Claude Code uses a completely different distribution mechanism), STOP and file the finding as a note (`docs/notes/`) before proceeding. Do not build Phase 2–4 against an unverified format. Surface the discrepancy to the program orchestrator — the WS04 agy dependency and WS08 adopt-rewrite both depend on what this phase establishes.

---

## Phase 2 — Package scaffold

Create `packages/cairn-claude/`. All files in this phase are new — no existing content to anchor against. Do NOT create `packages/cairn-claude/skills/` by hand; Phase 3 generates it.

**One file per STEP. Do not combine steps.**

### STEP 2.1 — Create `packages/cairn-claude/plugin.json`

CURRENT STATE: file does not exist.

REPLACEMENT (create with this content — adjust field names if Phase 1 found a different schema):

```json
{
  "name": "cairn",
  "version": "0.13.1",
  "description": "Cairn agent skills for Claude Code — authoring, review, maintenance, and collaboration. Markdown skills only; no runtime code.",
  "skills": ["./skills"]
}
```

WHY each field:
- `"name": "cairn"` — per §2.3 (package naming frozen by WS03): the Claude Code plugin is named `cairn`, cairn-namespaced per `[LAW own-your-namespace]`. NOT `cairn-claude` (the directory name is a packaging detail; the installed plugin name is `cairn`).
- `"version": "0.13.1"` — lockstep with `VERSION` (enforced by sync script Phase 3). If VERSION reads differently in pre-flight, use that value.
- `"skills": ["./skills"]` — the harness extension point, mirroring cairn-pi's `"pi": {"skills": ["./skills"]}`. Adjust the field name if Phase 1 found a different key (e.g., `"skillsPath"`, `"skills_dir"`, or auto-discovery with no declaration needed).
- No `scripts` or `devDependencies` — this package is markdown-only; the sync script is a dev tool that never ships in the installed plugin.
- **NO `package.json`** — cairn-claude is a non-npm plugin (§3 resolved decision: "cairn-claude packaging"). A `package.json` solely to satisfy a guard is cargo-cult. Do NOT create one.

**If Phase 1 found a different manifest filename** (e.g., a manifest with a `"claude"` field, or no manifest needed because skills are auto-discovered): apply the correct name and shape here and note the deviation in the PHASE-1-VERIFIED comment.

### STEP 2.2 — Create `packages/cairn-claude/sync-config.json`

CURRENT STATE: file does not exist.

REPLACEMENT (create with this content):

```json
{
  "skills": ["./skills"],
  "versionFile": "plugin.json"
}
```

WHY: per §2.4 (single source of truth contract, frozen by WS11), each package declares its version-source file via a `versionFile` key in `sync-config.json`. For non-npm packages like this plugin, `versionFile` points to `plugin.json`. The shared `scripts/sync-skills.mjs` guard reads `sync-config.json` at startup to discover which file to consult for the version lockstep check — it does NOT hardcode `plugin.json` by name. This is the contract surface WS11's shared guard depends on; do not rename or omit this file.

### STEP 2.3 — Create `packages/cairn-claude/scripts/sync-skills.mjs`

CURRENT STATE: file does not exist.

REPLACEMENT (create with this content):

```js
#!/usr/bin/env node
// Sync the canonical cairn skill files into this package — or verify them (--check).
//
// Source of truth: <repo>/files/skills/<name>/SKILL.md. The copies under
// packages/cairn-claude/skills/ are committed build artifacts so the plugin installs
// from a local path or GitHub subpath with no build step. Byte drift between source
// and copy fails --check, which is wired to a repo CI check (owned by WS11) —
// an out-of-sync plugin fails CI. A plugin has no prepublishOnly (that is an npm lifecycle
// hook; this package has no package.json).
//
// Also enforced here:
//   - frontmatter `name:` equals the directory name and matches the canonical
//     pattern (lowercase/digits/hyphens, <= 64 chars)
//   - frontmatter `description:` <= 1024 chars after YAML line-folding
//     (the canonical SKILL.md cap shared by Claude Code and Pi)
//   - plugin.json version === <repo>/VERSION (lockstep releases)

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(pkgRoot, "..", "..");

// Read sync-config.json to discover the version-source file (§2.4 contract surface for WS11).
// For this non-npm plugin the versionFile is "plugin.json"; do NOT hardcode that name here.
const syncConfig = JSON.parse(readFileSync(join(pkgRoot, "sync-config.json"), "utf8"));
const versionFile = syncConfig.versionFile; // e.g. "plugin.json"

// ALL skills ship in the Claude plugin — it is the full-catalog distribution.
// cairn-pi ships only the 6-skill authoring loop; the Claude plugin ships all 18.
// Source: files/skills/ directories (live count from pre-flight step 3).
// To trim: remove names from this array; run `node scripts/sync-skills.mjs`; delete orphaned copies.
const SKILLS = [
  "advocate", "audit", "bridge", "fast-execute", "feedback",
  "note", "peer-review", "plan", "program", "prompt-evolve",
  "prune", "reflect", "reframe", "resume", "round-review",
  "session-distill", "spec", "tour"
];

const MAX_DESCRIPTION = 1024;
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const check = process.argv.includes("--check");

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

// Version lockstep: read the file named by sync-config.json's versionFile (e.g. plugin.json).
// Do NOT hardcode "plugin.json" — the versionFile key is the §2.4 contract surface.
const manifestJson = JSON.parse(readFileSync(join(pkgRoot, versionFile), "utf8"));
const repoVersion = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
if (manifestJson.version !== repoVersion) {
  errors.push(
    `version lockstep: ${versionFile} has ${manifestJson.version}, VERSION has ${repoVersion}`,
  );
}

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
    if (dest === null) errors.push(`${skill}: missing copy — run \`node scripts/sync-skills.mjs\``);
    else if (dest !== src) errors.push(`${skill}: copy drifted from source — run \`node scripts/sync-skills.mjs\``);
  } else {
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(srcPath, destPath);
    console.log(`synced ${skill}`);
  }
}

// Orphaned copies: a dir under skills/ no longer in SKILLS would otherwise pass
// --check and still ship.
let shipped = [];
try {
  shipped = readdirSync(join(pkgRoot, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
} catch {
  /* skills/ absent — first sync run creates it */
}
for (const dir of shipped) {
  if (!SKILLS.includes(dir)) {
    errors.push(`orphaned copy skills/${dir}/ not in the SKILLS array — delete it or re-add the skill`);
  }
}

if (errors.length) {
  console.error(`\n${check ? "check" : "sync"} FAILED:\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(
  check
    ? `check OK — ${SKILLS.length} skills in sync, lockstep ${repoVersion}`
    : `sync complete — ${SKILLS.length} skills`,
);
```

WHY: identical logic to `packages/cairn-pi/scripts/sync-skills.mjs` per `[LAW borrow-adjacent]`, with four changes:
1. Reads `sync-config.json` at startup and uses its `versionFile` key to locate the version-source manifest — indirection required by §2.4 so the shared WS11 guard works for both npm and non-npm packages without hardcoding `plugin.json`.
2. Version-lockstep check reads the file named by `versionFile` (`plugin.json` for this non-npm plugin) — no `package.json` anywhere.
3. `SKILLS` array is ALL 18 skills (the Claude plugin is the full-catalog channel; cairn-pi is the 6-skill authoring-loop-only channel).
4. Error messages reference `node scripts/sync-skills.mjs` instead of `npm run sync` — this package has no `package.json` and therefore no npm wrapper; run node directly. The guard wires to CI (owned by WS11), NOT `prepublishOnly` (a plugin has no npm publish lifecycle).

### STEP 2.4 — Create `packages/cairn-claude/README.md`

CURRENT STATE: file does not exist.

REPLACEMENT (create with this content):

````markdown
# cairn (Claude Code plugin)

[cairn](https://github.com/winnorton/cairn)'s full skill catalog packaged as a
Claude Code plugin. Markdown skills only — no runtime code, no build step.

## Install

```
claude plugin install github:winnorton/cairn//packages/cairn-claude@main
```

Or from a local clone:

```powershell
# PowerShell (Windows)
claude plugin install <absolute-path-to-repo>\packages\cairn-claude
```

```bash
# POSIX (macOS/Linux)
claude plugin install /path/to/cairn/packages/cairn-claude
```

After install, confirm with:

```
claude plugin list
# expect: cairn  0.13.1  ...
```

## What you get

All 18 cairn skills, invocable as `/skill-name` in Claude Code:

| Category | Skills |
|---|---|
| Maintenance | `/tour`, `/reflect`, `/plan`, `/prune`, `/audit`, `/feedback` |
| Collaboration | `/reframe`, `/bridge`, `/advocate` |
| Cross-perspective | `/resume`, `/peer-review`, `/session-distill` |
| Artifact | `/note`, `/spec`, `/program`, `/round-review`, `/fast-execute`, `/prompt-evolve` |

## Invocation note

After plugin install, skills are invoked as `/name` (e.g. `/spec`, `/peer-review`).
These are the same skill bodies as `files/skills/<name>/SKILL.md` in the cairn repo
— byte-identical copies, never Pi-localized. The `/skill:x` vs `/x` difference is
a harness invocation convention, not a body fork.

## agy (Antigravity CLI) users

agy can consume this same plugin via:

```
agy plugin import claude
```

See [WS04 spec](../../docs/specs/SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md) for
the validated `agy plugin import claude` flow.

## Source of truth

`files/skills/<name>/SKILL.md` in the
[cairn repo](https://github.com/winnorton/cairn) is canonical. `skills/` here is a
committed byte-identical copy enforced by `scripts/sync-skills.mjs --check`. Send
PRs against the source files, not these copies. Versions are lockstep with cairn
releases.

## License

MIT
````

WHY: The README surfaces the GitHub install path (load-bearing for WS04's `agy plugin import claude`, which targets the same URL), the agy cross-harness note (so WS04 doesn't need a separate install artifact), and the source-of-truth pointer consistent with cairn-pi's README.

### STEP 2.5 — Create `packages/cairn-claude/LICENSE`

CURRENT STATE: file does not exist.

REPLACEMENT (create with this content):

```
MIT License

Copyright (c) 2026 Win Norton

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

WHY: same rationale as cairn-pi — the repo has no root LICENSE file (verified), so each package carries its own. Consistent with cairn-pi's LICENSE.

**CHECKPOINT 2**

```powershell
# Shell: PowerShell
# Syntax-check the sync script:
node --check packages/cairn-claude/scripts/sync-skills.mjs
# EXPECT: exits 0 (no output = OK)

# plugin.json parses and has required fields:
$p = Get-Content packages/cairn-claude/plugin.json | ConvertFrom-Json
$p.name, $p.version, $p.skills
# EXPECT: cairn  0.13.1  ./skills (or the skills array from Phase 1)

# All five files exist (note: NO package.json):
@(
  "packages/cairn-claude/plugin.json",
  "packages/cairn-claude/sync-config.json",
  "packages/cairn-claude/scripts/sync-skills.mjs",
  "packages/cairn-claude/README.md",
  "packages/cairn-claude/LICENSE"
) | ForEach-Object { Test-Path $_ }
# EXPECT: True True True True True

# sync-config.json has the required keys:
$sc = Get-Content packages/cairn-claude/sync-config.json | ConvertFrom-Json
$sc.versionFile
# EXPECT: plugin.json

# No package.json — this is a non-npm plugin:
Test-Path packages/cairn-claude/package.json
# EXPECT: False
```

If `node --check` rejects the script: most likely a smart-quote or truncated line from manual transcription — re-apply STEP 2.3 exactly.

---

## Phase 3 — Generate the committed skill copies

### STEP 3.1 — Run the sync (writes `packages/cairn-claude/skills/**`)

CURRENT STATE: `packages/cairn-claude/skills/` does not exist.

```powershell
# Shell: PowerShell
node packages/cairn-claude/scripts/sync-skills.mjs
# EXPECT: "synced <skill>" x18 + "sync complete — 18 skills"
# (count matches the live pre-flight count; update if pre-flight found a different number)

node packages/cairn-claude/scripts/sync-skills.mjs --check
# EXPECT: "check OK — 18 skills in sync, lockstep 0.13.1"

git add packages/cairn-claude
```

WHY: the copies are committed build artifacts so `claude plugin install github:...` works with no build step (same rationale as cairn-pi). Never hand-edit copies; the source is `files/skills/<name>/SKILL.md`.

**CHECKPOINT 3**

```powershell
# Shell: PowerShell
# Correct skill count:
(Get-ChildItem packages/cairn-claude/skills -Directory).Count
# EXPECT: 18 (or the live pre-flight count)

# No byte drift:
$skills = (Get-ChildItem packages/cairn-claude/skills -Directory).Name
foreach ($s in $skills) {
  $src = Get-Content "files/skills/$s/SKILL.md" -Raw
  $dst = Get-Content "packages/cairn-claude/skills/$s/SKILL.md" -Raw
  if ($src -ne $dst) { Write-Host "DRIFT: $s" }
}
# EXPECT: no DRIFT lines

# README.md is not in the skills copies (it's not a skill):
Test-Path packages/cairn-claude/skills/README.md
# EXPECT: False
```

If sync reports description over-cap on any skill: fix at source (`files/skills/<name>/SKILL.md`), never in the copy. Re-run sync after fixing. The cairn-pi precedent already fixed `round-review` (1051→1021 chars at v0.13.1); if a new skill has been added since that fix, check its description length.

If `--check` fails with "version lockstep" error: the `plugin.json` version doesn't match `VERSION`. Re-apply STEP 2.1 with the correct version from pre-flight step 6.

---

## Phase 4 — Local Claude Code install validation (HALTING gate before GitHub push)

This phase validates the actual plugin install surface before the package is pushed upstream for WS04's `agy plugin import claude` dependency.

### STEP 4.1 — Install from local path

```powershell
# Shell: PowerShell — run from the cairn repo root
$repoRoot = (Get-Location).Path
claude plugin install "$repoRoot\packages\cairn-claude"
# EXPECT: success confirmation from Claude Code
# Record: exact install message verbatim
```

### STEP 4.2 — Verify plugin appears in list

```powershell
claude plugin list
# EXPECT: `cairn` appears in the list at version 0.13.1
# HALT if not: the plugin.json fields may not match what Claude Code requires;
# re-examine the manifest format from Phase 1 STEP 1.2 findings and adjust.
```

### STEP 4.3 — Smoke-invoke one skill

In a **scratch project directory** (NOT the cairn repo — per "Don't adopt cairn into cairn" AGENTS.md rule):

```powershell
# Open a new Claude Code session in a scratch directory, then invoke:
# /note smoke test from cairn plugin validation
# EXPECT: the /note skill body fires and creates docs/notes/NOTE_*.md in the scratch dir
```

### STEP 4.4 — Uninstall after validation

```powershell
claude plugin uninstall cairn
# (or the correct uninstall subcommand from Phase 1 Step 1.1 probe)
# EXPECT: cairn no longer appears in `claude plugin list`
```

**CHECKPOINT 4**

Pass = Steps 4.1–4.3 succeed and 4.4 cleans up. Record the smoke-test result (success or skip with reason) — WS04 needs to know this passed before it can proceed.

**If the `claude` CLI is not available on the executing machine:** record `Phase 4 SKIPPED — Claude Code CLI not on executor PATH` in the commit body. The maintainer runs this phase before the WS04 executor begins. Do NOT proceed to Phase 5 (GitHub push) until Phase 4 has passed or been explicitly waived by the maintainer.

**Ownership check:** the install must be performed by the maintainer or a user action — not an agent `Write` into `~/.claude/**`. The `claude plugin install` command is the vendor-run installer per §4 rule 2 of the program master. If anything in this phase requires the agent to write directly into `~/.claude/`, STOP — that violates the hard contract. Use the CLI installer exclusively.

---

## Phase 5 — Push to GitHub (enables WS04 `agy plugin import claude`)

**Gate: Phase 4 must pass first.** This phase makes the plugin available via GitHub URL, which is the install path WS04 depends on for `agy plugin import claude`.

### STEP 5.1 — Commit the cairn-claude package

```powershell
# Shell: PowerShell
git add packages/cairn-claude
git status
# EXPECT: packages/cairn-claude/** all staged; no other unexpected files

git commit -m "$(cat <<'EOF'
feat(packages): cairn-claude — full-catalog Claude Code plugin

Packages all 18 cairn skills as a Claude Code plugin (`cairn`)
that the Claude installer places — no agent curl into ~/.claude/skills/.
One plugin, two harnesses: Claude Code installs directly; agy consumes
via `agy plugin import claude` (see WS04).

Pattern mirrors packages/cairn-pi/ (same sync-script + drift-guard,
different manifest). Skill bodies are byte-identical committed copies
of files/skills/, regenerated by scripts/sync-skills.mjs; --check
fails on drift, VERSION-lockstep breaks, and descriptions over the
1024-char cap.

Plugin name `cairn` per §2.3 (frozen by WS03). [LAW own-your-namespace]
[LAW borrow-adjacent] [LAW commit-cite]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### STEP 5.2 — Push (maintainer action)

```powershell
# Maintainer pushes to main (or opens a PR — per the worktree integration protocol §9.3):
git push origin main
# or: git push origin <worktree-branch>
```

**CHECKPOINT 5**

```powershell
# Verify GitHub URL resolves (after push):
# In a browser or via curl:
# https://github.com/winnorton/cairn/tree/main/packages/cairn-claude
# EXPECT: the directory is visible with plugin.json, README.md, LICENSE, skills/

# The GitHub install command (from README.md) should work:
claude plugin install github:winnorton/cairn//packages/cairn-claude@main
# EXPECT: success  (run in a clean environment or uninstall first via Step 4.4)
claude plugin list
# EXPECT: cairn 0.13.1 (or similar confirmation)
claude plugin uninstall cairn
```

If the GitHub install syntax differs from `github:owner/repo//subpath@branch` — verify the correct Claude Code GitHub install syntax from Phase 1 Step 1.1 probe output and update the README.md (STEP 2.4) accordingly.

---

## Post-flight

```powershell
# Shell: PowerShell
# 1. Sync guard still green after everything:
node packages/cairn-claude/scripts/sync-skills.mjs --check
# EXPECT: "check OK — 18 skills in sync, lockstep 0.13.1"

# 2. Ownership constraint — no cairn write landed in a vendor path:
# (manual assertion) Review git diff HEAD -- ~/.claude/ -- ~/.gemini/ -- ~/.pi/
# EXPECT: no changes to any vendor-owned path; all changes are under packages/cairn-claude/

# 3. No sentinel violations — no vendor paths in the shipped files without migration-ref:
rg -n "~/.claude|~/.gemini|~/.pi/agent" packages/cairn-claude/ | rg -v "migration-ref"
# EXPECT: zero matches (any vendor path mention in README must be documentation,
# not a write target; the README's agy/install text uses CLI commands, not paths)

# 4. Phase 1 comment inserted:
Select-String -Path docs/specs/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md -Pattern "PHASE-1-VERIFIED"
# EXPECT: 1 match

# 5. Git status shows only expected changes:
git status
git diff HEAD --stat
# EXPECT: packages/cairn-claude/** (new) + this spec file (status header + Phase 1 comment)
```

Commit message template (if not already committed in Phase 5):

```
feat(packages): cairn-claude — full-catalog Claude Code plugin

Packages all 18 cairn skills as a Claude Code plugin (`cairn`).
Install: claude plugin install github:winnorton/cairn//packages/cairn-claude@main
agy cross-harness: agy plugin import claude (see WS04).

Sync-script + drift-guard mirrors packages/cairn-pi/ pattern.
Phase 1 format-verification findings recorded in spec as
PHASE-1-VERIFIED comment (executor-grounded, not assumed).

[LAW own-your-namespace] [LAW borrow-adjacent] [LAW commit-cite]
```

Archive the spec after Gate passes (peer-review complete, no blockers):

```powershell
# Shell: PowerShell
git mv docs/specs/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md `
       docs/specs/archive/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md
```

---

## Executor Handoff

**Critical files to read first, in order:**

1. **`packages/cairn-pi/scripts/sync-skills.mjs`** — the exact pattern being replicated. Read before writing STEP 2.3's script; key differences from the template are intentional: (a) reads `sync-config.json` at startup and uses its `versionFile` key (indirection required by §2.4) rather than hardcoding `plugin.json`; (b) no `package.json` anywhere — `sync-config.json` + `plugin.json` replace it; (c) SKILLS array is all-18 vs cairn-pi's 6-skill subset; (d) run via `node scripts/sync-skills.mjs` not `npm run sync`; (e) CI-check not prepublishOnly.
2. **`docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md`** — the empirical probe of agy's plugin format. The key finding: `agy plugin import claude` exists and is verified in agy 1.0.7. WS04 depends on the GitHub URL that Phase 5 publishes; don't delay Phase 5.
3. **`docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §4** — the hard ownership contract. Every STEP in this spec must satisfy the four rules; the most likely trap is Phase 4 (install validation), which must go through `claude plugin install` (the vendor's CLI) and never through an agent `Write` into `~/.claude/`.

**The one constraint most likely to cause a mistake:** Phase 1 is a HALTING gate, not a formality. If the Claude Code plugin format turns out to differ from `plugin.json + skills/ array` (e.g., it uses a different manifest file, or skills are auto-discovered without declaration), the manifest you create in STEP 2.1, the `versionFile` in STEP 2.2's `sync-config.json`, and the version-lockstep check in STEP 2.3 must all match what Phase 1 actually found. Building on an unverified assumption here breaks WS04's `agy plugin import claude` dependency.

**The second constraint (ownership):** the plugin name in `plugin.json` MUST be `cairn` (per §2.3, frozen by WS03). The directory `packages/cairn-claude/` is a packaging detail; the installed plugin name is `cairn`. Do not rename to `cairn-claude` in the manifest.

**Recovery for common failures:**

- *Phase 1 finds no `claude plugin` subcommand* — Claude Code may use a different distribution mechanism (extensions, addons, or direct marketplace). STOP. File a note in `docs/notes/` with the actual finding, surface to the program orchestrator, and wait for a revised approach before building Phase 2–5. WS04 cannot proceed until this is resolved.
- *Phase 3 sync reports description over-cap* — a skill added since v0.13.1 may exceed 1024 chars. Fix at `files/skills/<name>/SKILL.md` (source), never in the copy. Re-run sync; the check guards against re-introduction.
- *Phase 4 install fails with schema error* — plugin.json fields don't match what Claude Code expects. Return to Phase 1 Step 1.2, re-probe the actual schema, and update STEP 2.1 + the PHASE-1-VERIFIED comment. Do not push to GitHub until local install works.
- *Phase 5 GitHub URL syntax wrong* — the `github:owner/repo//subpath@branch` form is the agy-documented pattern (confirmed in the agy note); Claude Code may use a different syntax. Check Phase 1 Step 1.1 probe output for the exact install form.
- *Ownership violation detected in post-flight grep* — a vendor path string appears in the shipped files without `migration-ref`. The README's agy/claude install examples use CLI commands as documentation; if a write target crept in, remove it. No `~/.claude/**` strings may appear as targets in `packages/cairn-claude/` files.

---

## Review Checklist

- [ ] Phase 1 PHASE-1-VERIFIED comment is present in this spec with actual findings (not left as the example template).
- [ ] `plugin.json` fields match what Phase 1 verified; `name` is `cairn`; `version` matches `VERSION` file.
- [ ] `sync-config.json` present at `packages/cairn-claude/sync-config.json`; `versionFile` key is `"plugin.json"`.
- [ ] `package.json` does NOT exist anywhere under `packages/cairn-claude/` — this is a non-npm plugin; `Test-Path packages/cairn-claude/package.json` returns False.
- [ ] `scripts/sync-skills.mjs` passes `node --check`; `node … --check` is green with 18 skills (or the live pre-flight count).
- [ ] 18 skill copies (or live count) are byte-identical to `files/skills/` sources (CHECKPOINT 3 PowerShell loop shows no DRIFT lines).
- [ ] `skills/README.md` was NOT copied (it is not a skill; the sync script's orphan check would catch it if mistakenly added).
- [ ] Phase 4 local install smoke test passed, or its skip is recorded in the commit body with maintainer waiver before Phase 5.
- [ ] Post-flight ownership grep returns zero matches: `rg -n "~/.claude|~/.gemini|~/.pi/agent" packages/cairn-claude/`.
- [ ] PHASE-1-VERIFIED comment: `Select-String … -Pattern "PHASE-1-VERIFIED"` returns 1 match.
- [ ] Commit message cites `[LAW own-your-namespace]`, `[LAW borrow-adjacent]`, `[LAW commit-cite]`.
- [ ] WS04 executor has been notified: the GitHub URL from Phase 5 is available and the Phase 4 smoke-test result is recorded.
