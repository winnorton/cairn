# SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 03 · **Parallel-safe-with:** 05, 06, 07

## Goal
Serve Antigravity (agy) cairn skills by `agy plugin import claude` of the WS03 plugin — build once, serve two harnesses — with state via `AGENTS.md` → `.cairn/`.

## Scope
- Empirically validate `agy plugin import claude` ingests the `cairn` Claude plugin (agy 1.0.7+); record evidence.
- Confirm GitHub-subpath install as the alternative (`agy plugin install` from repo subpath, branch-resolved).
- Reserve `cairn-agy` as a native-plugin fallback only if import-claude proves lossy.
- agy reads `.cairn/` state via the `AGENTS.md` import line (WS02).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`agy plugin list` shows the imported cairn plugin; `/skill:` namespace lists cairn skills.

## Rollback story
`agy plugin uninstall`; clean per the 2026-06-13 probe (verified clean round-trip).

## Gate
agy ingests the cairn plugin via `import claude`; cairn skills are listed/invocable in an agy session; the path is documented in `adopt.md`.

## Files
`adopt.md` (agy branch), validation note under `docs/notes/`.

---

## Pre-flight

**Shell dialect: PowerShell** (all commands below use PowerShell syntax unless explicitly labeled POSIX).

Run these checks before Phase 1. If any expectation fails, STOP and surface the finding — do not proceed.

```powershell
# PF-1: WS03 plugin artifact exists
Test-Path "C:\Users\winno\projects\cairn\cairn\packages\cairn-claude"
# Expected: True  (WS03 must be complete before WS04 runs)
# If False: STOP — WS03 is not done. WS04 depends on 03.

# PF-2: agy is on PATH and version is 1.0.7 or later
agy --version
# Expected: output contains "1.0.7" or higher (e.g. "agy 1.0.7")
# If command not found or version < 1.0.7: STOP — agy binary prerequisite not met.

# PF-3: agy plugin subcommand responds
agy plugin --help 2>&1 | Select-String "import"
# Expected: line containing "import"
# If missing: STOP — agy plugin import subcommand not available in this build.

# PF-4: Assessment note is present (the source of verified facts used by this spec)
Test-Path "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md"
# Expected: True

# PF-5: adopt.md is tracked by git (we will edit it; confirm clean baseline)
git -C "C:\Users\winno\projects\cairn\cairn" diff --name-only adopt.md
# Expected: empty output (no unstaged changes)
# If non-empty: note the diff; confirm with user before proceeding.
```

---

## Phase 1 — Verify the `import claude` channel (empirical, interactive)

**Purpose:** confirm `agy plugin import claude` ingests the WS03 `cairn` plugin and that cairn skills are listed and smoke-invocable. If this phase fails, the fallback path (native `cairn-agy` plugin via GitHub subpath) takes effect; do not assume success.

**IMPORTANT:** agy requires an interactive terminal for behavioral tests. Do NOT run `agy --print -p "..."` in a piped/non-TTY shell — this was verified non-viable on Windows (see assessment note §Method). Steps P1.3 and P1.5 require the user to run commands interactively and paste the result.

### Step P1.1 — Locate the WS03 plugin root

**Current state:** `packages/cairn-claude/` does not yet exist (WS03 will create it). Once WS03 completes, the plugin root will be at `packages/cairn-claude/` in the repo, containing a `plugin.json` (or equivalent Claude plugin manifest) and a `skills/` subtree.

**Action:** confirm the plugin root location with WS03's executor. The path this spec uses is `packages/cairn-claude/` (the name frozen by §2.3). If WS03 used a different directory name, update PF-1 and P1.1 accordingly before continuing.

**WHY:** agy `plugin import claude` requires a local path to an installed Claude Code plugin OR a path agy can discover via Claude's plugin config. Knowing the exact WS03 output path is the prerequisite for P1.2.

### Step P1.2 — Run `agy plugin import claude` (interactive)

**Action (user runs interactively):**

```
agy plugin import claude
```

