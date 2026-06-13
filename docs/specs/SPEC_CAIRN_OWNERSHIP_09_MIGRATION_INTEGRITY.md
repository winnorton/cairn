# SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 04, 05, 06, 08 · **Parallel-safe-with:** 10 (Wave 2)

## Goal
Give v0.13.x adopters a user-driven, **non-destructive** migration to the `.cairn/` model plus a cleanup of stale vendor-folder skill residue, and a lightweight install-integrity check.

## Scope
- **Migration is copy-then-verify-then-optionally-delete — never `move` (N1 blocker).** Explicit ordered phases the agent SHOWS and the user RUNS:
  1. **Copy** `~/.claude/memory/<slug>/*` + `<project>/.claude/LAWS.md` + the `cairn-version` marker → `<project>/.cairn/...` (originals untouched).
  2. **Verify** each copy is present and non-empty (byte-count/hash).
  3. **Show** the user the verification result.
  4. **Optionally delete** originals as a *separate*, explicitly user-confirmed step. No destructive default; a half-finished migration leaves the v0.13.x state intact.
- **Every vendor-path string written into `adopt.md`'s migration text carries the `<!-- migration-ref -->` sentinel** (master §4) so DoD#1's grep excludes it. WS09 is the sole owner of that sentinel's application.
- **Residue cleanup is gated on the replacement being live (N2 blocker).** Remove the Pi `404: Not Found` bodies (`~/.pi/agent/skills/{program,round-review}`) and the agy flat-format + legacy `review/` ONLY after confirming the package-delivered replacement is installed and loadable, **gated per-harness**: `@winnorton/cairn-pi` for the Pi residue; the `cairn` Claude plugin for the Claude residue; the `cairn` plugin **imported + loadable in agy** via `agy plugin import claude` (WS04) before removing the `~/.gemini/config/skills/` residue. Hence the deps on WS05 (Pi model) and WS04 (agy import). Pre-flight each residue path: if absent, skip and report "not found" — never fail the migration.
- **agy residue paths are distinct and both stated** (avoids the wrong-dir no-op): agy *skills* live under `~/.gemini/config/skills/` (binary-verified 2026-06-13, see `docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md`); agy/Antigravity-IDE *memory* under `~/.gemini/antigravity/`. The skills-residue cleanup targets `config/skills/`.
- **Cowork adopters:** memory is file-tool-only and deletion is unsupported — use index tombstoning (remove from `MEMORY.md` index; mark orphaned-but-present), not file removal; laws migration uses the shell fallback per `adopt.md` Step 3. Mirror the existing `adopt.md` Cowork notes.
- **Import line is a mandatory migration step (not just fresh-install).** Migration concludes with the WS02 user-action: show `@./.cairn/CLAUDE.md` (or the AGENTS.md analog) and require the user to add it. The integrity check **fails** (not warns) if the import line is absent — without it the migrated habitat is silently non-functional.
- **cairn-version fast-path coordination:** the marker moves `<project>/.claude/cairn-version` → `<project>/.cairn/cairn-version`. WS08 must update `adopt.md`'s Step 2 fast-path to read `{projectRoot}/.cairn/cairn-version`; WS09's migration retires the old `<project>/.claude/cairn-version` so a stale marker can't trigger a false fresh-install on re-adoption.
- **Install-integrity check (implements the diagnostic WS01 defines, N5):** `.cairn/` exists + required files present + import line present in the context file → report health.

## Telemetry hook
N/A: markdown framework.

## Diagnostics path
This workstream IS the diagnostics surface — the install-integrity check above.

## Rollback story
Copy-then-verify, dry-run-first; originals retained until the user runs the separate delete step; no destructive default.

## Gate
Migration covers all v0.13.x paths (Claude Code + Cowork), is copy-then-verify (non-destructive), gates residue removal on replacement-installed, requires the import line, retires the old marker, and passes a smoke test against a **committed** fixture.

## Files
`adopt.md` (migration section, with `<!-- migration-ref -->` sentinels), `test/fixtures/v0.13.x/` (committed canonical fixture: `<project>/.claude/{LAWS.md,cairn-version}`, `~/.claude/memory/<slug>/MEMORY.md` + ≥1 typed entry, ≥1 `~/.claude/skills/<name>/SKILL.md`), optional `scripts/` (dry-run helper / integrity check).

---

## Pre-flight

Run these commands before Phase 1. Each has an EXPECTED RESULT. If the result does not match, **STOP and surface the discrepancy** — do not proceed.

All commands are **PowerShell** unless labelled `(POSIX)`. On Windows use PowerShell; on macOS/Linux switch to bash equivalents (paths remain the same, replace `$env:USERPROFILE` with `~`).

**PF-1. Confirm WS01 tree is present (`.cairn/` templates exist in source).**
```powershell
# PowerShell
Test-Path "C:\Users\winno\projects\cairn\cairn\files\.cairn\CLAUDE.md"
```
EXPECTED: `True`
If `False`: WS01 is not complete. **STOP. WS01 must land before executing this spec.**

**PF-2. Confirm WS08 adopt.md ships no vendor writes (adopted new flow).**
```powershell
# PowerShell — zero matches = pass
Select-String -Path "adopt.md" -Pattern "~/.claude/skills|~/.pi/agent/skills|~/.gemini/config/skills" -SimpleMatch | Where-Object { $_ -notmatch "migration-ref" }
```
EXPECTED: zero output lines
If output: WS08 is not complete. **STOP. WS08 must land before executing this spec.**

**PF-3. Confirm WS04 agy import path is documented (adopt.md has agy branch).**
```powershell
# PowerShell
Select-String -Path "adopt.md" -Pattern "agy plugin import claude" -SimpleMatch
```
EXPECTED: at least one match line
If zero: WS04 agy step is missing from adopt.md. **STOP. WS04 must land first.**

**PF-4. Confirm WS05 Pi model is documented (adopt.md has pi install npm line).**
```powershell
# PowerShell
Select-String -Path "adopt.md" -Pattern "pi install npm:@winnorton/cairn-pi" -SimpleMatch
```
EXPECTED: at least one match line
If zero: WS05 is not complete. **STOP. WS05 must land first.**

**PF-5. Confirm WS06 manifest has `.cairn/` dests (not `{projectClaude}` for state).**
```powershell
# PowerShell
Select-String -Path "manifest.json" -Pattern ".cairn/" -SimpleMatch
```
EXPECTED: at least one match line
If zero: WS06 is not complete. **STOP. WS06 must land first.**

