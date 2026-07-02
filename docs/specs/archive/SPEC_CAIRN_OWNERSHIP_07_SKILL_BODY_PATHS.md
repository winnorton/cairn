# SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 04, 05, 06

## Goal
Update every skill body that probes a vendor memory path so it probes `<project>/.cairn/memory/` instead.

## Scope
- **Programmatic enumeration** (not a frozen list): `rg -l "~/.claude/memory|~/.pi/agent/memory|\.claude/projects/.*memory|<slug>" files/skills/` → the affected set.
- Known candidates: `resume`, `reflect`, `note`, `session-distill`, `audit` (probe/cite memory locations).
- **`session-distill` and `audit` are excluded from the sweep:** a pre-flight `rg` confirms neither contains a hardcoded `~/.claude/memory/` probe — `session-distill`'s vendor-path lines are a "where do session JSONL files live" location table (corpus integration, not a cairn state probe), and `audit`'s single vendor-path mention is a transcript-location hint, not a memory write target.
- Rewrite probes to `.cairn/memory/`; preserve each skill's logic — only the *path* changes.
- Update the `/note`-vs-cross-session-memory framing where it asserts user-space vs repo (now both are repo-local under `.cairn/`).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`rg -c "~/.claude/memory" files/skills/` → 0 after the sweep (except deliberate migration-instruction text).

## Rollback story
`git revert`; skill bodies are independent files.

## Gate
Zero vendor-memory-path probes remain in `files/skills/`; affected skills reference `.cairn/memory/`; `rg` count proves it.

## Files
`files/skills/**/SKILL.md` (the `rg`-determined set).

---

## Pre-flight

Shell dialect: **PowerShell** (executor on Windows); POSIX equivalents are shown in comments where they differ.

Run the following before Phase 1. If any expectation fails, STOP and surface the failure before continuing.

```powershell
# PowerShell — run from repo root
$repoRoot = "C:/Users/winno/projects/cairn/cairn"
Set-Location $repoRoot

# PF-1: Confirm WS01 dependency is complete (program master §9.2 requires 01 before 07).
#   Expected: a .cairn/ directory exists (or its layout spec is COMPLETE in the master table).
#   If this repo is not yet the reference adopter, confirm the layout contract (§2.1) is
#   frozen in the master spec before editing skill bodies to reference it.
Write-Host "=== PF-1: WS01 contract check ==="
Select-String -Path "docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md" -Pattern "\| 01 \|" | Select-Object -First 1

# PF-2: Enumerate the CURRENT set of vendor-memory-path probes in skill bodies.
#   Expected: rg exits 0 and prints a non-empty list of matching files.
Write-Host "=== PF-2: Vendor-memory probe enumeration ==="
rg -l "~/.claude/memory|~/.pi/agent/memory|\.claude/projects/.*memory|~/.claude/projects" files/skills/
# POSIX: rg -l "~/.claude/memory|~/.pi/agent/memory|\.claude/projects/.*memory|~/.claude/projects" files/skills/

# PF-3: Verify the broader vendor-path occurrence count before editing.
#   Record this number — Post-flight verifies it drops to 0 for the memory-probe subcategory.
Write-Host "=== PF-3: Vendor-path occurrence totals (baseline) ==="
rg -c "~/.claude|~/.pi/agent|~/.gemini" files/skills/
# Expected output (counts may differ if files changed since elaboration):
#   files/skills/session-distill/SKILL.md:3    <- session-LOCATION table only; NOT in scope
#   files/skills/note/SKILL.md:2               <- framing text; IN scope (Phase 2)
#   files/skills/reflect/SKILL.md:2            <- downstream-consumer reference; IN scope (Phase 3)
#   files/skills/resume/SKILL.md:6             <- memory-probe block; IN scope (Phase 1)
#   files/skills/audit/SKILL.md:1              <- transcript-location hint; OUT of scope (not a memory probe)
#   files/skills/README.md:2                   <- install-path docs; OUT of scope

# PF-4: Confirm no .cairn/memory references already exist (clean slate for this WS).
Write-Host "=== PF-4: .cairn/memory baseline (expect zero output) ==="
rg "\.cairn/memory" files/skills/
# Expected: zero matches. If non-zero, a prior partial run landed — read current state before editing.

# PF-5: Confirm we are in a dedicated worktree per §9.3 protocol (not main).
Write-Host "=== PF-5: Worktree check ==="
git rev-parse --show-toplevel
git branch --show-current
# Expected: current branch is NOT main (executor works in a dedicated worktree branch).
# If on main, create a worktree: git worktree add ../ws07-skill-body-paths -b ws07-skill-body-paths
```