**Expected behavior:**
- agy imports the `cairn` plugin from the Claude Code plugin install location.
- Output line resembling: `Imported plugin: cairn` or staging confirmation showing `~/.gemini/config/plugins/cairn/`.
- No error; exit code 0.

**Record:**
- Exact command output (paste into the validation note at `docs/notes/NOTE_AGY_04_IMPORT_VALIDATION_2026-XX-XX.md` — use today's date).
- The staged path (should be `~/.gemini/config/plugins/cairn/` per the assessment note's verified fact; confirm).
- The `~/.gemini/config/import_manifest.json` entry for cairn (components field).

**WHY:** the assessment note confirms `agy plugin import claude` exists as a subcommand in agy 1.0.7, but a behavioral test against the actual WS03 `cairn` plugin output is required before WS08 (adopt.md agy branch) can reference this path with confidence. The assessment note's probe used a minimal `plugin.json`; the real cairn plugin may have more structure.

**If import fails or produces an error:** go to Step P1.7 (fallback evaluation). Do NOT proceed to P1.3.

### Step P1.3 — Verify skills are listed (interactive)

**Action (user runs interactively in agy session):**

```
agy plugin list
```

**Expected:** output includes `cairn` in the plugin list with a skills count > 0.

Then in an agy interactive session:

```
/skill:
```
or the equivalent skill-listing invocation.

**Expected:** cairn skills appear (e.g. `spec`, `program`, `peer-review`, `note`, etc.).

**Record:** skill count and names in the validation note.

**WHY:** `agy plugin list` and skill discovery are distinct from import success — a plugin can stage without skills being recognized. The assessment note confirms cairn's `<name>/SKILL.md` subdir format is first-class in agy's binary (`SKILL.md` appears 10× in embedded strings), so skills SHOULD be recognized; this step verifies it for the real plugin.

### Step P1.4 — Smoke-invoke one skill (interactive)

**Action (user runs interactively in agy session):**

Invoke `/skill:note` or `/skill:peer-review` with a trivial prompt (e.g. "test").

**Expected:** the skill body activates (agy reads the `SKILL.md` and follows its trigger logic).

**Record:** whether the skill activated in the validation note.

**WHY:** listing is not invocation. A skill listed but not invocable is a format mismatch. This is the final behavioral gate.

### Step P1.5 — Verify clean uninstall (interactive)

**Action (user runs interactively):**

```
agy plugin uninstall cairn
```

**Expected:**
- `~/.gemini/config/plugins/cairn/` directory removed.
- Entry removed from `~/.gemini/config/import_manifest.json`.
- agy session no longer shows cairn skills.

**Record:** exit code and absence of the staged dir in the validation note.

**WHY:** the rollback story depends on `agy plugin uninstall` being clean. The assessment note states this is verified (clean round-trip 2026-06-13 probe), but we confirm it against the real WS03 plugin.

### Step P1.6 — Record and decide

If ALL of P1.2–P1.5 passed:

- Write the validation note at `docs/notes/NOTE_AGY_04_IMPORT_VALIDATION_<TODAY>.md` with:
  - Exact agy version
  - Import command output
  - Staged path confirmed
  - Skills listed (names + count)
  - Smoke-invocation result
  - Uninstall result
  - Verdict: **IMPORT_CLAUDE_VALIDATED**
- Proceed to Phase 2.

If ANY of P1.2–P1.5 failed:

- Write the validation note with the failure details and the error output.
- Proceed to Step P1.7 (fallback evaluation).

### Step P1.7 — Fallback evaluation (if import-claude failed)

**Current state:** `cairn-agy` name is reserved per §2.3 for this scenario.

**Action:** evaluate the GitHub-subpath install alternative:

```
agy plugin install github:winnorton/cairn//packages/cairn-agy@main
```

This requires a separate `packages/cairn-agy/` directory (distinct from `packages/cairn-claude/`). A `plugin.json` with `{name, version, description}` is sufficient (per assessment note: minimal `plugin.json` validated `[ok]` by agy).

**Decision gate:**
- If GitHub-subpath install can serve the same skills via `packages/cairn-agy/`: document as the agy channel, update Phase 3 steps to create `packages/cairn-agy/`, proceed with the GitHub-subpath path.
- If neither channel works: STOP. Surface the failure to the maintainer. Do not proceed to Phase 2 or author adopt.md agy text — WS08 depends on WS04's empirical result.

**WHY:** the master §6 risk row for WS04 states: "WS04 validates empirically; fallback = reserved native `cairn-agy` plugin." This step is the fallback gate. The spec does not guess.

**CHECKPOINT after Phase 1:**

```powershell
# Validation note exists
Test-Path "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_04_IMPORT_VALIDATION_*.md"
# Expected: True (exactly one file matching pattern)

# Note contains the verdict string
Select-String -Path "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_04_IMPORT_VALIDATION_*.md" -Pattern "IMPORT_CLAUDE_VALIDATED|FALLBACK_GITHUB_SUBPATH"
# Expected: one matching line

# No vendor-dir write occurred (cairn process must not have written to ~/.gemini/config/)
# The import was user-run interactively — cairn's adopt.md did not write to that path
# Verify by reviewing the validation note: it records who ran what
```

If Phase 1 verdict is neither IMPORT_CLAUDE_VALIDATED nor FALLBACK_GITHUB_SUBPATH: stop and surface. Do not proceed to Phase 2.

---

## Phase 2 — Document the agy state-access path

**Purpose:** confirm how agy reads `.cairn/` state, specifically via the `AGENTS.md` import line (WS02 contract surface §2.2).

### Step P2.1 — Verify agy's AGENTS.md auto-load behavior

**Current state (from assessment note):** agy auto-discovers `<project>/.agents/skills/` for workspace skills (binary-verified path template). The assessment note does not state whether agy auto-loads `AGENTS.md` at session start the same way Pi does.

**Action:** check the assessment note and the agy binary for AGENTS.md auto-load behavior.

```powershell
# Check if assessment note mentions AGENTS.md auto-load
Select-String -Path "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md" -Pattern "AGENTS.md" -CaseSensitive
```

**Expected:** the note may not address AGENTS.md auto-load for state (vs. skills). If absent, this is an open question.

**WHY:** WS02's import-bridge contract (§2.2) says "the AGENTS.md analog" for Pi/agy — but WS04 must confirm whether agy actually auto-loads AGENTS.md at session start, or whether the import line mechanism is different.

### Step P2.2 — Resolve the AGENTS.md auto-load question

**If assessment note confirms AGENTS.md auto-load:**
Record the fact. The WS02 import line (`@./.cairn/CLAUDE.md` or `@./.cairn/AGENTS.md`) in the project's `AGENTS.md` is the correct mechanism. Proceed to P2.3.

**If assessment note is silent on AGENTS.md auto-load:**
This is a behavioral question that requires an interactive agy session or binary inspection. Run:

```
# In an interactive agy session in a project with AGENTS.md
# Check whether agy reads AGENTS.md content at session start
# (user pastes result into the validation note)
```

Do NOT guess. If agy does NOT auto-load AGENTS.md, the state access path for agy differs from Pi and must be separately documented in adopt.md's agy branch. Record the finding in the validation note.

### Step P2.3 — Record the agy state-access path decision

In the validation note, add a section "## State access path for agy":
- State whether agy auto-loads `AGENTS.md` (yes/no/unknown).
- State the import line form: `@./.cairn/CLAUDE.md` in `AGENTS.md` (if auto-loaded), or the alternative if different.
- Mark it as the WS04 handoff to WS08 (adopt.md) and WS02 (import-bridge).

**WHY:** WS08 (adopt.md agy branch) is downstream of WS04. The exact import-line form and state-access path WS08 should document comes from this workstream's empirical findings. Guessing here propagates a wrong instruction to adopters.

**CHECKPOINT after Phase 2:**

```powershell
# Validation note has the state-access path section
Select-String -Path "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_04_IMPORT_VALIDATION_*.md" -Pattern "State access path for agy"
# Expected: one matching line
```

If this check fails: the validation note is incomplete. Do not proceed to Phase 3.

---

## Phase 3 — Update adopt.md agy branch

**Purpose:** add a self-contained agy branch to adopt.md's Step 1 detection tree and the corresponding install/state Step, replacing the stale Antigravity IDE text. This is WS04's only file write (besides the validation note). WS08 will later rewrite adopt.md wholesale; WS04's job is to author the CANONICAL agy-branch Step text that WS08 incorporates. Write it now so WS08 has a concrete, empirically-validated source.

**CRITICAL:** no step in this phase writes to `~/.gemini/config/` or any vendor-owned path. adopt.md describes what the USER does; it is not an agent write target.

### Step P3.1 — Read the current adopt.md agy content

**Current state (adopt.md Note on Antigravity, lines ~94–98):**

```
Note on Antigravity (Google): cairn's memory + skill layer adopts successfully into
Antigravity at `~/.gemini/antigravity/memory/` (validated empirically; Antigravity's
agent independently remaps cairn's path variables to its conventions). Antigravity's
skill loading mechanism is internal and not externally documented; the install path
is the same as Claude Code's pattern but Antigravity-specific.
```

**REPLACEMENT:** the current text documents Antigravity IDE paths that predate the CLI (validated 2026-04-25 per the assessment note's "adopt.md gap" section). This text must be replaced with the agy CLI paths and the `import claude` channel.

**WHY:** `~/.gemini/antigravity/` and `~/.gemini/antigravity-cli/plugins/` are stale. The live paths are `~/.gemini/config/plugins/` (plugin staging) and `~/.gemini/config/skills/` (global skills). The note's text is also in the wrong section (it's a footnote in Step 1, not a dedicated agy branch).

### Step P3.2 — Author the agy-branch Step text

Using the empirical findings from Phase 1 and Phase 2, write the canonical agy branch for adopt.md. The template below is parameterized by Phase 1/2 outcomes. Fill in the bracketed fields from the validation note.

**Replacement text (insert as a new numbered item in Step 1's detection tree, replacing the old "Note on Antigravity" paragraph):**

```markdown
3. Are you running inside **Antigravity CLI (agy)**? Markers: `agy` is in PATH;
   `~/.gemini/config/` exists (the live config root for agy 1.0.7+); an agy interactive
   session is active.
   → **agy**.

   **agy path resolution:**
   - Skill plugin: `~/.gemini/config/plugins/cairn/` (staged by `agy plugin import claude`)
   - State (memory, laws): `<project>/.cairn/` (same `.cairn/` layout as all harnesses)
   - Import line: `@./.cairn/CLAUDE.md` in your project's `AGENTS.md` [or the confirmed
     form from Phase 2] — the only vendor-file edit cairn requests.

   **Note on stale Antigravity IDE paths.** Prior cairn documentation referenced
   `~/.gemini/antigravity/` (IDE memory) and `~/.gemini/antigravity-cli/plugins/` (stale
   community-doc path). Neither is current. The live config root is `~/.gemini/config/`.
   If you have cairn content at the old paths, see the Migration section.
```

**Replacement text for the Step 3 agy path variables block:**

```markdown
For **Antigravity CLI (agy)**, the variables resolve as:
- `{userMemory}` → N/A (cairn state is project-local in `.cairn/`; agy has no
  equivalent of Claude Code's `~/.claude/memory` for cairn purposes)
- `{projectRoot}` → `<cwd>` (the user's current project directory)
- Skills are served via `agy plugin import claude` of the `cairn` plugin — not
  by path variable substitution. See Step [N] for the install command.
```

**Replacement text for the Step N agy install Step (new step, number TBD by WS08):**

```markdown
**For agy:** install the `cairn` plugin by importing the Claude Code plugin:

```
agy plugin import claude
```

This stages cairn's skills into `~/.gemini/config/plugins/cairn/` and tracks the
import in `~/.gemini/config/import_manifest.json`. No agent write occurs; `agy`
runs the install.

Verify the install:
```
agy plugin list
# cairn should appear with N skills
```

Then add the import line to your project's `AGENTS.md` (the only edit cairn asks
you to make to a vendor-owned file):

```
@./.cairn/CLAUDE.md
```

[Insert the confirmed import line form from Phase 2 findings if different.]
```

**WHY:** WS08's adopt.md rewrite will incorporate this text as the authoritative agy branch. WS04 authors the text; WS08 integrates it. This separation is explicit in WS08's scope: "WS04 owns the final agy-branch Step text."

### Step P3.3 — Edit adopt.md

**File:** `C:/Users/winno/projects/cairn/cairn/adopt.md`

**Action:** make the following two edits to adopt.md using the Edit tool.

**Edit A — replace the stale "Note on Antigravity" paragraph in Step 1:**

Locate this exact text in adopt.md (currently lines ~94–98):

```
Note on Antigravity (Google): cairn's memory + skill layer adopts successfully into
Antigravity at `~/.gemini/antigravity/memory/` (validated empirically; Antigravity's
agent independently remaps cairn's path variables to its conventions). Antigravity's
skill loading mechanism is internal and not externally documented; the install path
is the same as Claude Code's pattern but Antigravity-specific.
```

Replace with the Step 1 agy detection branch text from P3.2 (the "Are you running inside Antigravity CLI (agy)?" block). Number it `3.` (shifting any existing `3.` / `4.` bullets down — check the current numbering before editing).

**Edit B — add the agy path-variables block to Step 3:**

In the Step 3 path-resolution section, after the "For **Pi** (pi.dev)" block, add the "For **Antigravity CLI (agy)**" block from P3.2.

**Hard rule check before editing:** confirm neither replacement text contains a cairn AGENT WRITE to `~/.gemini/config/` or any vendor path. The text describes USER commands and USER file edits only. Run:

```powershell
# After editing, verify no naked vendor-path write instruction slipped in
# (the agy plugin command is a USER-run command, not an agent Write call)
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "~/.gemini" |
  Where-Object { $_.Line -notmatch "migration-ref" }
# If this returns lines other than the migration section: STOP and re-check.
# The agy plugin path (~/.gemini/config/plugins/) may appear as a diagnostic location
# in Step N. If so, add <!-- migration-ref --> ONLY if it's naming an old v0.13.x path.
# For NEW paths that are the correct install location, no sentinel is needed.
```

**WHY:** the `<!-- migration-ref -->` sentinel marks OLD vendor paths in migration-instruction text (master §4). New paths that describe where agy correctly stages plugins are NOT migration refs — they are the target state. The two are different and the sentinel must not be misapplied.

**CHECKPOINT after Phase 3:**

```powershell
# adopt.md no longer contains the stale Antigravity IDE text
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "antigravity/memory"
# Expected: zero matches (the stale path is gone)

# agy detection branch is present
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "Antigravity CLI \(agy\)"
# Expected: one match

# agy plugin import claude instruction is present
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "agy plugin import claude"
# Expected: one match

# No unguarded agent-write to vendor path slipped in
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "~/.gemini" |
  Where-Object { $_.Line -notmatch "migration-ref" } |
  Measure-Object | Select-Object Count
# Expected: Count is 0 OR Count matches only agy's new diagnostic/install lines
# (which name the path as where agy stages content, not as an agent Write target)
```

If the stale text is still present: re-apply Edit A. If "agy plugin import claude" is absent: re-apply the install Step. If the sentinel check fires on a non-migration line: investigate before proceeding.

---

## Phase 4 — Write the validation note to docs/notes/

**Purpose:** commit the empirical findings from Phase 1/2 as a permanent record in `docs/notes/`, parallel to the existing assessment note.

### Step P4.1 — Create the validation note

**File:** `C:/Users/winno/projects/cairn/cairn/docs/notes/NOTE_AGY_04_IMPORT_VALIDATION_<TODAY>.md`

(Use the actual date, e.g. `NOTE_AGY_04_IMPORT_VALIDATION_2026-06-13.md`.)

**Content template:**

```markdown
# NOTE — WS04 agy import validation

> Filed: <TODAY> · Status: complete · Source: WS04 executor (SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION)
> Prereqs: agy <version>, WS03 cairn plugin at packages/cairn-claude/

## Import test

- Command: `agy plugin import claude`
- Exit code: <0|non-zero>
- Output: <paste>
- Staged path: <~/.gemini/config/plugins/cairn/ or other>
- import_manifest.json entry: <paste components field>

## Skill discovery

- `agy plugin list` output: <paste>
- Skills listed: <count> — <names>
- Smoke invocation (/skill:<name>): <activated|failed|N/A>

## State access path for agy

- agy auto-loads AGENTS.md at session start: <yes|no|unknown>
- Import line form: <@./.cairn/CLAUDE.md in AGENTS.md | other>
- Source of answer: <assessment note|binary inspection|interactive test>

## Uninstall test

- Command: `agy plugin uninstall cairn`
- Staged dir removed: <yes|no>
- import_manifest.json entry removed: <yes|no>

## Verdict

IMPORT_CLAUDE_VALIDATED  — agy ingests the cairn Claude plugin via import claude; skills listed and smoke-invocable; uninstall clean.
[OR]
FALLBACK_GITHUB_SUBPATH  — import claude failed (see error above); fallback channel is packages/cairn-agy/ via GitHub subpath.

## Handoff to WS08

[Paste the adopt.md agy branch Step text authored in P3.2 here for reference.]
```

**WHY:** the existing assessment note (`NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md`) records the generic agy probe. This new note records the specific WS04 outcome against the real WS03 cairn plugin — the two are complementary, not redundant.

**CHECKPOINT after Phase 4:**

```powershell
# Validation note exists and contains the verdict
$note = Get-ChildItem "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_04_IMPORT_VALIDATION_*.md"
$note | Measure-Object | Select-Object Count
# Expected: Count = 1

Select-String -Path $note.FullName -Pattern "IMPORT_CLAUDE_VALIDATED|FALLBACK_GITHUB_SUBPATH"
# Expected: one matching line
```

---

## Post-flight

**Final verification commands (PowerShell):**

```powershell
# 1. Gate: adopt.md agy branch present with correct install command
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "agy plugin import claude"
# Expected: at least one match

# 2. Gate: stale Antigravity IDE text removed
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "antigravity/memory|antigravity-cli/plugins"
# Expected: zero matches

# 3. Gate: validation note exists with a verdict
$note = Get-ChildItem "C:\Users\winno\projects\cairn\cairn\docs\notes\NOTE_AGY_04_IMPORT_VALIDATION_*.md" -ErrorAction SilentlyContinue
if (-not $note) { Write-Error "FAIL: validation note missing" }
Select-String -Path $note.FullName -Pattern "IMPORT_CLAUDE_VALIDATED|FALLBACK_GITHUB_SUBPATH"
# Expected: one match

# 4. Gate: program DoD §5 #3 partial check — agy import path documented
Select-String -Path "C:\Users\winno\projects\cairn\cairn\adopt.md" -Pattern "Antigravity CLI \(agy\)"
# Expected: one match

# 5. Gate: no unguarded agent-write to vendor paths in adopt.md
# (a line containing ~/ paths that is NOT a migration-ref and NOT a user-run command)
# Manual review: scan the agy branch lines. Each ~/ path must either:
#   (a) appear in a code block showing a USER command (agy plugin ...), or
#   (b) be a diagnostic location (where agy stages files), or
#   (c) carry <!-- migration-ref --> (migration-only text)
# If any line is an agent Write instruction targeting a vendor path: STOP.
```

**Commit message template:**

```
feat(ws04): validate agy import-claude channel + author agy branch for adopt.md

- Empirically validated `agy plugin import claude` ingests the cairn WS03 plugin
- Recorded findings in docs/notes/NOTE_AGY_04_IMPORT_VALIDATION_<date>.md
- Replaced stale Antigravity IDE adopt.md text with agy CLI branch
- Confirmed cairn skills listed/invocable in agy; uninstall clean
- WS04 verdict: <IMPORT_CLAUDE_VALIDATED|FALLBACK_GITHUB_SUBPATH>

Program: SPEC_CAIRN_OWNERSHIP_00_PROGRAM (WS04)
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Archive line (run after merge, not before):**

```powershell
# Move spec to archive after merge (do NOT run before the commit is on main)
git -C "C:\Users\winno\projects\cairn\cairn" mv `
  docs/specs/SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md `
  docs/specs/archive/SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md
```

---

## Executor Handoff

**Read first:**
1. `docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md` — the binary-verified facts about agy 1.0.7 that ground every assumption in this spec. Read the §Method note before running any scripted agy commands.
2. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §4 (hard contract) and §2.3 (package naming) — the constraints this workstream must never violate.
3. `docs/specs/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md` — WS03 must be complete and `packages/cairn-claude/` must exist before PF-1 can pass.

**The constraint most likely to cause a mistake:**

Phase 1 requires agy to be run **interactively by the user** — not scripted. The assessment note's `§Method` section documents that `agy --print -p "..."` produces no captured output under piped/non-TTY stdin on Windows. If you script the agy invocation, you will get no output and cannot distinguish success from failure. Ask the user to run `agy plugin import claude` in their terminal and paste the output.

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| PF-1 fails (packages/cairn-claude/ missing) | WS03 is not done. Wait for WS03 to complete. This spec cannot run in parallel with WS03. |
| PF-2 fails (agy not on PATH) | Ask user to install agy 1.0.7+ and confirm it is in PATH. |
| P1.2 fails (`import claude` errors) | Record the error. Proceed to P1.7 (fallback evaluation). Reserve `packages/cairn-agy/` as the native plugin path. |
| P1.3 fails (skills not listed) | Check whether the WS03 plugin's `skills/` directory uses the correct `<name>/SKILL.md` format. The assessment note confirms this format is first-class in agy 1.0.7. If WS03 used a flat format, file a finding against WS03. |
| Phase 3 edit causes adopt.md conflict with WS08 | WS04 authors the canonical text; WS08 integrates it. If WS08 runs first, hand off the P3.2 text to WS08's executor directly instead of editing adopt.md here. |

---

## Review Checklist

- [ ] Phase 1 ran interactively (not scripted); user pasted results.
- [ ] Validation note exists at `docs/notes/NOTE_AGY_04_IMPORT_VALIDATION_<date>.md` with a clear verdict line.
- [ ] If IMPORT_CLAUDE_VALIDATED: validation note records the staged path, skills count, smoke invocation result, and uninstall result.
- [ ] If FALLBACK_GITHUB_SUBPATH: the fallback channel is documented with enough detail for WS08 to reference it.
- [ ] adopt.md stale Antigravity IDE text is removed (no `antigravity/memory` or `antigravity-cli/plugins`).
- [ ] adopt.md agy branch Step text is present, written in imperative second-person (commands the USER runs), contains no cairn agent writes to vendor paths.
- [ ] adopt.md agy Step text references `agy plugin import claude` (or the confirmed fallback command) with the expected output.
- [ ] The `<!-- migration-ref -->` sentinel is NOT applied to new agy install paths — only to old v0.13.x vendor paths if they appear in migration text.
- [ ] Post-flight gate 5 (manual vendor-write scan) is signed off.
- [ ] State access path (AGENTS.md auto-load question) is documented in the validation note — even if the answer is "unknown" or "requires further probe."
- [ ] WS08 handoff note is included in the validation note (the agy Step text for WS08 to incorporate).
- [ ] No writes to `~/.gemini/config/`, `~/.claude/`, `~/.pi/agent/`, `<project>/.claude/`, `<project>/.agents/`, or `<project>/CLAUDE.md` / `AGENTS.md` were performed by a cairn process.
