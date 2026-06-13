# SPEC_CAIRN_OWNERSHIP_10_DOCS

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01–09, 12 · **Parallel-safe-with:** 09 (Wave 2)

## Goal
Bring all human-facing docs into line with the `.cairn/` + package-distribution model and correct stale claims.

## Scope
- `README.md`: "What you get" → `.cairn/` + package install per harness; tiers/roles language.
- `AGENTS.md`: Layout, Current state, Design DNA → `.cairn/`; **fix env-roles** (Antigravity primary coding, Claude specs/reviews; Pi supported-not-primary); **remove the false `.agents/` alignment** lines.
- `HANDOFF.md`: v0.14.0 state, related paths.
- `docs/research/**`: update the four-layer-habitat descriptions that name vendor paths (`~/.claude/...`) to `.cairn/`.
- Keep the supersede breadcrumb to the old umbrella spec.
- Reflect any WS12 renames (skill names/dirs, manifest entries, package names) in the doc skill listings — the docs must show the post-audit names, not pre-rename ones.

## Telemetry hook
N/A: markdown.

## Diagnostics path
`rg` for stale `~/.claude`/`.agents`-alignment/"Pi … primary executor" across docs → 0.

## Rollback story
`git revert`; docs are non-load-bearing for install.

## Gate
README/AGENTS/HANDOFF/research reflect `.cairn/` + packages + corrected env-roles; no false alignment text; grep clean.

## Files
`README.md`, `AGENTS.md`, `HANDOFF.md`, `docs/research/**`, root `CLAUDE.md` (skill count / pointers).

---

## Pre-flight

Run each command below before touching any file. If an expectation fails, STOP and surface the failure before continuing.

> Shell dialect: **PowerShell** on Windows; adapt path separators to POSIX on Linux/macOS.

**PF-1 — Confirm upstream WSs are complete (or at least their contracts are frozen).**

WS10 depends on 01–09 and 12. At minimum, WS01 (`.cairn/` layout frozen) and WS12 (namespace audit complete — skill names / package names post-rename) must be done before editing doc skill listings. If WS01/12 are not yet marked COMPLETE in the program status table, confirm with the orchestrator which names/paths are contractually frozen; do not invent them.

Expected: program master `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §9.4 table shows WS01 and WS12 as COMPLETE (or orchestrator has confirmed their contracts in writing).

If not met: **STOP. Surface to orchestrator.** Do not begin Phase 1 until the contracts this spec edits against are frozen.

**PF-2 — Baseline: false `.agents/` alignment text exists in target files.**

```powershell
# PowerShell
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" `
  manifest.json AGENTS.md
```

Expected: at least one match (these are the stale strings we are removing). If zero matches, either the work is already done or you are in the wrong worktree — confirm before proceeding.

**PF-3 — Baseline: stale `SPEC_AGENTS_UMBRELLA` "in-flight" pointer exists.**

```powershell
rg -n "SPEC_AGENTS_UMBRELLA" AGENTS.md CLAUDE.md HANDOFF.md
```

Expected: matches in AGENTS.md (Current state block) and CLAUDE.md and HANDOFF.md. These references point at the superseded spec and must be redirected.

**PF-4 — Baseline: stale `<project>/agents/` directory claim exists in AGENTS.md.**

```powershell
rg -n "project>/agents/" AGENTS.md
```

Expected: at least one match (the "In flight as of v0.13.1" block).

**PF-5 — Baseline: vendor-path "What you get" table exists in README.**

```powershell
rg -n "~/.claude/memory|~/.claude/skills|<project>/.claude/LAWS" README.md
```

Expected: matches on lines 87–90 area (the `## What you get` table rows). These rows describe pre-migration install destinations and must be rewritten.

**PF-6 — Baseline: stale env-role claim in AGENTS.md.**

```powershell
rg -n "Claude Code \+ Antigravity are primary authoring" AGENTS.md
```

Expected: one match. The corrected role split is "Antigravity primary coding; Claude Code specs/reviews".

**PF-7 — No `.cairn/` path yet present in the docs being edited (pre-condition for this WS doing the rewrite).**

```powershell
rg -n "\.cairn/" README.md AGENTS.md HANDOFF.md
```

Expected: zero matches. If `.cairn/` already appears, a prior WS touched these files; read AGENTS.md to understand the current state before proceeding.

---