**Halting gates:** if PF-2 returns zero matches OR PF-4 returns non-zero matches, STOP. Either WS01 hasn't landed yet (PF-2 empty — skill bodies would already reference `.cairn/`) or a partial prior run needs reconciling (PF-4 non-empty — read current file state before editing).

---

## Phase 1 — Update `resume` skill: replace vendor memory-probe block

**Scope:** `files/skills/resume/SKILL.md`

This skill's "Memory directory probe" section (lines ~60–87 at time of elaboration) instructs the agent to probe `~/.claude/memory/` and `~/.claude/projects/<slug>/memory/` — the Claude Code vendor path. After WS01 lands, cairn memory lives at `<project>/.cairn/memory/`. The probe block must target the new path and drop the vendor-path slug logic.

### Step 1.1 — Replace the memory probe section header and bullet list

**File:** `files/skills/resume/SKILL.md`

**Current state (find this exact block):**
```markdown
### 2. Memory directory probe (worktree-aware + HANDOFF-aware)

Memory may be project-scoped, user-global, or per-worktree depending on Claude Code
configuration. **Probe multiple slugs.** Common locations:

- `~/.claude/memory/` (user-global)
- `~/.claude/projects/<current-cwd-slug>/memory/` (project-scoped, current slug)
- `~/.claude/projects/<parent-cwd-slug>/memory/` (parent slug — important for worktrees)

The slug is derived from the absolute path with separators replaced: `C:\Users\foo\bar`
becomes `C--Users-foo-bar`. For a worktree at `<project>/.claude/worktrees/<name>/`, the
parent slug points at `<project>` itself.
```

**Replacement:**
```markdown
### 2. Memory directory probe

Memory lives at `<project>/.cairn/memory/` — git-tracked, project-local, no vendor path
needed. **Probe the canonical path first; fall back to legacy vendor paths for v0.13.x
migrations.**

Primary probe (v0.14.0+ adopted cairn):

- `<cwd>/.cairn/memory/` (canonical post-WS01 location)

Fallback probes (v0.13.x installs not yet migrated — WS09):

- `~/.claude/projects/<current-cwd-slug>/memory/` (old Claude Code project-scoped slug)
- `~/.claude/projects/<parent-cwd-slug>/memory/` (old parent slug — worktree installs)

The slug is derived from the absolute path with separators replaced: `C:\Users\foo\bar`
becomes `C--Users-foo-bar`.
```

