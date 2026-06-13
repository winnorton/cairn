# SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 01, 02

## Goal
Sweep every cairn artifact name for collision with a target harness's built-ins and resolve, enforcing `[LAW own-your-namespace]`.

## Scope
- Enumerate cairn skill names vs Claude Code built-ins (`/review` precedent), agy built-ins/slash commands, Pi `/skill:` space.
- Check folder names (`.cairn/` vs `.agents/`, `.claude/`), package names (`@winnorton/cairn-pi`, `cairn`), command names.
- Produce a collision report: each name → owned / collides / resolved-by-rename.
- Resolve collisions by rename (never coexistence); record in the report.
- Optional: a mechanical check (greppable list) so future skills get audited at add-time.

## Telemetry hook
N/A: audit artifact.

## Diagnostics path
The report IS the surface; a re-run shows zero unresolved collisions.

## Rollback story
`git revert` any rename; the audit report is additive.

## Gate
Zero unresolved collisions; renames applied + cited; `[LAW own-your-namespace]` cited in the closing commit.

## Files
a report (`docs/notes/` or `docs/specs/`), any renamed skill dirs/manifest entries, optional check script.

---

## Background: collision-space reference

This section is READ-ONLY context that grounds the executor's sweep; it is not frozen contract. Every count was derived programmatically from the repo at elaboration time (2026-06-13). Run the Pre-flight commands to verify current counts before proceeding.

### Cairn artifact inventory (current, from source)

**Skill names (18, from `files/skills/` subdirs, excluding README):**
`advocate`, `audit`, `bridge`, `fast-execute`, `feedback`, `note`, `peer-review`, `plan`, `program`, `prompt-evolve`, `prune`, `reflect`, `reframe`, `resume`, `round-review`, `session-distill`, `spec`, `tour`

**Folder/dir names cairn writes:**
- `<project>/.cairn/` — the target cairn-owned state dir (WS01; not yet implemented at elaboration time)
- `<project>/.claude/` — current install target (pre-v0.14, vendor-owned, forbidden write target per §4)
- `files/skills/<name>/` — source tree only; not written to adopter machines

**Package names:**
- `@winnorton/cairn-pi` — npm (published, Pi harness)
- `cairn` — Claude Code plugin (planned, WS03; name to verify)
- `cairn-agy` — reserved agy plugin name (WS04; not yet built)

**Known agy global-skills residue (from `~/.gemini/config/skills/`, verified 2026-06-13):**
`advocate, audit, bridge, feedback, note, plan, program, prune, reflect, reframe, resume, review` (legacy), `spec, tour` — plus stale flat-format duplicates and `review/` (legacy name).

### Harness built-in / reserved command reference

**Claude Code built-in slash commands** (source: cairn repo references + knowledge cutoff Aug 2025):

Confirmed collisions already resolved: `/review` (renamed to `/peer-review` in v0.13.1).
Other known Claude Code built-ins: `/help`, `/clear`, `/quit`, `/add-dir`, `/compact`, `/init`, `/status`, `/cost`, `/bug`, `/pr_comments`, `/vim`, `/release-notes`, `/doctor`.
Potential overlap-risk names from cairn's current list: `plan`, `feedback`, `note`, `audit`, `resume`, `spec` — none confirmed as Claude Code built-ins at elaboration time, but the executor MUST verify against a live harness rather than relying on this list.

**agy (Antigravity CLI, v1.0.7) built-in commands** (source: NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md, verified 2026-06-13):
`agy plugin list|import|install|uninstall|enable|disable|validate|link` — these are CLI subcommands, not slash commands visible inside the chat session. The agy skill namespace is user-supplied; no agy-native slash commands were observed to conflict with cairn's skill names. However, the executor must verify the agy plugin format (WS03/WS04 dependency — see Phase 1 VERIFY gate).

**Pi (pi.dev) `/skill:` namespace** (source: `@juicesharp/rpiv-todo`, `@winnorton/cairn-pi`, Pi docs):
Pi invokes skills as `/skill:<name>`. Known Pi built-in slash commands: `/skill:`, `/goal`, `/memory`, `/todo` (from `@juicesharp/rpiv-todo`). The `/skill:` prefix scopes Pi skills cleanly away from harness-level commands; cairn's names are prefixed at invocation time (`/skill:plan`, `/skill:spec`, etc.). Risk class: lower than Claude Code's flat `/name` form because of the prefix. Still must sweep for names that shadow Pi's own package-provided skills.

---

## Pre-flight