## Phase 1 — Fix `AGENTS.md` stale "In flight" block and false `.agents/` alignment

### STEP 1.1 — Replace the stale "In flight" block in AGENTS.md

**Current state (AGENTS.md lines 36–47 approx):**

```markdown
- **In flight as of v0.13.1:** v0.14.0 architectural shift — pull state out of vendor
  namespaces (`~/.claude/memory/`, `<project>/.claude/`) into a cairn-controlled
  `<project>/agents/` directory. Spec at `docs/specs/SPEC_AGENTS_UMBRELLA.md`
  (untracked at draft). Forced by 2026-05 Claude Code sandbox restrictions on writes
  that combine curl-fetched content + `.claude/*` paths. Skill files stay at
  `~/.claude/skills/` (Claude Code loader requirement). The v0.14 `<project>/agents/`
  path also naturally aligns with Pi's `<project>/.agents/skills/` discovery
  convention — cross-env unification falls out of the move. Read the spec before
  touching `manifest.json`, `adopt.md`, or path conventions.
- **Open design threads:** see `docs/notes/` — in-repo memory tier (v0.14-adjacent),
  `/cairn-introspect` skill candidate (gate at 3+ instances), supervisor pattern
  (deferred), v0.13.0 follow-ups.
```

**Replacement:**

```markdown
- **In flight as of v0.13.1:** v0.14.0 architectural shift (program
  [`SPEC_CAIRN_OWNERSHIP_00_PROGRAM`](docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md))
  — state moves out of vendor namespaces into a cairn-owned
  `<project>/.cairn/` directory; skills distributed as cairn-named packages
  (a `cairn` Claude Code plugin, `@winnorton/cairn-pi` npm, agy via
  `agy plugin import claude`); zero agent writes to any vendor-owned path.
  The superseded `agents/` umbrella draft is retired at
  `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`.
  Read the program master before touching `manifest.json`, `adopt.md`, or
  path conventions.
- **Open design threads:** see `docs/notes/` — in-repo memory tier (addressed
  by v0.14.0 `.cairn/` move), `/cairn-introspect` skill candidate (gate at 3+
  instances), supervisor pattern (deferred), v0.13.0 follow-ups.
```

**Why:** Removes the stale `<project>/agents/` claim, removes the false `.agents/skills` Pi-alignment line, replaces the dead `SPEC_AGENTS_UMBRELLA` pointer with the program master link, and corrects the target directory to `.cairn/`. The open-design-threads bullet is updated to note the memory-tier thread is resolved by v0.14.0.

**File:** `AGENTS.md`

### STEP 1.2 — Fix the env-role claim in AGENTS.md

**Current state (AGENTS.md "Primary environments" block, lines 20–35 approx):**

```markdown
- **Primary environments (3):** Claude Code, Antigravity (Google), and Pi (pi.dev).
  Roles split asymmetrically: **Claude Code + Antigravity are primary authoring
  environments** (where `/spec`, `/program`, `/round-review`, and most cairn skills
  fire). **Pi is the primary executor** for `/spec`- and `/program`-produced
  artifacts — Pi reads a spec and executes phase-by-phase using its own
  `@juicesharp/rpiv-todo` package for compaction-surviving orchestration. Validated
  by Pi session `019eaed6` executing `SPEC_VAST_TERRAIN_P1_05_WORKER_STAGE_RUNNER`
  cleanly with zero cairn skills installed — the cairn `/spec` format is the
  executor contract. Cowork stays in `manifest.json` for backward compat but is
  no longer in the primary triplet. Per-env path resolutions in
  [manifest.json](manifest.json) `pathVariables`. Pi adoption details in
  [adopt.md](adopt.md) Step 3. The six-skill authoring loop (spec, program,
  round-review, fast-execute, peer-review, note) also installs natively in Pi via
  `pi install npm:@winnorton/cairn-pi` — source in `packages/cairn-pi/`, sync'd
  from `files/skills/` with a drift guard (see
  [docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md](docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md)).
```

**Replacement:**

```markdown
- **Primary environments (3):** Claude Code, Antigravity (Google), and Pi (pi.dev).
  Roles split asymmetrically: **Antigravity is the primary coding environment**
  (implementation, broad tool-use, real edit/run cycles). **Claude Code is
  primary for specs and reviews** — `/spec`, `/program`, `/peer-review`, and
  `/round-review` run here; the strong tool-use discipline and spec format make
  it the authoring anchor. **Pi is supported but not primary** — the six-skill
  authoring loop installs natively via
  `pi install npm:@winnorton/cairn-pi` and Pi executes `/spec`- and `/program`-
  produced artifacts cleanly (validated: session `019eaed6`,
  `SPEC_VAST_TERRAIN_P1_05_WORKER_STAGE_RUNNER`, zero cairn skills installed —
  the cairn `/spec` format is the executor contract). Pi adoption details in
  [adopt.md](adopt.md) Step 3; cairn-pi source in `packages/cairn-pi/`, sync'd
  with a drift guard (see
  [docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md](docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md)).
  Cowork stays in `manifest.json` for backward compat but is no longer in the
  primary triplet.
```

**Why:** Corrects env-roles to match program master §5 DoD#8 (Antigravity primary coding, Claude specs/reviews; Pi supported-not-primary). The Pi validation evidence is retained; the role hierarchy is made accurate.

**File:** `AGENTS.md`

**CHECKPOINT after Phase 1:**

```powershell
# Verify false .agents/ alignment text is gone
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" AGENTS.md
# Expected: zero matches

# Verify stale SPEC_AGENTS_UMBRELLA pointer is gone from AGENTS.md
rg -n "SPEC_AGENTS_UMBRELLA" AGENTS.md
# Expected: zero matches (the new text references the program master only)

# Verify .cairn/ appears in the new in-flight block
rg -n "\.cairn/" AGENTS.md
# Expected: at least one match

# Verify env-role correction landed
rg -n "Antigravity is the primary coding" AGENTS.md
# Expected: one match
```

If any check fails: re-read Step 1.1 and 1.2, compare exact indentation, and re-apply. Do not proceed to Phase 2 until all four pass.

---

## Phase 2 — Fix `CLAUDE.md` stale spec pointer

### STEP 2.1 — Replace stale SPEC_AGENTS_UMBRELLA pointer in root CLAUDE.md

**Current state (CLAUDE.md lines 13–15):**

```markdown
- **Latest tag is v0.13.1**; v0.14.0 architectural shift is mid-spec at
  `docs/specs/SPEC_AGENTS_UMBRELLA.md` — read it before touching `manifest.json`,
  `adopt.md`, or path conventions.
```

**Replacement:**

```markdown
- **Latest tag is v0.13.1**; v0.14.0 architectural shift is in-program at
  [`docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`](docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
  — read it before touching `manifest.json`, `adopt.md`, or path conventions.
```

**Why:** The old `SPEC_AGENTS_UMBRELLA.md` is superseded and retired. The live coordination document is the program master. Fresh agents landing in this repo will be pointed at the right place.

**File:** `CLAUDE.md`

**CHECKPOINT after Phase 2:**

```powershell
rg -n "SPEC_AGENTS_UMBRELLA" CLAUDE.md
# Expected: zero matches

rg -n "SPEC_CAIRN_OWNERSHIP_00_PROGRAM" CLAUDE.md
# Expected: one match
```

If any check fails: re-apply Step 2.1.

---

## Phase 3 — Fix `README.md` "What you get" table and "Extend" line

### STEP 3.1 — Replace the "What you get" table

**Current state (README.md, the `## What you get` table, lines 85–91 approx):**

```markdown
## What you get

| File | Purpose |
|---|---|
| `~/.claude/memory/` | Typed memory tree: `user/`, `feedback/`, `project/`, `reference/` — each with its own citation rules and hygiene |
| `<project>/CLAUDE.md` | Project context template — fill in per effort |
| `<project>/.claude/LAWS.md` | Meta-laws + 6 seed laws — your non-negotiables |
| `~/.claude/skills/` | Four categories: **maintenance** (`tour`, `reflect`, `plan`, `prune`, `audit`, `feedback`), **collaboration** (`reframe`, `bridge`, `advocate`), **cross-perspective** (`resume`, `peer-review`, `session-distill`), and **artifact** (`note`, `spec`, `program`, `round-review`, `fast-execute`, `prompt-evolve`) — see [skills taxonomy](#skills-taxonomy) below. Each ships as `<name>/SKILL.md` (canonical Claude Code format). |
```

**Replacement:**

```markdown
## What you get

| Location | Purpose |
|---|---|
| `<project>/.cairn/memory/` | Typed memory tree: `user/`, `feedback/`, `project/`, `reference/` — each with its own citation rules and hygiene |
| `<project>/.cairn/CLAUDE.md` | Cairn-shaped context sections — imported into your project's `CLAUDE.md` or `AGENTS.md` via one user-written import line |
| `<project>/.cairn/LAWS.md` | Meta-laws + seed laws — your non-negotiables |
| Skills via package | Four categories: **maintenance** (`tour`, `reflect`, `plan`, `prune`, `audit`, `feedback`), **collaboration** (`reframe`, `bridge`, `advocate`), **cross-perspective** (`resume`, `peer-review`, `session-distill`), and **artifact** (`note`, `spec`, `program`, `round-review`, `fast-execute`, `prompt-evolve`) — installed via the `cairn` Claude Code plugin, `@winnorton/cairn-pi` (Pi), or `agy plugin import claude` (agy). See [skills taxonomy](#skills-taxonomy). |
```

**Why:** Removes the vendor-path rows (`~/.claude/memory/`, `~/.claude/skills/`, `<project>/.claude/LAWS.md`). Replaces with `.cairn/` destinations (frozen by WS01) and package-install phrasing (frozen by WS02/03/§2.3). The "import line" pointer prepares adopters for the WS02 one-line bridge.

**File:** `README.md`

### STEP 3.2 — Fix the "Extend" → add-a-skill line

**Current state (README.md, the `## Extend` bullet, line 125 approx):**

```markdown
- Add skills by dropping a `.md` file into `~/.claude/skills/` with YAML frontmatter (see [`files/skills/README.md`](./files/skills/README.md)).
```

**Replacement:**

```markdown
- Add skills via the `cairn` Claude Code plugin update or by contributing to `files/skills/` in the cairn source repo (see [`files/skills/README.md`](./files/skills/README.md) for the frontmatter schema). Skills reach your harness through the package, not by hand-dropping files.
```

**Why:** The old instruction told users to write directly into `~/.claude/skills/`, which is a vendor path and violates `[LAW own-your-namespace]`. The corrected instruction directs to the package / source contribution path.

**File:** `README.md`

**CHECKPOINT after Phase 3:**

```powershell
# Verify vendor-path rows gone from What you get table
rg -n "~/.claude/memory/|~/.claude/skills/|<project>/.claude/LAWS" README.md
# Expected: only historical mentions in the ## Status section (changelog), not in the table

# Verify .cairn/ rows present
rg -n "\.cairn/memory|\.cairn/CLAUDE|\.cairn/LAWS" README.md
# Expected: at least 3 matches (the new table rows)

# Verify Extend line updated
rg -n "~/.claude/skills" README.md
# Expected: zero matches outside the ## Status changelog
```

Note: the `## Status` section of README.md contains historical changelog entries that mention `~/.claude/skills/` as part of release notes (e.g. "Skill format migration to canonical `~/.claude/skills/<name>/SKILL.md`"). These are historical records — do **not** edit changelog entries. The grep above will match them; exclude changelog lines (below `## Status`) manually when assessing pass/fail.

If any non-changelog match remains: re-apply Steps 3.1 and 3.2.

---

## Phase 4 — Fix `HANDOFF.md` stale "In flight" and v0.14 references

### STEP 4.1 — Update the HANDOFF.md intro meta-block

**Current state (HANDOFF.md, the `>` block at lines 9–11):**

```markdown
> **Repo-root entry point (canonical, added 2026-06):** read [AGENTS.md](AGENTS.md) at
> the repo root. It's the cairn-itself agent context — layout, 15 skills, key laws by
> slug, design DNA, current state (v0.13.1 + v0.14.0 in flight). Claude Code auto-loads
> [CLAUDE.md](CLAUDE.md), which points at AGENTS.md. If you're a fresh agent landing
> in this repo, AGENTS.md is the orientation you want before anything else.
```

**Replacement:**

```markdown
> **Repo-root entry point (canonical, added 2026-06):** read [AGENTS.md](AGENTS.md) at
> the repo root. It's the cairn-itself agent context — layout, 18 skills, key laws by
> slug, design DNA, current state (v0.13.1, v0.14.0 in-program). Claude Code auto-loads
> [CLAUDE.md](CLAUDE.md), which points at AGENTS.md. If you're a fresh agent landing
> in this repo, AGENTS.md is the orientation you want before anything else.
```

**Why:** The "15 skills" claim is stale (actual count is 18 per `files/skills/` directory). "v0.14.0 in flight" is updated to "v0.14.0 in-program" to reflect the program shape.

**File:** `HANDOFF.md`

### STEP 4.2 — Update the "v0.14.0 spec drafted" interim-work bullet in HANDOFF.md

**Current state (HANDOFF.md, "Interim work" section, lines 83–90 approx):**

```markdown
- **v0.14.0 spec drafted** at `docs/specs/SPEC_AGENTS_UMBRELLA.md` (untracked at this
  write). Promoted via `/spec --from` from `NOTE_AGENTS_UMBRELLA_2026-04-30.md`
  (now at `docs/notes/_promoted/`). Major architectural shift: state moves out of
  vendor namespaces (`~/.claude/memory/`, `<project>/.claude/`) into a cairn-controlled
  `<project>/agents/` directory at the project root. Forced by 2026-05 Claude Code
  sandbox restrictions on writes combining curl-fetched content + `.claude/*` paths.
  Skill files stay at `~/.claude/skills/` (loader requirement). Read the spec before
  touching `manifest.json`, `adopt.md`, or path conventions.
```

**Replacement:**

```markdown
- **v0.14.0 promoted to program** — the old `SPEC_AGENTS_UMBRELLA.md` umbrella draft
  (premise: `agents/` directory, forced by a 2026-05 sandbox restriction) was
  superseded and retired to `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`. Replaced
  by program
  [`SPEC_CAIRN_OWNERSHIP_00_PROGRAM`](docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
  (12 workstreams). Governing law: `[LAW own-your-namespace]`. State moves to
  `<project>/.cairn/`; skills distribute as cairn-named packages. Read the program
  master before touching `manifest.json`, `adopt.md`, or path conventions.
```

**Why:** The stale "in-flight spec" pointer and the `<project>/agents/` directory claim are removed. The correct target dir (`.cairn/`) and the program master are substituted. The note that this was forced by a vendor sandbox restriction (which is now "uncertain/transient" per program §3) is dropped in favor of the durable `[LAW own-your-namespace]` rationale.

**File:** `HANDOFF.md`

### STEP 4.3 — Update HANDOFF.md "For the next agent" v0.14.0 pointer

**Current state (HANDOFF.md "For the next agent" block, lines 286–289 approx):**

```markdown
- **If the next topic is v0.14.0**, read `docs/specs/SPEC_AGENTS_UMBRELLA.md` (the
  in-flight spec) and the promoted breadcrumb at
  `docs/notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md`. The spec extends a parked
  prototype at commit `345241a`.
```

**Replacement:**

```markdown
- **If the next topic is v0.14.0**, read the program master at
  `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` (12 workstreams, 0 deferrals)
  and the program §9.4 status table for current execution state. The old umbrella
  draft is retired at `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`.
```

**Why:** Redirects from the dead spec to the live program master. The "parked prototype" commit reference (`345241a`) was specific to the old `agents/` premise and is no longer the anchor.

**File:** `HANDOFF.md`

### STEP 4.4 — Update the HANDOFF.md last-updated footer

**Current state (HANDOFF.md final lines):**

```markdown
_Originally written 2026-04-24 at session's end by the builder agent. Last updated
2026-06-09 for the interim work since v0.13.1 (notes filed, v0.14.0 spec drafted,
`/program` enhancements, repo-root AGENTS.md + CLAUDE.md added, skill-catalog drift
swept). Next refresh: at v0.14.0 tag time per [LAW handoff-stays-current]._
```

**Replacement:**

```markdown
_Originally written 2026-04-24 at session's end by the builder agent. Last updated
2026-06-13 for the SPEC_CAIRN_OWNERSHIP program (WS10 docs update): `.cairn/` state
model, corrected env-roles, removed false `.agents/` alignment text, redirected
v0.14.0 pointer to program master. Next refresh: at v0.14.0 tag time per
[LAW handoff-stays-current]._
```

**Why:** Keeps `[LAW handoff-stays-current]` honest — the footer must reflect the last real update date and reason.

**File:** `HANDOFF.md`

**CHECKPOINT after Phase 4:**

```powershell
# Verify dead spec pointer gone from HANDOFF
rg -n "SPEC_AGENTS_UMBRELLA" HANDOFF.md
# Expected: zero matches (all references now point at program master or the _promoted/ archive path)

# Verify .cairn/ present in the new in-flight bullet
rg -n "\.cairn/" HANDOFF.md
# Expected: at least one match

# Verify skill count corrected in the meta-block
rg -n "15 skills" HANDOFF.md
# Expected: zero matches

# Verify program master link present
rg -n "SPEC_CAIRN_OWNERSHIP_00_PROGRAM" HANDOFF.md
# Expected: at least two matches (the updated bullets)
```

If any check fails: re-apply the relevant step.

---

## Phase 5 — Update `docs/research/**` four-layer-habitat descriptions

> **Constraint (critical):** the research papers are historical snapshots — "why" archives, not living docs. Do NOT rewrite analysis, findings, evidence tables, or method notes. Only update forward-pointing descriptions of the current habitat layout where they name `~/.claude/...` or `<project>/.claude/` paths as the *destination* going forward. Historical evidence citations (e.g. "Gemini mapped `{userMemory}` → `~/.gemini/antigravity/memory/`") are historical facts — leave them as-is.

Run this to count affected lines first (programmatic, not a frozen list):

```powershell
rg -rn "~/.claude/memory|~/.claude/skills|<project>/.claude|~/.gemini/antigravity/memory" docs/research/
```

As of elaboration, the relevant occurrences fall into two categories:

**Category A — Forward-looking habitat layout descriptions** (update these): Any sentence framing the *current/designed* destination of cairn state, such as "Memory lives at `~/.claude/...`" in a description of how cairn currently works.

**Category B — Historical evidence** (leave these intact): Any row in an evidence table, quote, or inline citation describing what a specific agent *actually did* in a past test session (e.g. habitat-transfer.md's table row `| {userMemory} | ~/.claude/projects/<slug>/memory/ | ~/.gemini/antigravity/memory/ |`).

### STEP 5.1 — `docs/research/agentic-habitat.md`: no forward-looking vendor paths found

After reviewing this file, the `~/.gemini/antigravity/memory/` reference at line 47 is historical evidence of Gemini's cross-platform path adaptation — Category B. Leave it as-is.

**No edit required.** (Verify with `rg -n "~/.claude" docs/research/agentic-habitat.md` — expected zero matches; the file uses `{userMemory}` variable notation, not literal paths.)

**File:** `docs/research/agentic-habitat.md`

### STEP 5.2 — `docs/research/habitat-transfer.md`: evidence table and section 3.3 — historical, leave intact

The path table in section 3.3 and the `~/.claude/projects/<slug>/memory/` reference are cross-platform test evidence (Category B). These document what happened during a specific test session, not what cairn's current install destination is.

**No edit required.**

**File:** `docs/research/habitat-transfer.md`

### STEP 5.3 — `docs/research/distillate-to-production.md`: historical arc — leave intact

The `~/.gemini/antigravity/memory/` references in the diagram and evidence table describe the actual 2026-04-25 arc step-by-step (Category B). The `.agents/workflows/` reference in Step 4 is also historical ("cairn adoption commit cwar-engine: workflows installed in .agents/workflows/") — this is a cwar-side artifact, not cairn's own install dest.

**No edit required.**

**File:** `docs/research/distillate-to-production.md`

### STEP 5.4 — `docs/research/collaboration-skills.md`: one forward-facing phrasing to annotate

Locate the sentence (approx line 179):

```
More striking: Gemini Pro 3.1 adapted cairn's entire path variable system to Antigravity's
conventions (`{userMemory}` → `~/.gemini/antigravity/memory/`) without being told how.
```

This is historical evidence (Category B) — it describes what Gemini did in a test. Leave it intact.

**No edit required.**

**File:** `docs/research/collaboration-skills.md`

### STEP 5.5 — `docs/research/open-questions.md`: historical finding — leave intact

The `~/.gemini/antigravity/memory/` reference documents the cross-platform path-adaptation finding. Category B.

**No edit required.**

**File:** `docs/research/open-questions.md`

> **Research summary:** After programmatic review, the research docs' vendor-path mentions are ALL Category B (historical evidence). No forward-looking descriptions require update. The "update the four-layer-habitat descriptions" scope item is satisfied by this determination — the papers describe the state at the time of observation, which is correct for archival research docs. If WS12 renames a skill that appears in a research doc's forward-looking "current skills" sentence, that sentence would need updating; confirm with WS12 output.

**CHECKPOINT after Phase 5:**

```powershell
# Confirm no unreviewed forward-looking vendor-path edits needed
# (This grep will return results, but they should all be historical evidence lines)
rg -rn "~/.claude/memory|~/.gemini/antigravity/memory" docs/research/
# Review each hit: confirm it is a historical evidence citation, not a forward-facing statement
# Expected: all hits are in evidence tables, arc diagrams, or past-test descriptions
```

---

## Phase 6 — Reflect WS12 skill renames in doc skill listings

> **Dependency:** This phase cannot be executed until WS12 (namespace audit) is COMPLETE and any skill/package renames are finalized. If WS12 is not yet complete, leave a placeholder comment and return.

### STEP 6.1 — Check for WS12-driven renames and update doc listings

Run:

```powershell
# Check if WS12 produced any renames by reading its spec or output
# (Adjust path if WS12 spec is in a different location)
rg -n "rename|collision" docs/specs/SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md | head -20
```

The skill listings appear in three places:
- `README.md` `## Skills taxonomy` section
- `AGENTS.md` `## Skills defined by this project (18)` section
- `CLAUDE.md` skill count bullet ("18 skills")

If WS12 produced renames, apply them to all three locations. Each rename is ONE edit per file.

**If WS12 produced zero renames:** no action needed for this phase. Confirm with:

```powershell
# The DoD#8 grep — should return zero if WS12 and WS06 cleaned manifest
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json AGENTS.md
# Expected: zero
```

**File(s):** `README.md`, `AGENTS.md`, `CLAUDE.md` (only if renames exist from WS12)

**CHECKPOINT after Phase 6:**

```powershell
# Run DoD#8 verification (program master §5)
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json AGENTS.md
# Expected: zero matches — this is the hard DoD gate
```

---

## Post-flight

Run all verifications. Every item must pass before committing.

**V-1 — DoD #8 grep (program master §5, exact command):**

```powershell
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json AGENTS.md
# Expected: zero matches
```

**V-2 — Dead spec pointer gone from all edited files:**

```powershell
rg -rn "SPEC_AGENTS_UMBRELLA" README.md AGENTS.md CLAUDE.md HANDOFF.md
# Expected: zero matches
# (The superseded spec lives at docs/specs/_promoted/ — not these files)
```

**V-3 — `.cairn/` path present in all primary docs:**

```powershell
rg -n "\.cairn/" README.md AGENTS.md HANDOFF.md CLAUDE.md
# Expected: matches in README.md (What you get table), AGENTS.md (in-flight block), HANDOFF.md (in-flight bullet)
```

**V-4 — Env-role correction landed:**

```powershell
rg -n "Antigravity is the primary coding" AGENTS.md
# Expected: one match

rg -n "Claude Code.*primary.*spec|primary.*spec.*Claude Code" AGENTS.md
# Expected: one match
```

**V-5 — Vendor-path rows absent from README "What you get" table:**

```powershell
rg -n "~/.claude/memory/|~/.claude/skills/" README.md
# Expected: matches only in ## Status changelog section (historical), zero in the ## What you get table
# Manually inspect any match to confirm it is in changelog context
```

**V-6 — No forbidden vendor-path writes introduced (§4 check):**

```powershell
rg -n "~/.claude|~/.gemini|~/.pi" README.md AGENTS.md CLAUDE.md HANDOFF.md |
  rg -v "migration-ref"
# Expected: only historical changelog lines in README.md ## Status,
# memory path references in HANDOFF.md (those are user's own paths, not cairn write targets),
# and research doc evidence lines — zero "cairn will write to" forward-facing statements
```

**V-7 — Skill count consistent:**

```powershell
# Count actual skill directories
(Get-ChildItem "files/skills" -Directory | Measure-Object).Count
# Expected: 18

rg -n "18 skills|Skills defined.*\(18\)" AGENTS.md CLAUDE.md
# Expected: matches confirming 18 in both files
```

**Commit message template:**

```
docs(ownership): WS10 — update README/AGENTS/HANDOFF/CLAUDE.md to .cairn/ model

- README "What you get" table: vendor-path rows → .cairn/ + package-install rows
- AGENTS.md: correct env-roles (Antigravity primary coding, Claude specs/reviews;
  Pi supported-not-primary); replace stale agents/-umbrella "in-flight" block with
  .cairn/ + program master pointer; remove false .agents/skills Pi-alignment line
- CLAUDE.md: replace dead SPEC_AGENTS_UMBRELLA pointer with program master link
- HANDOFF.md: retire SPEC_AGENTS_UMBRELLA references; update v0.14 interim-work
  bullet and "For the next agent" pointer; correct skill count (15→18)
- docs/research/**:  no forward-facing vendor-path descriptions found; all
  path mentions are historical evidence (left intact)

[LAW own-your-namespace] — docs now reflect the cairn-owned .cairn/ model
DoD #8 grep: rg "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json AGENTS.md → zero
```

**Archive move (do after peer-review passes):**

```powershell
# PowerShell — run from repo root
git mv docs/specs/SPEC_CAIRN_OWNERSHIP_10_DOCS.md `
       docs/specs/archive/SPEC_CAIRN_OWNERSHIP_10_DOCS.md
```

---

## Executor Handoff

**Read first (in order):**
1. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` — §2 (contracts), §4 (hard contract), §5 DoD#8.
2. `AGENTS.md` — current state block (lines 18–47) to understand the full scope of stale text before editing.
3. `docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` — frozen `.cairn/` layout that Phase 3 edits must match exactly (table paths come from this spec).

**One constraint most likely to cause a mistake:**

The research docs (`docs/research/`) contain many `~/.claude/...` and `~/.gemini/...` strings. ALL of them are historical evidence citations — do not edit them. The instinct to "clean up vendor paths everywhere" will break accurate historical records. Only the four primary docs (README, AGENTS, CLAUDE, HANDOFF) have forward-facing claims that need updating.

**Recovery for common failures:**

- *"rg finds SPEC_AGENTS_UMBRELLA in docs after my edits"* — You likely missed HANDOFF.md Step 4.3 or CLAUDE.md Step 2.1. Re-run the individual step.
- *"DoD#8 grep still returns matches after Phase 1"* — The `.agents/skills` string is in `manifest.json` too (WS06 owns that file). WS10 owns AGENTS.md only. If manifest.json still has the string, that is WS06's scope, not WS10's. Confirm with orchestrator.
- *"Phase 6 WS12 renames are unknown"* — Leave a `<!-- WS12-PENDING -->` comment in the skill listing sections and note the dependency in the commit message. Do not block this WS on WS12 if the renames are only cosmetic label changes.
- *"'What you get' table paths don't match WS01 layout"* — WS01 is the authority. Read `SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` §2.1 and align the README table to those exact paths.

---

## Review Checklist

A fresh reviewer (not the executor) should verify:

- [ ] `README.md` "What you get" table has no `~/.claude/` or `~/.gemini/` rows — only `.cairn/` destinations and package-install descriptions.
- [ ] `README.md` "Extend" bullet no longer instructs users to hand-drop files into `~/.claude/skills/`.
- [ ] `AGENTS.md` "In flight" block names `.cairn/` and the program master; no mention of `<project>/agents/` or `<project>/.agents/`.
- [ ] `AGENTS.md` env-role block correctly names Antigravity as primary coding and Claude Code as primary for specs/reviews; Pi as supported-not-primary.
- [ ] `AGENTS.md` has zero matches for `v0.14-note`, `v0.14.0-aligned`, `.agents/skills`.
- [ ] `CLAUDE.md` "In flight" bullet links to program master, not old umbrella spec.
- [ ] `HANDOFF.md` "For the next agent" v0.14 pointer references program master.
- [ ] `HANDOFF.md` skill count in meta-block reads 18, not 15.
- [ ] `HANDOFF.md` "last updated" footer shows 2026-06-13 and WS10 reason.
- [ ] Research docs: spot-check two files — confirm `~/.gemini/antigravity/memory/` references are in evidence tables, not forward-facing descriptions.
- [ ] DoD#8 grep returns zero: `rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json AGENTS.md`
- [ ] No step introduced a write to `~/.claude`, `~/.gemini`, `~/.pi`, `.claude/`, or `.agents/` (the §4 forbidden targets).
- [ ] WS12 renames (if any) are reflected in all three skill-listing locations (README taxonomy, AGENTS.md list, CLAUDE.md count).