**PF-6. Baseline the v0.13.x residue that this spec will instruct users to clean up.**
```powershell
# PowerShell — run each; record which exist (will be referenced in Phase 3)
Test-Path "$env:USERPROFILE\.pi\agent\skills\program\SKILL.md"   # known Pi residue
Test-Path "$env:USERPROFILE\.pi\agent\skills\round-review\SKILL.md"  # known Pi residue
Test-Path "$env:USERPROFILE\.gemini\config\skills\review\SKILL.md"   # agy legacy /review
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills\*.md" -ErrorAction SilentlyContinue | Select-Object Name  # agy flat-format
```
EXPECTED: this is a discovery command, not a gate. Record output. Use it to verify Phase 3 cleanup instructions match actual residue. At time of writing (2026-06-13): Pi lacks `program/` and `round-review/` (not installed yet, not residue); agy has flat-format files `advocate.md`, `bridge.md`, `plan.md`, `reflect.md`, `reframe.md`, `resume.md` and legacy subdir `review/`. If your baseline differs, adjust Phase 3 accordingly.

**PF-7. Confirm the test/fixtures directory does not already exist.**
```powershell
# PowerShell
Test-Path "test\fixtures\v0.13.x"
```
EXPECTED: `False` (we will create it in Phase 1)
If `True`: a prior partial run exists. Inspect it; decide whether to delete and restart or resume.

---

## Phase 1 — Commit the v0.13.x Fixture

Goal: establish `test/fixtures/v0.13.x/` as a committed, representative snapshot of a real v0.13.x install. The smoke test in Phase 4 runs against this fixture — if it is too sparse the test passes vacuously.

**STEP 1.1 — Create the fixture directory tree.**

Current state: `test/fixtures/v0.13.x/` does not exist (confirmed PF-7).

```powershell
# PowerShell
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\.claude"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\memory\feedback"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\memory\project"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\memory\reference"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\memory\user"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\skills\spec"
New-Item -ItemType Directory -Force "test\fixtures\v0.13.x\home-claude\skills\peer-review"
```

WHY: the fixture must mirror a real v0.13.x install layout. `home-claude/` represents `~/.claude/`; `.claude/` represents `<project>/.claude/`. Using local paths lets the fixture be committed without embedding real user paths.

**STEP 1.2 — Write fixture `.claude/LAWS.md`.**

Current state: file does not exist.

```powershell
# PowerShell
@'
# Laws — [Project Name]

> v0.13.1 fixture — represents <project>/.claude/LAWS.md from a v0.13.x install.

## Meta-laws

**[LAW shape]** Laws have slugs, not numbers.
**[LAW cite]** Cite laws as `[LAW <slug>]`.

## Project laws

**[LAW plan]** Plan before you build.
**[LAW confirm]** Confirm before destructive actions.
'@ | Set-Content "test\fixtures\v0.13.x\.claude\LAWS.md" -Encoding UTF8
```

WHY: a non-empty, structurally valid LAWS.md. The smoke test verifies it copies intact to `.cairn/LAWS.md`.

**STEP 1.3 — Write fixture `.claude/cairn-version`.**

Current state: file does not exist.

```powershell
# PowerShell
"0.13.1" | Set-Content "test\fixtures\v0.13.x\.claude\cairn-version" -Encoding UTF8 -NoNewline
```

WHY: the cairn-version marker is what the migration retires (it moves to `.cairn/cairn-version`). Without it, the fast-path coordination test (Phase 4 STEP 4.4) cannot verify retirement.

**STEP 1.4 — Write fixture `home-claude/memory/MEMORY.md`.**

Current state: file does not exist.

```powershell
# PowerShell
@'
# Memory Index

One line per memory. See individual files for detail.

## feedback
- [Model routing: Opus specs, Flash executes](feedback/model-routing.md) — fixture entry
- [Bundle causally-connected findings](feedback/bundle-findings.md) — fixture entry

## project
- [Cairn v0.14 ownership program](project/v014-program.md) — fixture entry
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\memory\MEMORY.md" -Encoding UTF8
```

WHY: a representative MEMORY.md with typed entries. The migration must update this index when entries move to `.cairn/memory/`.

**STEP 1.5 — Write fixture typed memory entries.**

Current state: files do not exist.

```powershell
# PowerShell
@'
---
type: feedback
---
User delegates coding to Gemini Flash 3.5; Opus only for specs/planning/synthesis.
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\memory\feedback\model-routing.md" -Encoding UTF8

@'
---
type: feedback
---
When /session-distill findings co-occur at same inflection point, ship in one commit.
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\memory\feedback\bundle-findings.md" -Encoding UTF8

@'
---
type: project
---
Ownership program underway; target v0.14.0; state moving to .cairn/.
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\memory\project\v014-program.md" -Encoding UTF8
```

WHY: typed entries with `type:` frontmatter. The fixture must have at least one typed entry per the stub's "≥1 typed entry" requirement so the migration classification logic is exercised.

**STEP 1.6 — Write fixture skill stubs.**

Current state: files do not exist.

```powershell
# PowerShell — write a minimal but structurally valid SKILL.md for each
@'
---
name: spec
description: Research the codebase and write a structured agent execution spec.
license: MIT
---
# Spec skill (fixture v0.13.1)
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\skills\spec\SKILL.md" -Encoding UTF8

@'
---
name: peer-review
description: External-perspective review of a change set.
license: MIT
---
# Peer-review skill (fixture v0.13.1)
'@ | Set-Content "test\fixtures\v0.13.x\home-claude\skills\peer-review\SKILL.md" -Encoding UTF8
```

WHY: the stub requires "≥1 `~/.claude/skills/<name>/SKILL.md`". Two representative skills give Phase 4's smoke test a real path-resolution check without duplicating all 17 source skills.

**STEP 1.7 — Write a `README.md` in the fixture root explaining its purpose.**

Current state: file does not exist.

```powershell
# PowerShell
@'
# test/fixtures/v0.13.x

Committed snapshot of a representative v0.13.1 install layout. Used by WS09 migration
smoke test (Phase 4 of SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md).

Layout mapping:
  .claude/          → <project>/.claude/  (LAWS.md, cairn-version)
  home-claude/      → ~/.claude/          (memory/, skills/)

This fixture is representative, not minimal:
  - MEMORY.md with entries in 2 typed subdirs (feedback/, project/)
  - 2 typed memory entry files with frontmatter
  - 2 skill subdirs with valid SKILL.md frontmatter

Do NOT expand this fixture without updating the smoke test in Phase 4.
'@ | Set-Content "test\fixtures\v0.13.x\README.md" -Encoding UTF8
```

WHY: a fixture without a README is an unexplained directory; the README also constrains future fixture expansion to stay in sync with the test.

**CHECKPOINT 1** — verify fixture was created correctly.

```powershell
# PowerShell
Get-ChildItem -Recurse "test\fixtures\v0.13.x" | Select-Object FullName
```