> **HALTING GATE.** Run every command below and verify the expected result. If any command returns a different result than stated, STOP and surface the discrepancy before proceeding to Phase 1.

```powershell
# Shell dialect: PowerShell (Windows). POSIX equivalents shown as comments.
# Run from repo root: C:\Users\winno\projects\cairn\cairn

# PF-1. Confirm skill count in source tree
(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Count
# Expected: 18

# PF-2. List all skill names (the sweep targets)
(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Name | Sort-Object
# Expected: advocate, audit, bridge, fast-execute, feedback, note, peer-review, plan,
#           program, prompt-evolve, prune, reflect, reframe, resume, round-review,
#           session-distill, spec, tour

# PF-3. Confirm the /review → /peer-review rename is already applied (no legacy review/ dir)
Test-Path "files\skills\review"
# Expected: False

# PF-4. Confirm manifest.json lists all 18 skills as dest entries
(Select-String -Path "manifest.json" -Pattern '"dest".*userSkills' | Measure-Object).Count
# Expected: 18

# PF-5. Confirm no unresolved vendor-path write target in manifest skills section
#        (the §5 DoD#1 grep — runs clean against current state)
# POSIX: rg -n '~/.claude|~/.gemini|~/.pi/agent|projectClaude\}/LAWS|userMemory' manifest.json | rg -v 'migration-ref'
Select-String -Path "manifest.json" -Pattern '~/.claude|~/.gemini|~/.pi/agent' |
  Where-Object { $_.Line -notmatch 'migration-ref' }
# Expected: Lines are present (manifest still uses old paths pre-WS06); this is
#           NOT a failure for WS12 — WS06 owns the manifest reshape. Record count only.

# PF-6. Verify the audit report destination doesn't already exist (fresh run)
Test-Path "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md"
# Expected: False (clean slate); if True, the executor must decide whether to overwrite or amend.
```

If PF-1 returns a count other than 18: count the actual skills, update Phase 2's sweep accordingly. Do NOT use a frozen list; use the programmatic output.

If PF-3 returns `True`: a `review/` skill dir still exists. That is a blocking finding — add it to Phase 2's rename list and resolve in Phase 3 before proceeding.

---

## Phase 1 — Verify harness built-in lists (VERIFY-THE-FORMAT phase)

> **Why this is Phase 1:** The master (§3 Resolved Design Decisions) notes that if the Claude plugin format or agy format is uncertain, the first phase must be a VERIFY-the-format phase rather than guessing. Built-in command lists change with harness versions. This phase establishes the authoritative collision surface before sweeping.

### STEP 1.1 — Verify Claude Code built-in slash commands

**CURRENT STATE:** The known `/review` collision was resolved in v0.13.1. The list in the Background section above is the best-available reference at elaboration time but may be stale.

**ACTION:** Run the following to extract any system-level skill/command registration from the local Claude Code installation.

```powershell
# Shell dialect: PowerShell
# Check for claude CLI's help output to enumerate built-ins
claude --help 2>&1 | Select-String -Pattern '^\s+/'
# OR: look for the built-in skill list in Claude Code's own config
Get-ChildItem "$env:USERPROFILE\.claude\skills" -ErrorAction SilentlyContinue |
  Select-Object Name | Sort-Object Name
```

```bash
# Shell dialect: POSIX (if running on Linux/macOS executor)
claude --help 2>/dev/null | grep -E '^\s+/' || true
ls ~/.claude/skills/ 2>/dev/null | sort
```

**EXPECTED RESULT:** A list of slash commands Claude Code registers natively. Record them. Any that match a cairn skill name (case-insensitive) is a potential collision.

**WHY:** The `/review` incident (v0.12.1 → v0.13.1 forced rename) shows that Claude Code's built-ins silently shadow same-named user skills. The collision is undetectable from inside a session — the built-in wins. Verification against the live harness is the only reliable source.

**CHECKPOINT 1.1:** If `claude --help` is unavailable (executor running without Claude Code on PATH), record `UNVERIFIED` in the report and use the known list from Background. Do NOT halt; continue with best-available data and flag the gap in the report.

### STEP 1.2 — Verify agy built-in skill/command list

**CURRENT STATE:** agy v1.0.7 has no observed slash-command collisions with cairn skill names. The agy namespace is `/` for plugin-provided skills but cairn-provided skills via `agy plugin import claude` inherit the Claude Code skill invocation form (which IS flat `/<name>`). The WS03/WS04 dependency means the agy-specific format may not yet be confirmed.

**ACTION:**