**Why:** After WS01, `<project>/.cairn/memory/` is the single source of truth. The fallback probes preserve the v0.13.x migration path (users who haven't run WS09 yet will still have memory at the old location). The slug derivation note remains because the fallback probes still need it.

### Step 1.2 — Replace the HANDOFF-aware cross-project pointer example

**File:** `files/skills/resume/SKILL.md`

**Current state (find this exact block):**
```markdown
**ALSO: if HANDOFF.md (from step 1) contains a `## Related memory paths` section,
probe those paths too.** This is how cross-project memory bridges work — when a session
in project A produced memory at project B's slug, HANDOFF.md in A declares the pointer
so `/resume` knows to follow it. Example HANDOFF.md content:

```markdown
## Related memory paths

- `~/.claude/projects/C--Users-foo-projects-other-project/memory/` — primary memory
  for this effort lives at this slug, not the current one
```
```

**Replacement:**
```markdown
**ALSO: if HANDOFF.md (from step 1) contains a `## Related memory paths` section,
probe those paths too.** This is how cross-project memory bridges work — when a session
in project A produced memory at project B's `.cairn/memory/`, HANDOFF.md in A declares
the pointer so `/resume` knows to follow it. Example HANDOFF.md content:

```markdown
## Related memory paths

- `/path/to/other-project/.cairn/memory/` — primary memory for this effort lives in
  the sibling project, not the current one
```
```

**Why:** The example was anchored to the Claude Code slug-path convention. After WS01, cross-project memory bridges point at `.cairn/memory/` absolute paths, not vendor slugs.

**CHECKPOINT — Phase 1**

```powershell
# Verify: no vendor-slug memory probes remain in resume (the user-global path is
# now in a fallback block, not the primary instruction)
rg -n "~/.claude/memory/" files/skills/resume/SKILL.md
# Expected: 0 matches in the PRIMARY probe section.
# The fallback block may still mention it — verify it is labelled "Fallback probes".

# Verify: .cairn/memory appears in the primary probe
rg -n "\.cairn/memory" files/skills/resume/SKILL.md
# Expected: 1 match in the "Primary probe" bullet.

# Verify: file still parses as valid markdown (no runaway fences)
# Manually scan: open the file and confirm the fenced code block in Step 1.2
# has matching opening/closing fences.
```

If the `.cairn/memory` match is absent: the edit did not land — re-read the file and retry Step 1.1.

---

## Phase 2 — Update `note` skill: reframe the cross-session memory contrast

**Scope:** `files/skills/note/SKILL.md`

The `/note` skill uses `~/.claude/memory/` as a CONTRAST EXAMPLE to distinguish "project-repo notes" from "vendor-space agent memory." After WS01, cairn memory is ALSO repo-local (under `.cairn/memory/`). The contrast framing must be updated: the distinction is now "in-repo, in `docs/notes/`" vs "in-repo, in `.cairn/memory/`, agent-indexed." The `~/.claude/memory/` specific path is no longer the right exemplar.

**Important scope clarification:** this phase does NOT redirect agents to file notes into `.cairn/memory/`. Notes still go to `docs/notes/`. The change is purely in how the skill explains the difference between a note and cross-session memory — the latter is now described in terms of `.cairn/memory/` not `~/.claude/memory/`.

### Step 2.1 — Update the distinction blurb in the frontmatter description

**File:** `files/skills/note/SKILL.md`

**Current state (find this exact block):**
```markdown
  Distinct from cross-session agent memory — this lives in the project repo
  (visible to anyone who clones); memory lives in user-space (visible only to agents on
  this user's machine). Do NOT use for executor handoffs or multi-step refactor plans —
```

**Replacement:**
```markdown
  Distinct from cross-session agent memory — this lives in `docs/notes/` in the project
  repo (ephemeral, human-visible at `ls`); memory lives in `.cairn/memory/` (agent-indexed,
  persists across sessions, same repo but different purpose). Do NOT use for executor
  handoffs or multi-step refactor plans —
```

**Why:** After WS01, "user-space / visible only to agents on this machine" is no longer the defining distinction. Both `/note` and `.cairn/memory/` are in the repo. The real distinction is scope of purpose: notes are ephemeral intent-capture; memory entries are durable cross-session agent state.

### Step 2.2 — Update the "Distinct from cross-session memory" paragraph in the body

**File:** `files/skills/note/SKILL.md`

**Current state (find this exact block):**
```markdown
**Distinct from cross-session memory:** `/note` files to the project repo. Cross-session
agent memory (the `~/.claude/memory/` system) is a different verb — see "Filing destination"
below for routing.
```

**Replacement:**
```markdown
**Distinct from cross-session memory:** `/note` files to `docs/notes/` in the project repo
(ephemeral, human-readable, git-tracked intent capture). Cross-session **agent memory** lives
in `.cairn/memory/` in the same repo — also git-tracked, but agent-indexed across sessions
rather than ephemeral. See "Filing destination" below for routing.
```

**Why:** The old framing ("project repo" vs "user-space") was the right distinction pre-WS01. Post-WS01 both are git-tracked in the repo — the real distinction is purpose and lifecycle, not location.

### Step 2.3 — Update the "Filing destination" section

**File:** `files/skills/note/SKILL.md`

**Current state (find this exact block):**
```markdown
## Filing destination — `/note` vs cross-session agent memory

`/note` files to the **project repo** (in version control, ships with the codebase, visible
to anyone who clones). Cross-session **agent memory** lives in **user-space** (visible only
to agents on this user's machine — e.g. `~/.claude/memory/`).

Use this table to route:
```

**Replacement:**
```markdown
## Filing destination — `/note` vs cross-session agent memory

`/note` files to `docs/notes/` in the **project repo** (ephemeral intent capture — version
controlled, visible to anyone who clones, cheap to delete once acted on). Cross-session
**agent memory** lives in `.cairn/memory/` — also in the project repo, but agent-indexed for
durable cross-session reasoning rather than ephemeral capture.

Use this table to route:
```

**Why:** `~/.claude/memory/` is no longer the right address. `.cairn/memory/` is the post-WS01 canonical agent memory location. The "user-space / visible only on this machine" framing is now obsolete.

### Step 2.4 — Update the routing table bottom row and the "when in doubt" advice

**File:** `files/skills/note/SKILL.md`

**Current state (find this exact block):**
```markdown
| "Should this fact survive the project being cloned to a new machine?" | Cross-session memory if generic; `/note` if project-bound |

Both can fire for the same observation, answering different questions. **When in doubt,
prefer `/note`.** Repo-visible beats user-space-buried — a note in the repo can be deleted
later if it turns out too generic; a memory entry that should have been in-repo is
silently invisible to future cloners.
```

**Replacement:**
```markdown
| "Should this fact persist across sessions and be visible to the agent automatically?" | Cross-session memory (`.cairn/memory/`) |

Both can fire for the same observation, answering different questions. **When in doubt,
prefer `/note`.** Ephemeral-and-deletable beats durable-and-indexed — a note in `docs/notes/`
can be promoted to a `.cairn/memory/` entry later; a memory entry added prematurely
creates agent-context clutter without being pruned.
```

**Why:** The old "repo-visible beats user-space-buried" rationale was correct before WS01 when memory WAS user-space-buried. Now both are in the repo, so the rationale shifts to lifecycle: notes are ephemeral intent capture; memory entries are durable and agent-indexed.

**CHECKPOINT — Phase 2**

```powershell
# Verify: no ~/.claude/memory references remain in note skill
rg -n "~/.claude/memory" files/skills/note/SKILL.md
# Expected: 0 matches.

# Verify: .cairn/memory now appears as the agent-memory address
rg -n "\.cairn/memory" files/skills/note/SKILL.md
# Expected: 3+ matches (Steps 2.1, 2.2, 2.3 each add one).

# Verify: the routing table still has all rows (check line count hasn't shrunk dramatically)
(Select-String -Path "files/skills/note/SKILL.md" -Pattern "^\|").Count
# Expected: 8+ table rows (same as before — only bottom row changed content, not count).
```

If `~/.claude/memory` still appears: the edit did not fully land — re-read the file, identify which step's old_string wasn't found, and retry that step only.

---

## Phase 3 — Update `reflect` skill: reframe downstream-consumer path mention

**Scope:** `files/skills/reflect/SKILL.md`

Two lines in `/reflect` reference `~/.gemini/antigravity/memory/` as an EXAMPLE of a cross-project user-global consumer path. This is an EXTERNAL consumer (Antigravity/Gemini), not a cairn state path — the path itself is not wrong. However, the surrounding framing needs a note that the PRIMARY case for cairn-adopting consumers is `.cairn/memory/`, not a vendor path.

The existing Step 6 file-naming convention distinguishes "slug-separated consumer" (per-project) from "cross-project user-global consumer" (like Antigravity). After WS01, any cairn-adopting consumer uses `.cairn/memory/`; the Antigravity example applies only to non-cairn consumers that happen to receive distillate.

### Step 3.1 — Add a cairn-consumer note before the cross-project example

**File:** `files/skills/reflect/SKILL.md`

**Current state (find this exact block):**
```markdown
   File naming convention depends on the consumer's memory store layout:
   - **Slug-separated consumer** (per-project memory tree):
     `distillate/<consumer-name>/<type>/<slug>.md`
   - **Cross-project user-global consumer** (e.g. Antigravity's
     `~/.gemini/antigravity/memory/`, where multiple workspaces share one tree):
     `distillate/<consumer-name>/<type>/<this-project>/<slug>.md` — the
     `<this-project>` subdir prevents pile-up when many workspaces feed one
     consumer. Use the producing workspace's directory basename (typically
     `path.basename(cwd)`, e.g. `cwar-engine`, `cairn`).
```

**Replacement:**
```markdown
   File naming convention depends on the consumer's memory store layout:
   - **Cairn-adopting consumer** (per-project `.cairn/memory/` tree — the default for any
     project that has run `adopt`):
     `distillate/<consumer-name>/<type>/<slug>.md`
     → transport to `<consumer-project>/.cairn/memory/<type>/<slug>.md`
   - **Cross-project user-global consumer** (e.g. Antigravity's
     `~/.gemini/antigravity/memory/`, where multiple workspaces share one tree — applies
     to non-cairn consumers or legacy v0.13.x installs):
     `distillate/<consumer-name>/<type>/<this-project>/<slug>.md` — the
     `<this-project>` subdir prevents pile-up when many workspaces feed one
     consumer. Use the producing workspace's directory basename (typically
     `path.basename(cwd)`, e.g. `cwar-engine`, `cairn`).
```

**Why:** The Antigravity path (`~/.gemini/antigravity/memory/`) is external and correct for that consumer. The change adds the cairn-adopting consumer case (`.cairn/memory/`) as the PRIMARY example before the Antigravity case, so executors reading `/reflect` learn the canonical path first. The Antigravity line is preserved because it's a real external consumer that uses a vendor path.

### Step 3.2 — Update the transport prompt in Step 7

**File:** `files/skills/reflect/SKILL.md`

**Current state (find this exact block):**
```markdown
7. **Offer transport if the consumer path is locally writable.** After writing distillate,
   check whether the declared consumer path (e.g. `~/.gemini/antigravity/memory/`) is a
   real directory the current process can write to. If yes, ask:
```

**Replacement:**
```markdown
7. **Offer transport if the consumer path is locally writable.** After writing distillate,
   check whether the declared consumer path (e.g. `<consumer-project>/.cairn/memory/` for
   cairn-adopting consumers, or `~/.gemini/antigravity/memory/` for Antigravity) is a
   real directory the current process can write to. If yes, ask:
```

**Why:** The example in the offer-transport step only showed the Antigravity path. Adding the `.cairn/memory/` case makes the canonical post-WS01 path visible here too, so agents default to the right offer.

**CHECKPOINT — Phase 3**

```powershell
# Verify: the Antigravity path (~/.gemini/antigravity/memory/) still appears
# (it's an external consumer - we PRESERVE it, not remove it)
rg -n "~/.gemini/antigravity/memory" files/skills/reflect/SKILL.md
# Expected: 2 matches (Step 3.1 body + Step 3.2 — both preserved).

# Verify: .cairn/memory now appears as the primary consumer path example
rg -n "\.cairn/memory" files/skills/reflect/SKILL.md
# Expected: 2 matches (Step 3.1 new bullet + Step 3.2 updated transport example).

# Verify: the "Slug-separated consumer" label is now "Cairn-adopting consumer"
rg -n "Cairn-adopting consumer" files/skills/reflect/SKILL.md
# Expected: 1 match.
```

If `~/.gemini/antigravity/memory/` count drops below 2: you over-removed — this is a legitimate external consumer path, not a cairn state path. Restore from `git diff`.

---

## Post-flight

### Final verification

```powershell
# PowerShell — from repo root

# V-1: Gate check — no vendor MEMORY PROBE paths remain in the three in-scope skills.
#   Session-distill, audit, README are explicitly OUT of scope (session locations, not
#   cairn-state probes). Only resume/note/reflect are in scope.
Write-Host "=== V-1: vendor-memory probe check (resume + note only) ==="
rg -n "~/.claude/memory" files/skills/resume/SKILL.md files/skills/note/SKILL.md
# Expected: 0 matches. (resume now has a "Fallback probes" label but the primary
# instruction no longer says ~/.claude/memory/ as the target — verify label is present.)

# V-2: .cairn/memory appears in all three in-scope skills.
Write-Host "=== V-2: .cairn/memory appearance check ==="
rg -n "\.cairn/memory" files/skills/resume/SKILL.md files/skills/note/SKILL.md files/skills/reflect/SKILL.md
# Expected: 1+ match per file (3+ total).

# V-3: Out-of-scope files are UNCHANGED.
Write-Host "=== V-3: out-of-scope files unchanged ==="
git diff --name-only
# Expected: ONLY the three in-scope SKILL.md files appear in the diff.
# If files/skills/session-distill/SKILL.md or files/skills/audit/SKILL.md appear, STOP.
# Those files must not have been touched — their vendor-path mentions are NOT memory probes.
# CRITICAL: session-distill's "Session corpus and findings ledger" section is HIVE-owned
# corpus integration (master §2.6); do NOT touch it. Revert session-distill immediately.

# V-4: Diagnostic check — the stub's Gate criterion.
Write-Host "=== V-4: Gate rg — zero vendor-memory probes in skill bodies ==="
rg -c "~/.claude/memory|~/.pi/agent/memory|\.claude/projects/.*memory" files/skills/
# Expected: files/skills/resume/SKILL.md may show a non-zero count IF the fallback-probe
# block mentions the old paths (acceptable — they are LABELLED as fallback/v0.13.x paths,
# not the primary probe). All other in-scope skills: 0.

# V-5: No accidental vendor write targets introduced.
Write-Host "=== V-5: Hard-contract check — no new vendor write targets ==="
rg -n "~/.claude|~/.pi|~/.gemini" files/skills/resume/SKILL.md files/skills/note/SKILL.md files/skills/reflect/SKILL.md | rg -v "Fallback|fallback|migration|v0.13|Antigravity|non-cairn|legacy"
# Expected: 0 matches. Any remaining vendor-path mention must be in a fallback/legacy/
# external-consumer context (labelled), never as a cairn write target.
```

### Commit-message template

```
feat(ws07): repoint skill memory probes to .cairn/memory/

Sweeps the three skill bodies that probed vendor memory paths
(resume, note, reflect) and updates them to reference
<project>/.cairn/memory/ per WS01's layout contract (§2.1).

- resume: primary probe → <cwd>/.cairn/memory/; old Claude Code slug
  paths demoted to labelled fallback block for v0.13.x migrations
- note: reframes the /note-vs-agent-memory contrast from
  "user-space (~/.claude/memory/)" to ".cairn/memory/" — both now
  live in the project repo; distinction is lifecycle, not location
- reflect: adds .cairn/memory/ as the first-class consumer path in
  the distillate naming convention; preserves ~/.gemini/antigravity/
  for non-cairn external consumers

Out of scope (unchanged): session-distill (session-location table,
not memory probe), audit (transcript-location hint), README.

Gate: rg -c "~/.claude/memory|~/.pi/agent/memory" files/skills/
returns 0 for primary-probe sections; .cairn/memory appears in each
touched file. Hard contract: no new vendor write targets introduced.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Archive line

After merge, move this spec to the completed archive:

```powershell
# PowerShell — from repo root
git mv docs/specs/SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS.md docs/specs/archive/SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS.md
```

---

## Executor Handoff

**Read first (in this order):**
1. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §2.1 (`.cairn/` layout contract) and §4 (hard ownership rules) — the contract this WS implements.
2. `docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` — WS01 must be COMPLETE before this WS executes (it defines the `.cairn/memory/` layout that skill bodies reference).
3. `files/skills/resume/SKILL.md` lines 60–90 (the memory probe block), `files/skills/note/SKILL.md` lines 8–11 and 32–63 (the framing sections), `files/skills/reflect/SKILL.md` lines 85–99 (the file-naming convention).

**The one constraint most likely to cause a mistake:**

`session-distill/SKILL.md` has THREE vendor-path lines (lines 83–85) that look like memory probe paths but are NOT — they are a "where do session JSONL files live" table for READING transcripts. Do NOT touch those lines. In addition, `session-distill/SKILL.md` contains a **"Session corpus and findings ledger"** section that must be PRESERVED verbatim — it is HIVE corpus integration (per master §2.6), not a vendor-path probe, and is owned by the HIVE effort across separate repos (`cairn-mcp-server`, `cairn-sessions`). Do not edit, relocate, or delete that section under any circumstances. WS07 scope is strictly `files/skills/resume`, `files/skills/note`, and `files/skills/reflect`. If the Pre-flight V-3 check shows session-distill in the diff, stop and revert immediately.

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| Edit didn't land (old_string not found — file already partially changed) | Read the file first, find current state, adjust old_string to match exactly |
| `~/.gemini/antigravity/memory/` removed from reflect (over-removal) | `git diff files/skills/reflect/SKILL.md` → restore the Antigravity lines; they are an external consumer, not a cairn write target |
| session-distill appears in `git diff --name-only` | `git checkout -- files/skills/session-distill/SKILL.md` immediately; do not commit that file |
| WS01 not yet COMPLETE | Stop here; do not edit skill bodies until the `.cairn/` layout is frozen |

---

## Review Checklist

A fresh peer-reviewer (did NOT author this spec or the edits) checks:

- [ ] `resume/SKILL.md`: primary probe is `<cwd>/.cairn/memory/`; fallback block LABELLED "Fallback probes (v0.13.x)" still mentions old Claude Code slug paths so migration users find their old memory.
- [ ] `resume/SKILL.md`: HANDOFF-aware cross-project pointer example shows an absolute `.cairn/memory/` path, not a vendor slug path.
- [ ] `note/SKILL.md`: frontmatter description no longer says "user-space"; new contrast is `docs/notes/` (ephemeral) vs `.cairn/memory/` (agent-indexed).
- [ ] `note/SKILL.md`: routing table last row updated; "when in doubt" rationale updated for post-WS01 world.
- [ ] `reflect/SKILL.md`: cairn-adopting consumer case (`.cairn/memory/`) appears BEFORE the Antigravity case in the file-naming list.
- [ ] `reflect/SKILL.md`: Antigravity path (`~/.gemini/antigravity/memory/`) is PRESERVED (it is a legitimate external consumer, not a cairn write target).
- [ ] `session-distill/SKILL.md` is UNCHANGED (vendor paths there are session-LOCATION table, not cairn memory probes; the "Session corpus and findings ledger" section is HIVE-owned corpus integration per master §2.6 — must be preserved verbatim).
- [ ] `audit/SKILL.md` is UNCHANGED (the one vendor ref is a transcript-location hint, not a memory probe).
- [ ] `files/skills/README.md` is UNCHANGED (out of scope).
- [ ] `rg -n "\.cairn/memory" files/skills/resume/SKILL.md files/skills/note/SKILL.md files/skills/reflect/SKILL.md` returns 1+ match per file.
- [ ] Hard contract (§4): no step instructed a cairn process to write to any vendor path. Every edit is a SKILL BODY TEXT change only (markdown). No file outside `files/skills/` was touched.
- [ ] `git diff --name-only` shows exactly 3 files: `files/skills/resume/SKILL.md`, `files/skills/note/SKILL.md`, `files/skills/reflect/SKILL.md`.