EXPECTED: 12 items — `README.md`, `.claude/LAWS.md`, `.claude/cairn-version`, `home-claude/memory/MEMORY.md`, `home-claude/memory/feedback/model-routing.md`, `home-claude/memory/feedback/bundle-findings.md`, `home-claude/memory/project/v014-program.md`, `home-claude/memory/{user,reference}/` dirs (empty), `home-claude/skills/spec/SKILL.md`, `home-claude/skills/peer-review/SKILL.md`.

```powershell
# Verify cairn-version contains exactly the version string
Get-Content "test\fixtures\v0.13.x\.claude\cairn-version"
```

EXPECTED: `0.13.1` (no trailing newline matters less than exact content).

If CHECKPOINT 1 fails: `Remove-Item -Recurse test\fixtures\v0.13.x` and re-run Phase 1 from STEP 1.1.

---

## Phase 2 — Write the Migration Section in adopt.md

Goal: add a `## v0.13.x → v0.14.0 (.cairn/) migration` section to `adopt.md`. This section contains EVERY vendor-path string marked `<!-- migration-ref -->`. WS09 is the sole owner of that sentinel.

**STEP 2.1 — Locate the insertion point in adopt.md.**

Current state: `adopt.md` ends with the `## v0.13.0 → v0.13.1 /review → /peer-review rename note` section (confirmed by reading adopt.md). There is no v0.14.0 migration section yet.

The new section goes at the END of adopt.md, after the last existing migration note. No existing content is modified.

**STEP 2.2 — Append the migration section to adopt.md.**

Current state: adopt.md line 658 is the last line of the `/review → /peer-review` section.

Replacement: append the following block verbatim (the `<!-- migration-ref -->` sentinels are load-bearing — do not omit or relocate them):

```powershell
# PowerShell
$migrationSection = @'

## v0.13.x → v0.14.0 (.cairn/) migration

v0.14.0 moves all cairn state from vendor-owned directories (`<project>/.claude/`,
`~/.claude/memory/`, `~/.pi/agent/memory/`) into a cairn-owned directory
`<project>/.cairn/`. This is user-driven: you run each phase and confirm before the
next. **Migration is copy-then-verify — originals are untouched until you explicitly
delete them in Phase D.**

### When to run

Run this migration when:
- You are upgrading from any v0.13.x install (v0.13.0, v0.13.1) to v0.14.0+.
- Step 2's fast-path finds `<project>/.claude/cairn-version` (the old marker path)
  rather than `<project>/.cairn/cairn-version` (the new path).
- The agent reports that `.cairn/` is absent but `<project>/.claude/cairn-version` exists.

Skip this migration for fresh installs (no prior cairn state) — proceed with the normal
adopt flow.

### Prerequisites

Before running any migration phase, confirm:
1. The `cairn` Claude Code plugin is installed (or `@winnorton/cairn-pi` for Pi, or
   `agy plugin import claude` for Antigravity). The replacement must be live before
   you remove any residue (Phase C).
2. You are running in the adopter project's directory (not cairn's own repo).
3. You have a recent git commit or backup — migration is non-destructive by design,
   but accidents happen.

### Phase A — Copy state to .cairn/

The agent performs these actions. You confirm the plan before each write.

**A1. Create the `.cairn/` directory tree.**

```bash
# POSIX
mkdir -p <project>/.cairn/memory/feedback
mkdir -p <project>/.cairn/memory/project
mkdir -p <project>/.cairn/memory/reference
mkdir -p <project>/.cairn/memory/user
mkdir -p <project>/.cairn/context
```

```powershell
# PowerShell
New-Item -ItemType Directory -Force "<project>/.cairn/memory/feedback"
New-Item -ItemType Directory -Force "<project>/.cairn/memory/project"
New-Item -ItemType Directory -Force "<project>/.cairn/memory/reference"
New-Item -ItemType Directory -Force "<project>/.cairn/memory/user"
New-Item -ItemType Directory -Force "<project>/.cairn/context"
```

**A2. Copy LAWS.md.**

Source: `<project>/.claude/LAWS.md` <!-- migration-ref -->
Dest:   `<project>/.cairn/LAWS.md`

```bash
# POSIX
cp "<project>/.claude/LAWS.md" "<project>/.cairn/LAWS.md"  # <!-- migration-ref -->
```

```powershell
# PowerShell
Copy-Item "<project>\.claude\LAWS.md" "<project>\.cairn\LAWS.md"  # <!-- migration-ref -->
```

Skip if source does not exist; report "LAWS.md not found at old path — skipping."

**A3. Copy cairn-version marker.**

Source: `<project>/.claude/cairn-version` <!-- migration-ref -->
Dest:   `<project>/.cairn/cairn-version`

```bash
# POSIX
cp "<project>/.claude/cairn-version" "<project>/.cairn/cairn-version"  # <!-- migration-ref -->
```

```powershell
# PowerShell
Copy-Item "<project>\.claude\cairn-version" "<project>\.cairn\cairn-version"  # <!-- migration-ref -->
```

**A4. Copy memory files.**

For Claude Code, the memory root is either `~/.claude/memory/` (user-global) or
`~/.claude/projects/<project-slug>/memory/` (project-scoped). <!-- migration-ref -->
Use the same root you detected in Step 1 of the original install.

```bash
# POSIX — adjust SRC_MEMORY to your detected memory root
SRC_MEMORY="$HOME/.claude/memory"          # user-global <!-- migration-ref -->
# SRC_MEMORY="$HOME/.claude/projects/<slug>/memory"  # project-scoped <!-- migration-ref -->
cp -r "$SRC_MEMORY/." "<project>/.cairn/memory/"
```

```powershell
# PowerShell
$srcMemory = "$env:USERPROFILE\.claude\memory"  # user-global <!-- migration-ref -->
# $srcMemory = "$env:USERPROFILE\.claude\projects\<slug>\memory"  # project-scoped <!-- migration-ref -->
Copy-Item -Recurse "$srcMemory\*" "<project>\.cairn\memory\" -Force
```

For **Pi adopters**: source is `~/.pi/agent/memory/`. <!-- migration-ref -->
```bash
# POSIX — Pi
cp -r "$HOME/.pi/agent/memory/." "<project>/.cairn/memory/"  # <!-- migration-ref -->
```

For **Antigravity adopters**: source is `~/.gemini/antigravity/memory/`. <!-- migration-ref -->
```bash
# POSIX — Antigravity
cp -r "$HOME/.gemini/antigravity/memory/." "<project>/.cairn/memory/"  # <!-- migration-ref -->
```

For **Cowork adopters**: memory deletion is not supported via standard tools; use index
tombstoning after copying (see Phase D for tombstoning instructions).

**A5. Fetch the new `.cairn/CLAUDE.md` from source.**

The old install placed a CLAUDE.md at `<project>/CLAUDE.md` (the project context
template). The new `.cairn/CLAUDE.md` is a different file — the cairn-authored context
sections the user imports with one line. Fetch it fresh:

```bash
# POSIX
curl -sfL https://raw.githubusercontent.com/winnorton/cairn/main/files/.cairn/CLAUDE.md \
  > "<project>/.cairn/CLAUDE.md"