```powershell
# Shell dialect: PowerShell
# List any agy built-in skills (the residue path)
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills" -ErrorAction SilentlyContinue |
  Select-Object Name | Sort-Object Name
# List agy-native slash commands if discoverable
agy --help 2>&1 | Select-String -Pattern '^\s+/' -ErrorAction SilentlyContinue
```

**EXPECTED RESULT:** The installed skills list (which currently includes cairn adopt-era residue) plus any native agy commands. Record which are native-agy vs. cairn-installed.

**WHY:** agy's `agy plugin import claude` ingests a Claude Code plugin; the resulting skill invocation form (flat `/<name>` or prefixed) is the key question. If agy exposes cairn skills as flat `/<name>`, the collision surface is identical to Claude Code's. If it prefixes them, collision risk drops to near-zero.

**CHECKPOINT 1.2:** If `agy --help` is unavailable or WS03/WS04 format is not yet confirmed, record `UNVERIFIED (WS03/WS04 dep)` in the report. Do NOT block — this workstream is Wave 0 and parallel to WS03/WS04. The report section for agy must include a `PENDING WS03/WS04` marker and a re-check instruction.

### STEP 1.3 — Verify Pi `/skill:` namespace

**CURRENT STATE:** Pi invokes cairn skills as `/skill:<name>`. The prefix provides structural separation from Pi's own native commands (`/goal`, `/memory`, `/todo`). No cairn skill currently named `goal`, `memory`, or `todo`.

**ACTION:**

```bash
# Shell dialect: POSIX (Pi is typically Linux/macOS)
# List Pi built-in skills (from @juicesharp/rpiv-todo or pi native)
ls ~/.pi/agent/skills/ 2>/dev/null | sort
pi --help 2>/dev/null | grep -E '^\s+/' || true
```

**EXPECTED RESULT:** A list of Pi-installed skills (cairn-installed + any Pi-native). Record which names are Pi-native vs. cairn-installed.

**WHY:** If Pi ever introduces a native `/skill:plan` or `/skill:spec`, cairn's skills would be shadowed. Verifying the current namespace locks the baseline.

**CHECKPOINT 1.3:** Record findings. If Pi is unavailable on the executor machine, mark `UNVERIFIED (Pi unavailable)` and note this as a known gap in the report.

**PHASE 1 CHECKPOINT:** The executor now has three lists: Claude Code built-ins, agy built-ins/installed, Pi built-ins. Proceed to Phase 2. If all three are `UNVERIFIED`, the audit is data-constrained — the Phase 2 sweep still runs against the known reference data; the report marks every finding as `REQUIRES LIVE VERIFICATION`.

---

## Phase 2 — Sweep cairn names against collision surface

> This phase is fully mechanical. For each cairn artifact category, compare names against the verified lists from Phase 1 and the known reference data. Emit one row per artifact in the working collision table.

### STEP 2.1 — Sweep skill names (18 skills)

**ACTION:** Compare each cairn skill name from PF-2 against:
- Claude Code built-in slash commands (Phase 1 Step 1.1)
- agy installed/native commands (Phase 1 Step 1.2)
- Pi `/skill:` namespace (Phase 1 Step 1.3)
- Known historical collisions (the `/review` precedent)

**WORKING TABLE** (executor fills the Status column; pre-filled with elaboration-time analysis):

| Cairn skill name | Claude Code | agy | Pi `/skill:` | Status at elaboration | Action |
|---|---|---|---|---|---|
| `advocate` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `audit` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `bridge` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `fast-execute` | Not a CC built-in | NOT in adopt-era list | No known Pi built-in | OWNED | No action |
| `feedback` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `note` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `peer-review` | Not a CC built-in | NOT in adopt-era list | No known Pi built-in | OWNED (renamed from `review` in v0.13.1) | No action |
| `plan` | VERIFY — potential CC overlap | Adopt-era installed | No known Pi built-in | VERIFY REQUIRED | Phase 3 Step 3.1 |
| `program` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `prompt-evolve` | Not a CC built-in | NOT in adopt-era list | No known Pi built-in | OWNED | No action |
| `prune` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `reflect` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `reframe` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `resume` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `round-review` | Not a CC built-in | NOT in adopt-era list | No known Pi built-in | OWNED | No action |
| `session-distill` | Not a CC built-in | NOT in adopt-era list | No known Pi built-in | OWNED | No action |
| `spec` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |
| `tour` | Not a CC built-in | Adopt-era installed | No known Pi built-in | OWNED | No action |

**LEGACY RESIDUE (not a current cairn skill name, but must be swept):**

| Name | Location | Issue | Action |
|---|---|---|---|
| `review` | agy `~/.gemini/config/skills/review/` | Legacy name (pre-v0.13.1); conflicts with Claude Code built-in `/review` | Phase 3 Step 3.2: cleanup instruction in adopt.md migration section |
| flat `advocate.md`, `bridge.md`, `plan.md`, `reflect.md`, `reframe.md`, `resume.md`, `README.md` | agy `~/.gemini/config/skills/` | Stale pre-v0.12.1 flat format | Phase 3 Step 3.2: cleanup instruction in adopt.md migration section |

**ACTION for `plan`:** The word "plan" is a common verb; Claude Code may register it (cannot confirm without live verification at elaboration time). The executor MUST run Phase 3 Step 3.1 to confirm. If it IS a CC built-in, escalate to a rename (precedent: `/review` → `/peer-review`).

**WHY the adopt-era agy list matters:** Skills installed by an old `adopt cairn` run into `~/.gemini/config/skills/` via agent curl are NOT the same as skills installed via `cairn` Claude Code plugin + `agy plugin import claude`. The adopt-era residue represents the OLD install model being replaced by this program. WS12's job is to flag names that need to be clean in the NEW model.

### STEP 2.2 — Sweep folder/directory names

**ACTION:** Verify each cairn-owned or cairn-referenced folder name against vendor-owned and harness-claimed paths.

| Folder name | Owned by | Status | Notes |
|---|---|---|---|
| `<project>/.cairn/` | cairn (target, WS01) | OWNED — dotted + cairn-named | No known vendor claim. Confirmed clean per §3 resolved decisions. |
| `<project>/.claude/` | Claude Code (vendor) | FORBIDDEN WRITE TARGET (§4) | Cairn currently writes here (pre-v0.14); WS01+WS06+WS08 eliminate this. Not cairn's to name. |
| `<project>/.agents/` | Pi AND agy (contested) | FORBIDDEN — vendor-contested | Binary-confirmed: agy hardcodes `{workspace}/.agents/skills`; Pi also discovers `.agents/skills/`. The parked SPEC_AGENTS_UMBRELLA used `agents/` (undotted) — also wrong, neither harness auto-loads it. The `.cairn/` choice resolves this. |
| `~/.claude/` | Claude Code (vendor) | FORBIDDEN WRITE TARGET (§4) | |
| `~/.gemini/config/` | agy (vendor) | FORBIDDEN WRITE TARGET (§4) | Adopt-era installs land here; the new model routes through `agy plugin import claude`. |
| `~/.pi/agent/` | Pi (vendor) | FORBIDDEN WRITE TARGET (§4) | Pi skills reach here only via `@winnorton/cairn-pi` npm install. |

**WHY:** The `.cairn/` choice is the program's core ownership decision. This step confirms no other harness claims that dotted name at the time of audit.

### STEP 2.3 — Sweep package/plugin names

**ACTION:** Verify each cairn package/plugin name against public registries and vendor namespaces.

| Package name | Registry | Status | Notes |
|---|---|---|---|
| `@winnorton/cairn-pi` | npm | OWNED — scoped + cairn-named | Published at v0.13.1; `@winnorton` scope is maintainer-controlled. |
| `cairn` | Claude Code plugin registry | VERIFY REQUIRED (WS03) | The name `cairn` for the Claude Code plugin — executor must confirm this name is available / not reserved. If Claude Code has a plugin named `cairn` already, a scoped or prefixed name is needed (e.g. `cairn-skills`). WS03 owns resolution; WS12 flags it as a check item. |
| `cairn-agy` | agy marketplace (if used) | RESERVED — not yet built | WS04 dependency; name reserved per §2.3. |

**CHECKPOINT Phase 2:** The executor now has a populated collision table. Items with `VERIFY REQUIRED` or `UNVERIFIED` must be resolved in Phase 3 before the report is final. Items with `OWNED` and `No action` are clean.

---

## Phase 3 — Resolve flagged items

### STEP 3.1 — Verify `plan` against Claude Code built-ins

**CURRENT STATE:** `plan` is flagged `VERIFY REQUIRED` in Step 2.1. Claude Code's built-in list at elaboration time does not include `plan`, but the live harness is the authoritative source.

**ACTION:**