```

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/winnorton/cairn/main/files/.cairn/CLAUDE.md" `
  -OutFile "<project>\.cairn\CLAUDE.md"
```

Validate: the written file must start with `#` or `---`. If it starts with `404`, the
fetch failed — delete and stop.

### Phase B — Verify copies

The agent runs these checks and reports results. Do not proceed to Phase C until all
pass.

**B1. Structural check — required files present.**

```bash
# POSIX
for f in ".cairn/CLAUDE.md" ".cairn/LAWS.md" ".cairn/cairn-version" ".cairn/memory/MEMORY.md"; do
  [ -f "<project>/$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

```powershell
# PowerShell
foreach ($f in @(".cairn\CLAUDE.md", ".cairn\LAWS.md", ".cairn\cairn-version", ".cairn\memory\MEMORY.md")) {
  if (Test-Path "<project>\$f") { "OK: $f" } else { "MISSING: $f" }
}
```

EXPECTED: all lines say "OK". Any "MISSING" line = Phase A step failed; re-run that step.

**B2. Content check — no file is empty or an HTTP error body.**

```powershell
# PowerShell
$files = Get-ChildItem -Recurse "<project>\.cairn" -File
foreach ($f in $files) {
  $first = Get-Content $f.FullName -TotalCount 1
  if ($first -match "^404|^Not Found|^<!") {
    "CORRUPT: $($f.FullName) — first line: $first"
  } elseif ($first -eq "") {
    "EMPTY: $($f.FullName)"
  } else {
    "OK: $($f.FullName)"
  }
}
```

EXPECTED: all lines say "OK". Any "CORRUPT" or "EMPTY" = re-fetch or re-copy.

**B3. MEMORY.md index integrity check.**

```powershell
# PowerShell — verify every path cited in MEMORY.md resolves
$memIndex = Get-Content "<project>\.cairn\memory\MEMORY.md" -Raw
$refs = [regex]::Matches($memIndex, '\(([^)]+\.md)\)') | ForEach-Object { $_.Groups[1].Value }
foreach ($ref in $refs) {
  $full = Join-Path "<project>\.cairn\memory" $ref
  if (Test-Path $full) { "OK: $ref" } else { "BROKEN-REF: $ref" }
}
```

EXPECTED: all lines say "OK". Any "BROKEN-REF" = a typed entry was not copied; re-run Phase A4.

**B4. Import-line check (mandatory — not a warning).**

The migration is complete only if the import line is present. Without it the habitat is
silently non-functional after migration.

```bash
# POSIX — Claude Code: check CLAUDE.md at project root
grep -n "@./.cairn/CLAUDE.md" "<project>/CLAUDE.md" && echo "IMPORT LINE FOUND" || echo "IMPORT LINE MISSING"
```

```powershell
# PowerShell
Select-String -Path "<project>\CLAUDE.md" -Pattern "@./\.cairn/CLAUDE\.md" | ForEach-Object { "IMPORT LINE FOUND" }
if (-not (Select-String -Path "<project>\CLAUDE.md" -Pattern "@./\.cairn/CLAUDE\.md" -Quiet)) { "IMPORT LINE MISSING" }
```

For **Pi/Antigravity adopters**: check `AGENTS.md` for the equivalent import line pointing
at `.cairn/CLAUDE.md`.

If "IMPORT LINE MISSING": show the user this line and ask them to add it now. Do NOT
skip or defer — the migration FAILS without the import line:

> Add this line to your `<project>/CLAUDE.md` (Claude Code) or `AGENTS.md` (Pi/agy):
>
> `@./.cairn/CLAUDE.md`
>
> This is the one user-written line cairn requires. Once added, re-run the import-line
> check above before continuing to Phase C.

### Phase C — Clean up stale vendor-folder residue

**Run only after Phase B passes in full.** Residue cleanup is gated on the replacement
being live. Before removing any residue, confirm the appropriate package is installed
and loadable:

- **Claude residue** (under `~/.claude/skills/`): <!-- migration-ref --> confirm the
  `cairn` Claude Code plugin shows in `/plugins` or equivalent.
- **Pi residue** (under `~/.pi/agent/skills/`): <!-- migration-ref --> confirm
  `@winnorton/cairn-pi` is installed (`pi list` shows it).
- **Antigravity/agy residue** (under `~/.gemini/config/skills/`): <!-- migration-ref -->
  confirm `agy plugin list` shows the `cairn` plugin imported via `agy plugin import claude`.

If a harness's replacement is not yet confirmed loadable, skip that harness's residue
section and annotate the skip in the migration report.

**C1. Pi residue — adopt-era curl-installed skill copies.**

Check and remove any adopt-era copies of skills now delivered by `@winnorton/cairn-pi`.
These are skills installed under `~/.pi/agent/skills/` by curl (the old adopt flow). <!-- migration-ref -->
The package-installed copies shadow correctly; the curl copies may be stale or corrupt.

```bash
# POSIX — check first, then remove
ls "$HOME/.pi/agent/skills/"  # <!-- migration-ref -->
```

```powershell
# PowerShell — check first
Get-ChildItem "$env:USERPROFILE\.pi\agent\skills\" | Select-Object Name  # <!-- migration-ref -->
```

For each skill directory that duplicates a skill now in `@winnorton/cairn-pi` (the six
package-bundled skills: `spec`, `program`, `round-review`, `fast-execute`, `peer-review`,
`note`), confirm the package copy is present and loadable, then remove the curl copy:

```bash
# POSIX — for each of the six packaged skills
for skill in spec program round-review fast-execute peer-review note; do
  skill_path="$HOME/.pi/agent/skills/$skill"  # <!-- migration-ref -->
  if [ -d "$skill_path" ]; then
    echo "Removing adopt-era copy: $skill_path"
    rm -rf "$skill_path"
  fi
done
```

```powershell
# PowerShell
foreach ($skill in @("spec", "program", "round-review", "fast-execute", "peer-review", "note")) {
  $p = "$env:USERPROFILE\.pi\agent\skills\$skill"  # <!-- migration-ref -->
  if (Test-Path $p) { Remove-Item -Recurse -Force $p; "Removed: $p" } else { "Not found (OK): $p" }
}
```

NOTE: at time of writing (2026-06-13) the Pi skills directory does NOT contain `program/`
or `round-review/` (they were never successfully curl-installed due to 404 bodies). Pre-flight
PF-6 gives the current baseline. Adjust the above list to match what PF-6 found.

**C2. Antigravity/agy residue — flat-format files and legacy `review/`.**

agy skill residue at `~/.gemini/config/skills/`: <!-- migration-ref -->

- **Flat-format `.md` files** (e.g. `advocate.md`, `bridge.md`, `plan.md`, `reflect.md`,
  `reframe.md`, `resume.md`) — these are the pre-v0.12.1 format. They shadow the subdir
  form and may be stale relative to current source.
- **Legacy `review/` subdir** — cairn's old `/review` skill, renamed to `/peer-review` in
  v0.13.1. The subdir form collides with the name; the flat form predates the collision fix.
- **Skills not yet in the cairn plugin** — do NOT remove skills that have no replacement
  in the package yet. Confirm by checking `agy plugin list` output before deleting.

```bash
# POSIX — check first
ls "$HOME/.gemini/config/skills/"  # <!-- migration-ref -->
```

```powershell
# PowerShell
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills\" | Select-Object Name  # <!-- migration-ref -->
```

Remove flat-format `.md` files (replace with package-delivered subdir form):
```bash
# POSIX
for skill in advocate bridge plan reflect reframe resume; do
  flat="$HOME/.gemini/config/skills/$skill.md"  # <!-- migration-ref -->
  [ -f "$flat" ] && rm "$flat" && echo "Removed flat: $flat"
done
```

```powershell
# PowerShell
foreach ($skill in @("advocate", "bridge", "plan", "reflect", "reframe", "resume")) {
  $p = "$env:USERPROFILE\.gemini\config\skills\$skill.md"  # <!-- migration-ref -->
  if (Test-Path $p) { Remove-Item $p; "Removed flat: $p" } else { "Not found (OK): $p" }
}
```

Remove legacy `review/` subdir:
```bash
# POSIX
rm -rf "$HOME/.gemini/config/skills/review"  # <!-- migration-ref -->
```

```powershell
# PowerShell
$reviewPath = "$env:USERPROFILE\.gemini\config\skills\review"  # <!-- migration-ref -->
if (Test-Path $reviewPath) { Remove-Item -Recurse -Force $reviewPath; "Removed legacy review/" } else { "Not found (OK)" }
```

Remove skills now delivered by the cairn plugin (program, etc.) — check PF-6 for which
were actually installed before removing:
```bash
# POSIX — only remove if the plugin replacement is confirmed loadable
for skill in program; do
  p="$HOME/.gemini/config/skills/$skill"  # <!-- migration-ref -->
  [ -d "$p" ] && rm -rf "$p" && echo "Removed: $p"
done
```

**C3. Claude Code residue — legacy `review/` skill.**

If upgrading from v0.12.1–v0.13.0 (which installed `/review` before the rename):
```bash
# POSIX
[ -d "$HOME/.claude/skills/review" ] && rm -rf "$HOME/.claude/skills/review"  # <!-- migration-ref -->
```

```powershell
# PowerShell
$r = "$env:USERPROFILE\.claude\skills\review"  # <!-- migration-ref -->
if (Test-Path $r) { Remove-Item -Recurse -Force $r; "Removed legacy review/" } else { "Not found (OK)" }
```

Skills delivered by the `cairn` plugin are NOT under `~/.claude/skills/` <!-- migration-ref -->
in v0.14.0 — they reach Claude via the plugin mechanism. Remove any adopt-era curl-installed
copies that duplicate what the plugin now provides.

**C4. Cowork adopters — index tombstoning (no file deletion).**

Cowork's memory store does not support file deletion via standard tools. For each memory
file that should be retired (e.g. flat-format entries from a pre-typed-memory install):

1. Open `~/.claude/memory/MEMORY.md` (file-tool read).
2. Remove the entry line for the orphaned file from the index.
3. Do NOT delete the file itself.
4. Note in the migration report: "`<filename>` orphaned-but-present (deletion not supported in Cowork)."

Agents load the index, not the directory listing — orphaned-and-unindexed is functionally
equivalent to deleted.

### Phase D — Retire old state (explicitly user-confirmed, separate step)

This phase is OPTIONAL. Originals are safe to retain indefinitely. Run only after:
- Phase B passed in full.
- Phase C residue cleanup is complete.
- You have verified the new `.cairn/` habitat is functional (run a `/tour` or equivalent check).

Show the user the proposed deletions and require explicit `y` before each action:

**D1. Retire old LAWS.md.**

```
Remove <project>/.claude/LAWS.md? (y/n)
```
On y:
```bash
# POSIX
rm "<project>/.claude/LAWS.md"  # <!-- migration-ref -->
```
```powershell
# PowerShell
Remove-Item "<project>\.claude\LAWS.md"  # <!-- migration-ref -->
```

**D2. Retire old cairn-version marker.**

```
Remove <project>/.claude/cairn-version? (y/n)
```
On y:
```bash
# POSIX
rm "<project>/.claude/cairn-version"  # <!-- migration-ref -->
```
```powershell
# PowerShell
Remove-Item "<project>\.claude\cairn-version"  # <!-- migration-ref -->
```

WHY RETIRE THIS: the Step 2 fast-path now reads `<project>/.cairn/cairn-version`. If the
old marker at `<project>/.claude/cairn-version` <!-- migration-ref --> is left in place,
WS08's adopt.md fast-path (which reads the NEW path) will correctly find the new marker
and work as expected — the old marker is simply dead weight. But: if any non-updated
adopt.md version still reads the old path, a stale marker would trigger a false "already
installed" fast-path for an incomplete install. Retiring it closes that risk.

**D3. Retire old memory location (per harness).**

For Claude Code (user-global memory): <!-- migration-ref -->
```
Remove ~/.claude/memory/ cairn entries? (y/n)
```
Show the exact list of files that will be deleted before asking. On y, remove only the
files that were copied to `.cairn/memory/` in Phase A — do not remove the directory if
other non-cairn files exist there.

For Pi: <!-- migration-ref -->
```
Remove ~/.pi/agent/memory/ cairn entries? (y/n)
```

For Antigravity: <!-- migration-ref -->
```
Remove ~/.gemini/antigravity/memory/ cairn entries? (y/n)
```

For Cowork: do not attempt deletion — use index tombstoning (Phase C4). <!-- migration-ref -->

### Migration report template

After completing all phases, the agent produces:

```
cairn v0.13.x → v0.14.0 migration complete.

Phase A (copy):
  Copied: <list of files copied to .cairn/>
  Skipped (not found): <list>

Phase B (verify):
  All checks passed / FAILED: <details>

Phase C (residue cleanup):
  Removed Pi residue: <list or "none found">
  Removed agy flat-format: <list or "none found">
  Removed agy legacy review/: yes / not found
  Removed Claude Code legacy review/: yes / not found
  Replacement confirmed: <plugin/package name>

Phase D (retire originals):
  Retired: <list or "user declined / not run">

Import line: PRESENT / MISSING (add @./.cairn/CLAUDE.md to CLAUDE.md or AGENTS.md)