```powershell
# Shell dialect: PowerShell
# Check whether Claude Code registers /plan as a built-in
claude /plan --help 2>&1 | Select-String -Pattern 'built.in|not found|no skill|unknown'
# OR: inspect the installed skills dir for any system-level plan skill
Get-ChildItem "$env:LOCALAPPDATA\AnthropicClaude\*" -Recurse -Filter "plan" -ErrorAction SilentlyContinue
Get-ChildItem "$env:USERPROFILE\.claude\skills\plan" -ErrorAction SilentlyContinue
```

**EXPECTED RESULT — CLEAN:** `plan` is not a Claude Code built-in. Update the table: `plan → OWNED`. No rename needed.

**EXPECTED RESULT — COLLISION:** `plan` IS a Claude Code built-in. In that case:
- The resolution is a rename (precedent: `/review` → `/peer-review`)
- Proposed rename: `cairn-plan` or `plan-session` (cairn-namespaced, descriptive)
- The rename touches: `files/skills/plan/` directory → new name; `manifest.json` dest entry; `files/skills/README.md` catalog entry; `AGENTS.md` skill list; `adopt.md` migration note; `packages/cairn-pi/` if `plan` is in the Pi package (it is not — cairn-pi ships 6 skills, `plan` is not among them)
- Record the rename decision in the report with rationale citing `[LAW own-your-namespace]`
- A rename of a shipped skill is a user-visible breaking change: adopt.md must get a migration note per the `/review` → `/peer-review` precedent

**WHY:** The `/review` collision cost a patch release and a migration note. Catching a similar collision in `plan` here prevents the same pattern.

**CHECKPOINT 3.1:** One of two outcomes: `plan → OWNED` (no action, update table) or `plan → COLLIDES, rename to <new-name>` (execute rename in this phase). Record outcome in working table and in the draft report.

### STEP 3.2 — Document agy adopt-era residue as migration instruction

**CURRENT STATE:** The agy global skills dir `~/.gemini/config/skills/` contains:
1. A `review/` subdirectory — the legacy name, collision-prone with Claude Code's `/review` built-in
2. Flat-format `.md` files — pre-v0.12.1 format, stale

These are NOT cairn artifacts WS12 must rename in source. They are USER-SIDE RESIDUE from old adopt runs. WS12's job is to ensure the adopt.md migration section for agy includes a cleanup instruction.

**ACTION:** Verify that the adopt.md migration section for agy (if it exists) contains cleanup text for these residue items. It currently does NOT (the adopt.md Antigravity section documents IDE paths predating the CLI entirely per the NOTE). The correct location for this instruction is WS09 (migration), but WS12 must flag it.

```powershell
# Shell dialect: PowerShell
# Verify current adopt.md agy coverage
Select-String -Path "adopt.md" -Pattern "~/.gemini/config|agy|antigravity.cli" -CaseSensitive:$false |
  Select-Object LineNumber, Line
```

**EXPECTED RESULT:** The agy-specific paths (`~/.gemini/config/skills/`) are NOT currently documented in adopt.md (the file documents IDE paths `~/.gemini/antigravity/` which are stale). This is a gap for WS09, not WS12 to fix — but WS12 must record the finding in the collision report so WS09 picks it up.

**WHY:** The `review/` residue in agy's installed skills is a live namespace collision (the old name collides with Claude Code's built-in). Users who adopted cairn pre-v0.13.1 in agy and then use the same workspace in Claude Code are exposed. The migration instruction eliminates the exposure.

**CHECKPOINT 3.2:** Add to the collision report a `RESIDUE` section listing the agy cleanup items, tagged `WS09: add migration instruction`. No source-tree edit in this step.

### STEP 3.3 — Verify `cairn` plugin name availability (WS03 dependency)

**CURRENT STATE:** The program §2.3 reserves `cairn` as the Claude Code plugin name. WS12 must verify this name is not already taken by a published Claude Code plugin before WS03 proceeds.

**ACTION:** Check whether a `cairn` plugin already exists in Claude Code's plugin registry or marketplace.

```bash
# Shell dialect: POSIX
# Attempt to inspect Claude Code plugin registry for a 'cairn' name conflict
# The registry URL and tooling are WS03-specific; this is a probe, not an install
claude plugin list 2>/dev/null | grep -i cairn || echo "no-conflict-found"
```

**EXPECTED RESULT:** No existing `cairn` plugin. Record `cairn plugin name: AVAILABLE`. If a conflict exists, WS03 must use a different name (e.g., `cairn-skills`) and WS12 must update the report accordingly.

**WHY:** Naming the plugin `cairn` when another plugin of that name exists would repeat the `/review` collision class but at the package level — harder to detect, harder to rename post-ship.