Next: say `tour` to walk through the migrated habitat.
```

---

## Phase 3 — Verify the sentinel discipline (DoD#1 gate)

Goal: run the program-level DoD#1 grep against adopt.md with the new migration section. Every vendor-path string must either carry `<!-- migration-ref -->` or be absent. No exceptions.

**STEP 3.1 — Run DoD#1 grep.**

Current state: adopt.md now contains the migration section from Phase 2 with `<!-- migration-ref -->` sentinels.

```powershell
# PowerShell
$hits = Select-String -Path "adopt.md" -Pattern "~/.claude|~/.gemini|~/.pi/agent|projectClaude\}/LAWS|userMemory" |
  Where-Object { $_ -notmatch "migration-ref" }
if ($hits) {
  Write-Host "FAIL — unguarded vendor paths found:"
  $hits | ForEach-Object { Write-Host $_ }
} else {
  Write-Host "PASS — all vendor paths carry migration-ref sentinel or are absent"
}
```

```bash
# POSIX equivalent
rg -n "~/.claude|~/.gemini|~/.pi/agent|projectClaude}/LAWS|userMemory" adopt.md | \
  grep -v "migration-ref" && echo "FAIL" || echo "PASS"
```

EXPECTED: "PASS" — zero unguarded lines.

If "FAIL": for each unguarded line, either add `<!-- migration-ref -->` to the end of the line if it is genuine migration instruction text the user reads, OR remove the vendor path if it is a cairn write action. No vendor path survives without the sentinel.

**STEP 3.2 — Verify adopt.md has NO agent write actions to vendor paths.**

A migration instruction line says "copy FROM `~/.claude/...`". It must not say "write TO `~/.claude/...`". Inspect every sentinel-bearing line:

```powershell
# PowerShell
Select-String -Path "adopt.md" -Pattern "migration-ref" | ForEach-Object { $_.Line }
```

Manually verify each result line is a SOURCE path (the user reads FROM it or the agent reads a path in prose) — never a DEST path in an agent write call. If any line is an agent write action to a vendor path, that step has the wrong shape: rewrite it so the agent reads FROM the vendor path and writes only to `.cairn/`.

**CHECKPOINT 3** — all checks must pass before Phase 4.

```powershell
# PowerShell — count sentinel lines (informational)
(Select-String -Path "adopt.md" -Pattern "migration-ref").Count
```

At time of writing, expect approximately 28–35 sentinel-bearing lines (each harness has multiple copy-source references). Record the count; any future edit that drops lines should be checked.

---

## Phase 4 — Smoke test against the committed fixture

Goal: walk through Phase A–B of the migration section using the `test/fixtures/v0.13.x/` fixture as if it were a real install, and verify the result matches expectations. This test runs in a temporary directory so no real user state is modified.

**STEP 4.1 — Set up a temp working directory.**

```powershell
# PowerShell
$tmp = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory $_.FullName }
Write-Host "Smoke test dir: $tmp"
# Copy fixture into temp as if it were a real install
New-Item -ItemType Directory -Force "$tmp\.cairn"
New-Item -ItemType Directory -Force "$tmp\.claude"
Copy-Item -Recurse "test\fixtures\v0.13.x\.claude\*" "$tmp\.claude\"
$homeSimulated = New-Item -ItemType Directory -Force "$tmp\simulated-home-claude"
Copy-Item -Recurse "test\fixtures\v0.13.x\home-claude\*" "$homeSimulated\"
```

**STEP 4.2 — Run Phase A copy steps against fixture.**

```powershell
# PowerShell — simulate Phase A using fixture paths
New-Item -ItemType Directory -Force "$tmp\.cairn\memory\feedback"
New-Item -ItemType Directory -Force "$tmp\.cairn\memory\project"
New-Item -ItemType Directory -Force "$tmp\.cairn\memory\reference"
New-Item -ItemType Directory -Force "$tmp\.cairn\memory\user"
New-Item -ItemType Directory -Force "$tmp\.cairn\context"

# A2: copy LAWS.md
Copy-Item "$tmp\.claude\LAWS.md" "$tmp\.cairn\LAWS.md"

# A3: copy cairn-version
Copy-Item "$tmp\.claude\cairn-version" "$tmp\.cairn\cairn-version"

# A4: copy memory (simulated home-claude is the source)
Copy-Item -Recurse "$homeSimulated\memory\*" "$tmp\.cairn\memory\" -Force

# A5: use the real CLAUDE.md from source tree instead of fetching
Copy-Item "files\.cairn\CLAUDE.md" "$tmp\.cairn\CLAUDE.md"
```

**STEP 4.3 — Run Phase B verification against fixture result.**

```powershell
# PowerShell
$pass = $true
foreach ($f in @(".cairn\CLAUDE.md", ".cairn\LAWS.md", ".cairn\cairn-version", ".cairn\memory\MEMORY.md")) {
  if (Test-Path "$tmp\$f") { Write-Host "OK: $f" } else { Write-Host "MISSING: $f"; $pass = $false }
}
# content check
Get-ChildItem -Recurse "$tmp\.cairn" -File | ForEach-Object {
  $first = Get-Content $_.FullName -TotalCount 1
  if ($first -match "^404|^Not Found|^<!") { Write-Host "CORRUPT: $($_.FullName)"; $pass = $false }
}
# MEMORY.md index integrity
$memIndex = Get-Content "$tmp\.cairn\memory\MEMORY.md" -Raw
$refs = [regex]::Matches($memIndex, '\(([^)]+\.md)\)') | ForEach-Object { $_.Groups[1].Value }
foreach ($ref in $refs) {
  $full = Join-Path "$tmp\.cairn\memory" $ref
  if (Test-Path $full) { Write-Host "OK: $ref" } else { Write-Host "BROKEN-REF: $ref"; $pass = $false }
}
if ($pass) { Write-Host "SMOKE TEST PASSED" } else { Write-Host "SMOKE TEST FAILED — see above" }
```

EXPECTED: all lines say "OK" and final line says "SMOKE TEST PASSED".

**STEP 4.4 — Verify cairn-version fast-path coordination.**

The old `<project>/.claude/cairn-version` <!-- migration-ref --> was copied to
`<project>/.cairn/cairn-version`. The old marker must still exist until Phase D deletes it.
WS08's adopt.md now reads `{projectRoot}/.cairn/cairn-version` — the NEW path.

```powershell
# PowerShell
$oldVer = Get-Content "$tmp\.claude\cairn-version" -ErrorAction SilentlyContinue
$newVer = Get-Content "$tmp\.cairn\cairn-version" -ErrorAction SilentlyContinue
Write-Host "Old marker ($tmp\.claude\cairn-version): $oldVer"
Write-Host "New marker ($tmp\.cairn\cairn-version): $newVer"
if ($oldVer -eq $newVer) { Write-Host "VERSION MATCH OK" } else { Write-Host "VERSION MISMATCH — check copy step" }
```

EXPECTED: both markers exist with identical content ("0.13.1" in the fixture).

**STEP 4.5 — Clean up temp directory.**

```powershell
# PowerShell
Remove-Item -Recurse -Force $tmp
Write-Host "Smoke test temp dir removed."
```

**CHECKPOINT 4** — smoke test must pass before Phase 5.

If the smoke test failed:
- "MISSING" file: the copy step in Phase A for that file is wrong — re-check STEP 4.2.
- "BROKEN-REF": the MEMORY.md fixture has a reference to a file that wasn't copied — either fix the fixture (Phase 1) or fix the copy step (STEP 4.2, A4).
- "CORRUPT": the source was an HTTP error body — fix the fetch step (A5) to use a valid source.

---

## Phase 5 — Install-integrity check script

Goal: write `scripts/cairn-integrity.sh` (POSIX) and `scripts/cairn-integrity.ps1` (PowerShell) — lightweight scripts the agent runs after a fresh adopt or migration to confirm the `.cairn/` habitat is structurally sound.

**STEP 5.1 — Create the scripts directory.**

```powershell
# PowerShell
New-Item -ItemType Directory -Force "scripts"
```

**STEP 5.2 — Write `scripts/cairn-integrity.sh`.**

Current state: file does not exist.

File: `C:\Users\winno\projects\cairn\cairn\scripts\cairn-integrity.sh`

```bash
#!/usr/bin/env bash
# cairn-integrity.sh — install-integrity check for a .cairn/ habitat
# Usage: bash scripts/cairn-integrity.sh [project-root]
# Exits 0 if healthy, 1 if any check fails.
set -euo pipefail

PROJECT_ROOT="${1:-.}"
CAIRN_DIR="$PROJECT_ROOT/.cairn"
CONTEXT_FILE="$PROJECT_ROOT/CLAUDE.md"
PASS=true

check() {
  local desc="$1" result="$2"
  if [ "$result" = "ok" ]; then
    echo "OK:   $desc"
  else
    echo "FAIL: $desc — $result"
    PASS=false
  fi
}

# 1. .cairn/ exists
[ -d "$CAIRN_DIR" ] && check ".cairn/ directory exists" "ok" || check ".cairn/ directory exists" "not found"

# 2. Required files present
for f in "CLAUDE.md" "LAWS.md" "cairn-version" "memory/MEMORY.md"; do
  [ -f "$CAIRN_DIR/$f" ] && check ".cairn/$f present" "ok" || check ".cairn/$f present" "missing"
done

# 3. No file is empty or HTTP error body
find "$CAIRN_DIR" -name "*.md" | while read -r f; do
  first=$(head -1 "$f" 2>/dev/null || echo "")
  if echo "$first" | grep -qE "^404|^Not Found|^<!"; then
    check "$f content" "corrupt (first line: $first)"
  elif [ -z "$first" ]; then
    check "$f content" "empty"
  fi
done

# 4. Import line present in context file
if [ -f "$CONTEXT_FILE" ]; then
  grep -q "@./.cairn/CLAUDE.md" "$CONTEXT_FILE" \
    && check "import line in CLAUDE.md" "ok" \
    || check "import line in CLAUDE.md" "MISSING — add: @./.cairn/CLAUDE.md"
else
  # Check AGENTS.md as fallback for Pi/agy habitats
  AGENTS_FILE="$PROJECT_ROOT/AGENTS.md"
  if [ -f "$AGENTS_FILE" ]; then
    grep -q ".cairn/CLAUDE.md" "$AGENTS_FILE" \
      && check "import line in AGENTS.md" "ok" \
      || check "import line in AGENTS.md" "MISSING — add line referencing .cairn/CLAUDE.md"
  else
    check "context file (CLAUDE.md or AGENTS.md)" "neither found — import line cannot be verified"
    PASS=false
  fi
fi

# 5. cairn-version marker (confirms migration or fresh install ran to completion)
if [ -f "$CAIRN_DIR/cairn-version" ]; then
  ver=$(cat "$CAIRN_DIR/cairn-version")
  check "cairn-version marker ($ver)" "ok"
else
  check "cairn-version marker" "missing — run adopt or migration Phase A3"
  PASS=false
fi

if [ "$PASS" = "true" ]; then
  echo ""
  echo "cairn habitat: HEALTHY"
  exit 0
else
  echo ""
  echo "cairn habitat: NEEDS ATTENTION (see FAIL lines above)"
  exit 1
fi
```

WHY: a POSIX script runs in Claude Code (bash available), Pi, agy, and CI without a PowerShell dependency.

**STEP 5.3 — Write `scripts/cairn-integrity.ps1`.**

Current state: file does not exist.

File: `C:\Users\winno\projects\cairn\cairn\scripts\cairn-integrity.ps1`

```powershell
# cairn-integrity.ps1 — install-integrity check for a .cairn/ habitat
# Usage: pwsh scripts/cairn-integrity.ps1 [-ProjectRoot <path>]
# Exits 0 if healthy, 1 if any check fails.
param(
  [string]$ProjectRoot = "."
)

$cairnDir = Join-Path $ProjectRoot ".cairn"
$contextFile = Join-Path $ProjectRoot "CLAUDE.md"
$agentsFile = Join-Path $ProjectRoot "AGENTS.md"
$pass = $true

function Check($desc, $ok, $detail = "") {
  if ($ok) { Write-Host "OK:   $desc" }
  else { Write-Host "FAIL: $desc$(if ($detail) { ' — ' + $detail })"; $script:pass = $false }
}

# 1. .cairn/ exists
Check ".cairn/ directory exists" (Test-Path $cairnDir) "not found"

# 2. Required files present
foreach ($f in @("CLAUDE.md", "LAWS.md", "cairn-version", "memory\MEMORY.md")) {
  Check ".cairn\$f present" (Test-Path (Join-Path $cairnDir $f)) "missing"
}

# 3. No file is empty or HTTP error body
Get-ChildItem -Recurse $cairnDir -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
  $first = Get-Content $_.FullName -TotalCount 1 -ErrorAction SilentlyContinue
  if ($first -match "^404|^Not Found|^<!") { Check $_.Name $false "corrupt: $first" }
  elseif (-not $first) { Check $_.Name $false "empty" }
}

# 4. Import line present
if (Test-Path $contextFile) {
  Check "import line in CLAUDE.md" (Select-String -Path $contextFile -Pattern "@./\.cairn/CLAUDE\.md" -Quiet) `
    "MISSING — add: @./.cairn/CLAUDE.md"
} elseif (Test-Path $agentsFile) {
  Check "import line in AGENTS.md" (Select-String -Path $agentsFile -Pattern "\.cairn/CLAUDE\.md" -Quiet) `
    "MISSING — add line referencing .cairn/CLAUDE.md"
} else {
  Check "context file (CLAUDE.md or AGENTS.md)" $false "neither found"
}