**CHECKPOINT 3.3:** Record `cairn: AVAILABLE` or `cairn: CONFLICT — use <alternative>` in the working table. If the Claude Code plugin registry is not queryable from the executor's context, mark `UNVERIFIED (requires WS03 live install)` and note in the report that WS03 must confirm availability before publishing.

---

## Phase 4 — Produce collision report

> This phase writes the one output artifact. No source-tree edits; the report is additive.

### STEP 4.1 — Write the collision report file

**ACTION:** Create `docs/specs/COLLISION_REPORT_NAMESPACE_AUDIT.md` with the following structure. Use exact section headings shown.

```powershell
# Shell dialect: PowerShell
# Verify destination doesn't exist (or confirm overwrite is intentional per PF-6)
Test-Path "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md"
# Then: create the file using your Write tool (do not echo/heredoc from shell)
```

**FILE TO CREATE:** `C:/Users/winno/projects/cairn/cairn/docs/specs/COLLISION_REPORT_NAMESPACE_AUDIT.md`

**CONTENT STRUCTURE** (executor fills in live-verified data; template below):

```markdown
# Namespace Collision Report — cairn v0.13.1 → v0.14.0

> **Date:** <date of execution>
> **Executor:** <model/agent>
> **Law:** [LAW own-your-namespace]
> **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
> **Status:** <CLEAN / HAS-COLLISIONS / PARTIAL (some UNVERIFIED)>

## §1 Summary

<1-3 sentence summary: N skills checked, M collisions found, N resolved, M pending.>

## §2 Skill name sweep (18 skills)

| Cairn skill | CC built-in? | agy conflict? | Pi conflict? | Resolution | Status |
|---|---|---|---|---|---|
| advocate | ... | ... | ... | none needed | OWNED |
...

## §3 Legacy residue sweep

| Name | Location | Conflict type | Required action | Owner WS |
|---|---|---|---|---|
| `review` | ~/.gemini/config/skills/ | CC built-in collision | Add cleanup to adopt.md migration | WS09 |
| flat .md files | ~/.gemini/config/skills/ | Stale format | Add cleanup to adopt.md migration | WS09 |

## §4 Folder / directory sweep

| Folder | Owned by | Status | Notes |
|---|---|---|---|
| <project>/.cairn/ | cairn | OWNED | ... |
...

## §5 Package / plugin name sweep

| Package | Registry | Status | Notes |
|---|---|---|---|
| @winnorton/cairn-pi | npm | OWNED | ... |
| cairn (plugin) | CC registry | AVAILABLE / CONFLICT | ... |

## §6 UNVERIFIED items (require follow-up)

<List any items marked UNVERIFIED with the condition that would resolve them.>

## §7 Renames applied this workstream

<If any renames were applied (e.g. plan → plan-session), list them here with the
files changed and the rationale citing [LAW own-your-namespace].>

## §8 Items handed to other workstreams

| Finding | Target WS | Description |
|---|---|---|
| agy residue cleanup | WS09 | Add migration instruction for ~/.gemini/config/skills/ review/ and flat-format files |
| cairn plugin name confirmation | WS03 | Verify 'cairn' is available in CC plugin registry before publishing |

## §9 Mechanical check — re-run instructions

To re-run this audit after adding a new skill:

```powershell
# Shell dialect: PowerShell
# 1. Enumerate current skill names
(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Name | Sort-Object
# 2. Compare against CC built-ins
claude --help 2>&1 | Select-String -Pattern '^\s+/'
# 3. Compare against agy skills
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills" -ErrorAction SilentlyContinue | Select-Object Name
# 4. Update this report's §2 table; report is the audit artifact.
```
```

**WHY this structure:** The report is the diagnostic surface the Diagnostics path section references. A re-run shows zero unresolved collisions in §6 and §7 when the workstream is clean. Downstream WS10 (docs) links to this report as the namespace-audit evidence.

**CHECKPOINT 4.1:** The report file exists at `docs/specs/COLLISION_REPORT_NAMESPACE_AUDIT.md`. Verify:

```powershell
# Shell dialect: PowerShell
Test-Path "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md"
# Expected: True
(Get-Content "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md" | Select-String -Pattern "§").Count
# Expected: 9 (one per section header)
```

If the file is absent or section count is wrong, re-run Step 4.1 before proceeding.

---

## Phase 5 — Apply any required renames

> This phase executes ONLY if Phase 3 surfaces a collision requiring a rename. If all items are OWNED/AVAILABLE, skip to Post-flight.

### STEP 5.1 — Apply skill rename (conditional: only if Phase 3 Step 3.1 finds a collision)

**GATE:** Skip this step unless Phase 3 Step 3.1 confirmed that a cairn skill name collides with a Claude Code built-in.

**CURRENT STATE:** At elaboration time, no rename is confirmed necessary beyond the already-applied `/review` → `/peer-review`. If the executor's live verification in Phase 3 finds a collision (most likely candidate: `plan`), this step applies the rename.

**IF RENAME IS NEEDED FOR `plan` (example; adapt for any confirmed collision):**

```powershell
# Shell dialect: PowerShell
# 1. Rename the skill directory
Rename-Item "files\skills\plan" "files\skills\cairn-plan"

# 2. Update the skill's own frontmatter name field
# Edit files\skills\cairn-plan\SKILL.md: change 'name: plan' to 'name: cairn-plan'
# (use the Edit tool — do not sed/awk)

# 3. Update manifest.json: find the plan skill entry and update src/dest
# Edit manifest.json: "files/skills/plan/SKILL.md" -> "files/skills/cairn-plan/SKILL.md"
# and "{userSkills}/plan/SKILL.md" -> "{userSkills}/cairn-plan/SKILL.md"
# (use the Edit tool)

# 4. Update files/skills/README.md skill catalog entry
# (use the Edit tool)

# 5. Update AGENTS.md skill list entry
# (use the Edit tool)

# 6. Verify cairn-pi package does NOT include 'plan' (it doesn't — packages/cairn-pi ships 6 skills:
#    spec, program, round-review, fast-execute, peer-review, note)
(Get-ChildItem "packages\cairn-pi\skills" -Directory).Name | Sort-Object
# Expected: fast-execute, note, peer-review, program, round-review, spec
# If plan appears: apply the same rename to packages/cairn-pi/skills/plan/
```

**ONE FILE PER EDIT RULE:** Edit each file in its own Edit tool call. The files touched are:
1. `files/skills/<old-name>/` → renamed directory (git mv equivalent)
2. `files/skills/<new-name>/SKILL.md` — frontmatter `name:` field
3. `manifest.json` — `src` and `dest` entries for the renamed skill
4. `files/skills/README.md` — skill catalog entry
5. `AGENTS.md` — skill list entry

**WHY:** A rename without updating all five surfaces leaves orphaned references that break adopt.md's preview table and any skill that cross-references the renamed one.

**CHECKPOINT 5.1:** After any rename:

```powershell
# Shell dialect: PowerShell
# Verify no old name survives in critical files
Select-String -Path "manifest.json", "files\skills\README.md", "AGENTS.md" -Pattern "name: plan" |
  Where-Object { $_.Filename -ne "SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md" }
# Expected: zero matches (for a plan→cairn-plan rename)

# Verify new name is present
Select-String -Path "manifest.json" -Pattern "cairn-plan"
# Expected: matches for src and dest entries
```

If the old name still appears in any of the three files: fix before proceeding to Post-flight.

---

## Post-flight

> Final verification. Run all commands; any failure blocks the commit.

```powershell
# Shell dialect: PowerShell
# PO-1. Skill count unchanged (or changed by exactly the number of renames)
(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Count
# Expected: 18 (unchanged if no renames; adjust if renames added/removed names)

# PO-2. Collision report exists and is non-trivial
Test-Path "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md"
# Expected: True
(Get-Content "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md").Count
# Expected: > 30 lines (a real report, not a stub)

# PO-3. No legacy 'review' dir in skill source tree
Test-Path "files\skills\review"
# Expected: False

# PO-4. Program-level DoD gate: zero unresolved collisions
# The report's §6 UNVERIFIED section should be empty or contain only
# items explicitly marked as pending downstream workstreams (WS03, WS09).
# Manual check: read the report's §6 and confirm no UNRESOLVED items exist
# that WS12 itself is responsible for.

# PO-5. LAW citation present in collision report
Select-String -Path "docs\specs\COLLISION_REPORT_NAMESPACE_AUDIT.md" -Pattern "LAW own-your-namespace"
# Expected: at least 1 match
```

**COMMIT MESSAGE TEMPLATE:**

```
audit(namespace): WS12 namespace collision audit complete

Swept all 18 cairn skill names, 3 folder names, 2 package names against
Claude Code, agy, and Pi built-ins per [LAW own-your-namespace].

Report: docs/specs/COLLISION_REPORT_NAMESPACE_AUDIT.md

<If any renames were applied:>
Rename: <old> → <new> (collision with <harness> built-in)

<If no renames were needed:>
Finding: zero new collisions (only legacy review/ residue in agy, handed to WS09)

Hands to WS09: add agy ~/.gemini/config/skills/ cleanup to migration section.
Hands to WS03: confirm 'cairn' plugin name availability before publish.

[LAW own-your-namespace]
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**GIT MV TO ARCHIVE (after WS10 docs are complete and the program closes):**

```powershell
# Shell dialect: PowerShell
# Run only at program close, not immediately after WS12 completes
git mv "docs\specs\SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md" "docs\specs\archive\SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md"
# The collision report stays in docs/specs/ (not archived — it's a living reference for WS08's namespace-audit ratchet)
```

---

## Executor Handoff

**Three critical files to read first (in order):**
1. `C:/Users/winno/projects/cairn/cairn/docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` — §4 hard contract and §2 contracts. WS12's job is constraint gate 4 ("every cairn artifact name is collision-checked").
2. `C:/Users/winno/projects/cairn/cairn/LAWS.md` — `[LAW own-your-namespace]` (the `own-your-namespace` slug, near the end of the file). This is the normative basis for every decision in this spec.
3. `C:/Users/winno/projects/cairn/cairn/docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md` — the empirically verified agy built-in facts, binary-confirmed. Do not re-derive from web sources; the note is the ground truth.

**The one constraint most likely to cause a mistake:**

The Background section's collision table is elaboration-time analysis, NOT ground truth. The Phase 1 verification steps exist precisely because the live harness is the authority. An executor who skips Phase 1 and just uses the pre-filled table risks missing a new Claude Code built-in added after the elaboration date (2026-06-13). Phase 1 is not optional.

**Recovery for common failures:**

- *"PF-1 returns a count other than 18":* Do not assume the elaboration-time list is correct. Run `(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Name` and build the actual list. Update Phase 2's sweep rows to match.
- *"Phase 1 built-in enumeration returns no output" (claude --help unavailable):* Do not halt. Mark all Claude Code entries in Phase 2 as `UNVERIFIED (live check unavailable)`. Complete the rest of the sweep with reference data. Flag in §6 of the report. The audit is still valuable; the executor documents the gap rather than blocking.
- *"Phase 3 finds a confirmed collision":* The rename procedure is in Step 5.1. Do not coexist with the collision — the precedent is explicit (the master §3: "On collision with a vendor name, rename — don't coexist"). The rename is not optional; only the specific new name is a judgment call (prefer cairn-namespaced: `cairn-<verb>` or `<verb>-session`).
- *"The collision report file already exists" (PF-6 returns True):* Read the existing report. If it is from a previous executor run, amend rather than overwrite — add a new `## Run <date>` section at the top. If it is a stub or empty file, overwrite.

---

## Review Checklist

Before marking WS12 COMPLETE in the program's §9.4 status table, verify:

- [ ] Pre-flight all passed (or documented exceptions logged)
- [ ] Phase 1 produced at least one verified harness built-in list (not all three `UNVERIFIED`)
- [ ] Phase 2 collision table has a Status for every one of the 18 skill names (no blank rows)
- [ ] Phase 2 folder sweep confirms `.cairn/` is uncontested
- [ ] Phase 2 package sweep entry for `cairn` plugin name is filled in (AVAILABLE, CONFLICT, or UNVERIFIED)
- [ ] Phase 3 `plan` verification ran and result recorded in Phase 2 table
- [ ] Phase 3 agy residue finding recorded in the report's §3 Legacy residue section
- [ ] Phase 4 collision report exists at `docs/specs/COLLISION_REPORT_NAMESPACE_AUDIT.md`
- [ ] Report §6 UNVERIFIED section contains only items explicitly handed to WS03/WS09
- [ ] Report §9 re-run instructions are present (mechanical check for future skill additions)
- [ ] Report cites `[LAW own-your-namespace]`
- [ ] If any rename was applied: all 5 surfaces updated (dir, frontmatter, manifest, README, AGENTS.md); CHECKPOINT 5.1 passed
- [ ] Post-flight PO-1 through PO-5 all pass
- [ ] Commit message cites `[LAW own-your-namespace]` and lists WS03/WS09 handoffs
- [ ] No step wrote to `~/.claude/`, `~/.gemini/`, `~/.pi/`, `<project>/.claude/`, `<project>/.agents/`, `CLAUDE.md`, or `AGENTS.md` (§4 hard contract)