# 5. cairn-version marker
$verFile = Join-Path $cairnDir "cairn-version"
if (Test-Path $verFile) {
  $ver = Get-Content $verFile -TotalCount 1
  Check "cairn-version marker ($ver)" $true
} else {
  Check "cairn-version marker" $false "missing — run adopt or migration Phase A3"
}

Write-Host ""
if ($pass) { Write-Host "cairn habitat: HEALTHY"; exit 0 }
else { Write-Host "cairn habitat: NEEDS ATTENTION (see FAIL lines above)"; exit 1 }
```

**CHECKPOINT 5** — verify both scripts are syntactically valid.

```powershell
# PowerShell — parse check
pwsh -Command "Get-Content scripts\cairn-integrity.ps1 | Out-Null; 'PS1 parse OK'"
bash -n scripts/cairn-integrity.sh && echo "SH syntax OK"
```

EXPECTED: both lines printed without error.

If parse fails: read the error, fix the syntax in the relevant script, re-run.

---

## Post-flight

**Final verification — run the integrity check against the cairn repo itself (expect failure on import line; document it).**

```powershell
# PowerShell — cairn's own repo does not adopt itself, so .cairn/ won't exist
pwsh scripts/cairn-integrity.ps1 -ProjectRoot "."
```

EXPECTED: the script exits 1 with FAIL on `.cairn/ directory exists` — cairn's own repo has no `.cairn/` (cairn doesn't adopt itself, per adopt.md pre-flight). This is correct behavior. Document in the commit message.

**Run DoD#1 grep one final time.**

```powershell
# PowerShell
Select-String -Path "adopt.md" -Pattern "~/.claude|~/.gemini|~/.pi/agent|projectClaude}/LAWS|userMemory" |
  Where-Object { $_ -notmatch "migration-ref" }
```

EXPECTED: zero lines.

**Commit-message template.**

```
feat(ws09): migration integrity — .cairn/ migration section + integrity check + fixture

- adopt.md: v0.13.x → v0.14.0 migration section with copy-then-verify flow,
  per-harness residue cleanup (Pi, agy, Claude Code, Cowork), import-line gate,
  cairn-version marker retirement (Phase D). All vendor-path strings carry
  <!-- migration-ref --> sentinel; DoD#1 grep passes.

- test/fixtures/v0.13.x/: committed representative v0.13.1 install snapshot
  (LAWS.md, cairn-version, MEMORY.md + 3 typed entries, 2 skill stubs).

- scripts/cairn-integrity.{sh,ps1}: install-integrity check — .cairn/ structure,
  required files, content validity, import-line presence, cairn-version marker.
  Implements the diagnostic surface WS01 defines.

Smoke test (Phase 4) passed against committed fixture.
DoD#1 grep: 0 unguarded vendor paths.
cairn's own repo self-test exits 1 on .cairn/ absent — correct (cairn doesn't adopt itself).

[LAW own-your-namespace] — every migration instruction names a vendor path as a
read/copy SOURCE, never as a cairn write target.
```

**Move spec to archive when complete.**

```powershell
# PowerShell — do NOT run until the program master §9.4 row is marked COMPLETE
Move-Item "docs\specs\SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md" `
  "docs\specs\archive\SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md"
```

---

## Executor Handoff

**Read these first (in order):**
1. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §4 (hard contract) and §5 DoD#1 and DoD#5 — the invariants this workstream exists to satisfy.
2. `adopt.md` in full — understand the current v0.13.x flow before adding the migration section; it tells you what paths the user has and where the old markers live.
3. `test/fixtures/v0.13.x/README.md` (after Phase 1) — confirms the fixture shape before running the smoke test.

**The one constraint most likely to cause a mistake:** every vendor-path string you write into adopt.md (any path starting with `~/.claude`, `~/.pi/agent`, `~/.gemini`, or `<project>/.claude`) MUST end its line with `<!-- migration-ref -->`. If you add a prose line explaining where an old file lives and forget the sentinel, DoD#1's grep will catch it — but only if you run the grep. Run Phase 3 STEP 3.1 before declaring Phase 3 done.

**Import-line failure is a HARD FAIL, not a warning.** Phase B4 terminates the migration if the import line is absent. The text says "fails (not warns)" because a migrated habitat without the import line is silently non-functional — the agent loads `.cairn/` files but the context never reaches it. Do not soften this to a warning in any edit.

**Common failure recoveries:**

| Failure | Recovery |
|---|---|
| PF-1 fails (no `files/.cairn/CLAUDE.md`) | WS01 must complete first; check program §9.4 status table |
| Phase B3 BROKEN-REF | A typed memory entry was not copied; re-run A4 with the correct SRC_MEMORY path |
| Phase 3 FAIL (unguarded vendor path) | Add `<!-- migration-ref -->` to the flagged line, or remove the vendor path if it's a write action |
| Smoke test MISSING `.cairn/CLAUDE.md` | A5 fetched an empty or error body; use the local `files/.cairn/CLAUDE.md` source instead |
| Smoke test BROKEN-REF in MEMORY.md | Fixture MEMORY.md references a file not copied by A4; check that Phase 1 Step 1.5 entries match Phase 4 Step 4.2 A4 copy |
| Script parse error | Read the error line number; fix the specific syntax; re-run the parse check |

---

## Review Checklist

Before marking this workstream COMPLETE, a fresh reviewer (not the executor) verifies:

- [ ] `test/fixtures/v0.13.x/` is committed and non-empty (at least LAWS.md, cairn-version, MEMORY.md + ≥1 typed entry, ≥1 skill stub per stub Gate).
- [ ] adopt.md migration section covers all three harnesses (Claude Code, Pi, Antigravity) PLUS Cowork tombstoning.
- [ ] Every vendor-path string in adopt.md carries `<!-- migration-ref -->` — DoD#1 grep returns zero.
- [ ] No step in adopt.md's migration section is an agent WRITE to a vendor path — all vendor paths are copy SOURCES or user-read prose.
- [ ] Import-line check (Phase B4) is a HARD FAIL, not a warning.
- [ ] cairn-version retirement (Phase D2) is documented and explains the fast-path coordination with WS08.
- [ ] Residue cleanup (Phase C) is gated on replacement-installed per-harness.
- [ ] Cowork tombstoning is documented in Phase C4 and Phase D3.
- [ ] Both integrity scripts (`cairn-integrity.sh`, `cairn-integrity.ps1`) exist and pass parse check.
- [ ] Smoke test (Phase 4) ran and passed against the committed fixture.
- [ ] DoD#1 grep passes (zero unguarded vendor paths).
- [ ] `<!-- migration-ref -->` sentinel count is documented (Phase 3 CHECKPOINT 3).
