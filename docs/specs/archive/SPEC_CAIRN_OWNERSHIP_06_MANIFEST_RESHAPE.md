# SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 04, 05, 07, 11

## Goal
Reshape `manifest.json` so it describes `.cairn/` state dests and references packages for skills, retiring vendor-path variables.

## Scope
- State file dests → `{projectRoot}/.cairn/...` (CLAUDE.md, LAWS.md, memory tree).
- Drop the `userMemory` pathVariable entirely (incl. its later-added Pi sub-block).
- Skills: reference the distribution packages (cairn-claude plugin / cairn-pi npm) rather than per-skill curl dests — OR mark skills as package-delivered.
- Update `description`, `version` (target 0.14.0), and the `.agents`/`agents` notes (remove the false alignment text).
- Keep JSON valid; `{projectRoot}` resolves per-harness.

## Telemetry hook
N/A: markdown/JSON.

## Diagnostics path
`node -e "JSON.parse(...)"` validates; a grep confirms zero `userMemory`/vendor-dir dests remain.

## Rollback story
`git revert`; manifest is read at adopt-time only.

## Gate
`manifest.json` validates; no `userMemory`; state dests under `.cairn/`; skill entries reference packages; version bumped; the false `.agents/` alignment text is gone — `rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json` returns zero (master §5 DoD#8).

## Files
`manifest.json`.

---

## Pre-flight

Shell dialect for all commands in this spec: **PowerShell** (the repo host is Windows 11 / PowerShell 7+). POSIX alternatives are noted where trivial.

Run these commands before touching any file. If any expectation fails, **STOP — do not proceed to Phase 1**; surface the discrepancy and ask for guidance.

```powershell
# PF-1: confirm you are in the correct repo root
git -C C:\Users\winno\projects\cairn\cairn rev-parse --show-toplevel
# Expected: C:/Users/winno/projects/cairn/cairn (or Windows-normalized equivalent)

# PF-2: confirm manifest.json exists and is valid JSON
node -e "JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')); console.log('valid')"
# Expected output: valid

# PF-3: confirm current version string
node -e "const m=JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')); console.log(m.version)"
# Expected: 0.13.1

# PF-4: confirm the false-alignment strings are present (so removal has something to remove)
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern 'v0\.14-note|v0\.14\.0-aligned|\.agents/skills'
# Expected: at least 3 matches (lines 42, 44, 52 in current file)

# PF-5: confirm userMemory pathVariable is present (so deletion has something to delete)
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '"userMemory"'
# Expected: at least 1 match

# PF-6: confirm working tree is clean on manifest.json (no prior partial edits)
git -C C:\Users\winno\projects\cairn\cairn diff -- manifest.json
# Expected: empty output (no diff)
```

---

## Phase 1 — Bump version and update description

**Goal:** update the two top-level metadata fields that describe the overall manifest. These are non-structural changes; validate JSON shape after each phase.

### Step 1.1 — Bump `version` from `0.13.1` to `0.14.0`

**CURRENT** (line 3 of `manifest.json`):
```json
  "version": "0.13.1",
```

**REPLACEMENT**:
```json
  "version": "0.14.0",
```

**WHY:** WS06 is part of the v0.14.0 program (master §5 DoD#9 requires `VERSION` bump at program close; the manifest version must track).

### Step 1.2 — Update `description` to reflect `.cairn/` model

**CURRENT** (line 5 of `manifest.json`):
```json
  "description": "Portable agent environment bootstrap — memory, laws, skills, context templates. Works in Claude Code, Antigravity, and Pi (pi.dev). Domain-agnostic. Graduated adoption via tiers.",
```

**REPLACEMENT**:
```json
  "description": "Portable agent environment bootstrap — memory, laws, skills, context templates. Works in Claude Code (cairn plugin), Antigravity, and Pi (pi.dev/@winnorton/cairn-pi). State lives in <project>/.cairn/; skills distributed as cairn-named packages. Domain-agnostic. Graduated adoption via tiers.",
```

**WHY:** The description should signal the new distribution model (plugin, npm package) and the `.cairn/` state location, so readers of the raw manifest immediately understand the v0.14 shape.

**CHECKPOINT after Phase 1:**
```powershell
node -e "const m=JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')); console.log(m.version, '|', m.description.slice(0,40))"
# Expected: 0.14.0 | Portable agent environment bootstrap — me
```
If JSON parse fails: the edit introduced a syntax error — revert the edit with `git checkout -- manifest.json` and re-apply carefully (verify comma placement).

---

## Phase 2 — Reshape `pathVariables`: drop vendor-path variables, keep `projectRoot`

**Goal:** remove `userClaude`, `userMemory`, `userSkills`, and the vendor-path entries from `projectClaude`; update `projectClaude` to point at `.cairn/`; add `cairnRoot` as the canonical cairn-state path variable. The `projectRoot` entry is unchanged.

**WHY the whole block:** every `{userMemory}`, `{userSkills}`, and `{userClaude}` dest in the `files` array references variables defined here. Removing the variables without updating `files` would leave dangling references. Phase 2 is therefore always followed by Phase 3 (dest rewrite) before the JSON is shipped. The checkpoint after Phase 3 validates the combined result.

### Step 2.1 — Replace the entire `pathVariables` block

**CURRENT** (`manifest.json` lines 9–61, the full `"pathVariables": { ... }` object):
```json
  "pathVariables": {
    "userClaude": {
      "description": "User-global agent config directory (env-agnostic name; root for agent-installed content)",
      "claude-code": "~/.claude",
      "pi": "~/.pi/agent",
      "cowork": "probe: workspace-level .claude/ or equivalent user-scoped config; ask user if uncertain"
    },
    "userMemory": {
      "description": "Persistent cross-session memory root. Claude Code has TWO conventions — detect which one this session uses before resolving. Wrong path = silent-failure install (files land where the agent never reads).",
      "claude-code": {
        "user-global": "~/.claude/memory",
        "project-scoped": "~/.claude/projects/<project-slug>/memory",
        "note": "<project-slug> is the project's absolute path with slashes/colons replaced by hyphens (e.g. C:\\Users\\winno\\projects\\foo -> C--Users-winno-projects-foo).",
        "resolution": "See adopt.md Step 1: probe filesystem for existing memory, or check system-prompt directives, or ask user. Do not default blindly."
      },
      "pi": {
        "user-global": "~/.pi/agent/memory",
        "project-scoped": "~/.pi/agent/projects-memory/<projectname>/memory",
        "note": "<projectname> is typically the project root directory basename. Pi's pi-hermes-memory package uses a separate SQLite-backed store; cairn typed-markdown memory lands here independently and does NOT compete with pi-hermes-memory. The directory may not exist until first install — create on demand.",
        "resolution": "See adopt.md Step 1: probe for ~/.pi/agent/ marker. Default to user-global unless system-prompt or filesystem signal indicates project-scoped use."
      },
      "cowork": "{userClaude}/memory"
    },
    "userSkills": {
      "description": "Skill directory. Claude Code and Pi have TWO conventions each (same pattern as userMemory) — detect which this session uses before resolving. Wrong path = silent-failure install (skills land where the agent never loads them). v0.12+ ships skills as subdirs containing SKILL.md — canonical for both Claude Code AND Pi, which use the identical format.",
      "claude-code": {
        "user-global": "~/.claude/skills",
        "project-scoped": "<project>/.claude/skills",
        "resolution": "See adopt.md Step 1: probe filesystem for existing skills, or check session conventions, or ask user. Do not default blindly."
      },
      "pi": {
        "user-global": "~/.pi/agent/skills",
        "project-scoped": "<project>/.pi/skills",
        "alternative-project": "<project>/.agents/skills",
        "format-note": "Identical to Claude Code: subdir + SKILL.md with YAML frontmatter (name <=64 chars lowercase+hyphens, description <=1024 chars, optional license/compatibility/metadata/allowed-tools). Pi invokes as /skill:<name>; Claude Code invokes as /<name>.",
        "v0.14-note": "<project>/.agents/skills/ aligns with cairn's v0.14.0 <project>/agents/ umbrella — Pi loader auto-discovers both .pi/ and .agents/ paths.",
        "resolution": "See adopt.md Step 1: probe for ~/.pi/agent/ marker. Default to user-global unless project work specifically benefits from project-scoped install."
      },
      "cowork": "{userClaude}/skills"
    },
    "projectClaude": {
      "description": "Project-scoped agent config (applies to current work effort only)",
      "claude-code": "{cwd}/.claude",
      "pi": "{cwd}/.pi (primary) OR {cwd}/.agents (v0.14.0-aligned alternative; Pi loader recognizes both)",
      "cowork": "{workspaceRoot}/.claude"
    },
    "projectRoot": {
      "description": "Root of the current work effort",
      "claude-code": "{cwd}",
      "pi": "{cwd}",
      "cowork": "{workspaceRoot}"
    }
  },
```

**REPLACEMENT**:
```json
  "pathVariables": {
    "projectRoot": {
      "description": "Root of the current work effort. The anchor for all cairn-state paths.",
      "claude-code": "{cwd}",
      "pi": "{cwd}",
      "cowork": "{workspaceRoot}"
    },
    "cairnRoot": {
      "description": "Cairn-owned state directory — the only directory cairn writes to inside an adopter project. Everything cairn installs lives here: CLAUDE.md context, LAWS.md, memory tree, cairn-version marker. Git-tracked inside the adopter's repo. No vendor path (~/.claude, ~/.pi, ~/.gemini, .agents/) is ever a cairn write target.",
      "all-harnesses": "{projectRoot}/.cairn"
    }
  },
```

**WHY:**
- `userClaude`, `userMemory`, `userSkills` are vendor-path variables — their removal is the core of this workstream (master §2.5, §4 hard contract).
- `projectClaude` described `.claude/` and `.agents/` (vendor-owned dirs) — replaced by `cairnRoot` which names the cairn-owned dir.
- `userSkills` carried the false `v0.14-note` and `alternative-project` strings naming `.agents/skills/` — removing the whole variable eliminates those (master §5 DoD#8: `rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json` must return zero).
- `projectRoot` is kept unchanged (it is already used for the `files/CLAUDE.md` dest and is the anchor variable for `{cairnRoot}`).
- `cairnRoot` is added as the single, unambiguous variable for all cairn state paths, consistent with §2.1 layout.

---

## Phase 3 — Rewrite `files` entries: state dests to `.cairn/`, skills to package-delivered

**Goal:** every `"dest"` in the `files` array must either (a) point to `{projectRoot}/.cairn/...` for state files, or (b) be replaced with a `"package"` delivery descriptor for skill files. No `{userMemory}`, `{userSkills}`, `{projectClaude}`, or `{projectRoot}/CLAUDE.md` references survive. (`{projectRoot}/CLAUDE.md` is fully user-owned — the manifest carries no such entry per master §2.1/§3.)

The current file has:
- 5 entries → `{userMemory}/...` (rewrite to `{projectRoot}/.cairn/memory/...`)
- 1 entry → `{projectClaude}/LAWS.md` (rewrite to `{projectRoot}/.cairn/LAWS.md`)
- 18 SKILL.md entries + the skills/README.md = 19 package-delivered entries → `{userSkills}/...` (convert to package-delivered descriptors)

**Total `"files"` entries: 26 (verified by `rg -c '"dest"' manifest.json` = 26). After reshape: 6 state entries with `.cairn/` dests + 19 package-delivered skill entries + 1 dropped (CLAUDE.md) = 25 remaining entries.**

### Step 3.1 — Rewrite MEMORY.md dest

**CURRENT**:
```json
    {
      "src": "files/memory/MEMORY.md",
      "dest": "{userMemory}/MEMORY.md",
      "mode": "create-if-absent",
      "role": "essential",
      "tier": "seed",
      "description": "Top-level memory index — the lookup entry point for all memory"
    },
```

**REPLACEMENT**:
```json
    {
      "src": "files/.cairn/memory/MEMORY.md",
      "dest": "{projectRoot}/.cairn/memory/MEMORY.md",
      "mode": "create-if-absent",
      "role": "essential",
      "tier": "seed",
      "description": "Top-level memory index — the lookup entry point for all memory"
    },
```

**WHY:** Memory is project-local cairn state, lives under `{projectRoot}/.cairn/memory/` per §2.1. The `src` must point to `files/.cairn/memory/MEMORY.md` because WS01 moved the template tree there; a stale `src` causes WS08's fetch to 404 (master §2.5).

### Step 3.2 — Rewrite LAWS.md dest

**CURRENT**:
```json
    {
      "src": "files/LAWS.md",
      "dest": "{projectClaude}/LAWS.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "grow",
      "description": "Meta-laws (the schema) + 6 seed laws. The shape is load-bearing; the seeds are scaffolding — replace with your own laws over time."
    },
```

**REPLACEMENT**:
```json
    {
      "src": "files/.cairn/LAWS.md",
      "dest": "{projectRoot}/.cairn/LAWS.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "grow",
      "description": "Meta-laws (the schema) + 6 seed laws. The shape is load-bearing; the seeds are scaffolding — replace with your own laws over time."
    },
```

**WHY:** LAWS.md is cairn-owned project state; `{projectClaude}` pointed at `.claude/` (vendor-owned). Now lives in `{projectRoot}/.cairn/` per §2.1. The `src` must be `files/.cairn/LAWS.md` because WS01 moved the template there; a stale `src` causes WS08's fetch to 404 (master §2.5).

### Step 3.3 — Rewrite typed-memory README dests (4 entries)

These four entries all follow the same pattern: `src` from `files/memory/<type>/README.md` → `files/.cairn/memory/<type>/README.md`; `dest` from `{userMemory}/<type>/README.md` → `{projectRoot}/.cairn/memory/<type>/README.md`. Both `src` and `dest` must be updated in lockstep.

**CURRENT** (4 entries — apply the same substitution pattern to each):
```json
    {
      "src": "files/memory/user/README.md",
      "dest": "{userMemory}/user/README.md",
      ...
    },
    {
      "src": "files/memory/feedback/README.md",
      "dest": "{userMemory}/feedback/README.md",
      ...
    },
    {
      "src": "files/memory/project/README.md",
      "dest": "{userMemory}/project/README.md",
      ...
    },
    {
      "src": "files/memory/reference/README.md",
      "dest": "{userMemory}/reference/README.md",
      ...
    },
```

**REPLACEMENT** (same descriptions; both `src` and `dest` updated):
```json
    {
      "src": "files/.cairn/memory/user/README.md",
      "dest": "{projectRoot}/.cairn/memory/user/README.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "structure",
      "description": "User memory conventions — always-on background, no citation"
    },
    {
      "src": "files/.cairn/memory/feedback/README.md",
      "dest": "{projectRoot}/.cairn/memory/feedback/README.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "structure",
      "description": "Feedback memory conventions — fires discretely, cite [MEM feedback/<name>]"
    },
    {
      "src": "files/.cairn/memory/project/README.md",
      "dest": "{projectRoot}/.cairn/memory/project/README.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "structure",
      "description": "Project memory conventions — decision-shaping, cite [MEM project/<name>]"
    },
    {
      "src": "files/.cairn/memory/reference/README.md",
      "dest": "{projectRoot}/.cairn/memory/reference/README.md",
      "mode": "create-if-absent",
      "role": "scaffolding",
      "tier": "structure",
      "description": "Reference memory conventions — episodic lookups, cite [MEM reference/<name>]"
    },
```

**WHY:** Typed memory subdirs are cairn state, co-located with MEMORY.md under `{projectRoot}/.cairn/memory/` per §2.1. The `src` paths must point to `files/.cairn/memory/<type>/README.md` because WS01 moved the template tree there; a stale `src` causes WS08's fetch to 404 (master §2.5).

### Step 3.4 — Convert all 19 skill entries to package-delivered descriptors

**WHY:** Skills are no longer hand-curled into vendor skill dirs. They are distributed as cairn-named packages (`cairn` Claude Code plugin; `@winnorton/cairn-pi` npm package) installed by the vendor's own tooling. The `files` array must reflect this: no `"dest"` pointing to `{userSkills}/...`, because WS08 (`adopt.md` rewrite) reads this manifest to determine what to install (master §2.5; §4 hard contract rule 2).

The `src` stays (it is the single source of truth per §2.4). The `dest` field is replaced by a `"delivery"` object. The skills README (`files/skills/README.md`) is bundled inside the packages, not written to a skills dir.

**CURRENT** (representative entry — apply same transform to all 19):
```json
    {
      "src": "files/skills/reflect/SKILL.md",
      "dest": "{userSkills}/reflect/SKILL.md",
      "mode": "create-if-absent",
      "role": "optional",
      "tier": "grow",
      "description": "Reflective check-in — standardizes something capable agents do anyway"
    },
```

**REPLACEMENT pattern** (same `src`, `role`, `tier`, `description`; remove `dest` + `mode`; add `delivery`):
```json
    {
      "src": "files/skills/reflect/SKILL.md",
      "delivery": {
        "method": "package",
        "claude-code": "cairn (Claude Code plugin)",
        "pi": "@winnorton/cairn-pi (npm)",
        "agy": "agy plugin import claude (imports the cairn Claude Code plugin)"
      },
      "role": "optional",
      "tier": "grow",
      "description": "Reflective check-in — standardizes something capable agents do anyway"
    },
```

Apply this pattern to all 19 package-delivered entries: **18 SKILL.md entries** (reflect, plan, note, peer-review, reframe, bridge, advocate, resume, tour, prune, audit, feedback, spec, program, round-review, fast-execute, prompt-evolve, session-distill) **+ the skills/README.md** (a package-bundled index, not a skill itself). Only `src`, `role`, `tier`, and `description` carry over unchanged.

The skills/README.md entry (`src: "files/skills/README.md"`) uses the same delivery-object pattern — it is bundled inside the packages alongside the SKILL.md files.

**CHECKPOINT after Phase 3:**
```powershell
# CP-3a: JSON validates
node -e "JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')); console.log('valid')"
# Expected: valid

# CP-3b: no userMemory references in dest fields
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '\{userMemory\}'
# Expected: zero matches

# CP-3c: no userSkills references in dest fields
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '\{userSkills\}'
# Expected: zero matches

# CP-3d: no projectClaude references survive
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '\{projectClaude\}'
# Expected: zero matches

# CP-3e: count .cairn dest entries (MEMORY.md + LAWS.md + 4 typed READMEs = 6 entries with {projectRoot}/.cairn/)
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '\.cairn/'
# Expected: 6 matches

# CP-3f: count delivery method entries (expect 19)
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern '"method": "package"'
# Expected: 19 matches

# CP-3g: state file src paths are under files/.cairn/ (master §2.5 lockstep — stale src 404s WS08's fetch)
rg '"src": "files/(CLAUDE|LAWS|memory)' C:\Users\winno\projects\cairn\cairn\manifest.json
# Expected: zero matches (all state file srcs should now be "files/.cairn/..." — no plain "files/LAWS.md" or "files/memory/..." should survive)
```

If CP-3b, CP-3c, or CP-3d still show matches: a dest was missed — search by the remaining match's line number and re-apply the rewrite.
If CP-3e shows fewer than 6: one of the memory/laws dests was not updated.
If CP-3f shows fewer than 19: a skill entry still has the old `dest` shape — find it via `Select-String -Pattern '{userSkills}'` and complete the conversion.
If CP-3g shows any match: a state file's `src` was not updated in lockstep with its `dest` — find the entry and update the `src` to `files/.cairn/...`.

---

## Phase 4 — Remove false `.agents/` alignment text and clean up `pathVariables` references

**Goal:** verify the Phase 2 rewrite already eliminated the false-alignment strings. This is a verification-only phase that also checks `description` strings inside the now-removed `userSkills` and `projectClaude` blocks are fully gone.

**NOTE:** If Phase 2 (Step 2.1) was applied correctly, Phases 4 is a pure checkpoint. No additional edits are expected. If any false-alignment string survives (e.g. a partial edit left a stale block), this phase identifies and removes it.

### Step 4.1 — Run the master DoD#8 grep

```powershell
# Shell: PowerShell
Select-String -Path C:\Users\winno\projects\cairn\cairn\manifest.json -Pattern 'v0\.14-note|v0\.14\.0-aligned|\.agents/skills'
# Expected: zero matches
```

If any match is found:
- Identify which line.
- It must be inside a stale `userSkills` or `projectClaude` block that Phase 2 did not fully remove.
- Locate the full JSON object containing that line and delete it entirely.
- Re-run JSON validation (`node -e "JSON.parse(...)"`) before proceeding.

**CHECKPOINT after Phase 4:**
```powershell
# CP-4a: DoD#8 grep returns zero (this is the hard gate)
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" C:\Users\winno\projects\cairn\cairn\manifest.json
# Expected: no output (exit 1 from rg means zero matches, which is the PASS condition here)

# CP-4b: also confirm "userMemory" string is entirely gone (including from description text)
rg -n "userMemory" C:\Users\winno\projects\cairn\cairn\manifest.json
# Expected: no output

# CP-4c: version is 0.14.0
node -e "console.log(JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')).version)"
# Expected: 0.14.0
```

---

## Post-flight

Run these after all phases pass their checkpoints.

```powershell
# PF-final-1: full JSON validity
node -e "JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')); console.log('valid')"
# Expected: valid

# PF-final-2: master DoD#8 gate (must return zero matches — rg exits 1 on no match, which is the PASS condition)
rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" C:\Users\winno\projects\cairn\cairn\manifest.json; if ($LASTEXITCODE -eq 1) { "PASS: zero matches" } else { "FAIL: stale alignment text found" }
# Expected: PASS: zero matches

# PF-final-3: no vendor path variables survive
rg -n "userMemory|userSkills|userClaude|projectClaude" C:\Users\winno\projects\cairn\cairn\manifest.json; if ($LASTEXITCODE -eq 1) { "PASS: zero matches" } else { "FAIL: vendor path variables found" }
# Expected: PASS: zero matches

# PF-final-4: all 6 cairn state dests are present
rg -c '\.cairn/' C:\Users\winno\projects\cairn\cairn\manifest.json
# Expected: 6

# PF-final-4b: no state file src still points to stale pre-WS01 location (master §2.5 lockstep)
rg '"src": "files/(CLAUDE|LAWS|memory)' C:\Users\winno\projects\cairn\cairn\manifest.json; if ($LASTEXITCODE -eq 1) { "PASS: zero matches" } else { "FAIL: stale src paths found — update to files/.cairn/..." }
# Expected: PASS: zero matches

# PF-final-4c: no {projectRoot}/CLAUDE.md entry exists (user-owned, never seeded — master §2.1/§3)
rg 'projectRoot\}/CLAUDE\.md' C:\Users\winno\projects\cairn\cairn\manifest.json; if ($LASTEXITCODE -eq 1) { "PASS: zero matches" } else { "FAIL: CLAUDE.md entry must be dropped" }
# Expected: PASS: zero matches

# PF-final-5: all 19 skills are package-delivered
rg -c '"method": "package"' C:\Users\winno\projects\cairn\cairn\manifest.json
# Expected: 19

# PF-final-6: version is correct
node -e "console.log(JSON.parse(require('fs').readFileSync('C:\\\\Users\\\\winno\\\\projects\\\\cairn\\\\cairn\\\\manifest.json','utf8')).version)"
# Expected: 0.14.0

# PF-final-7: git diff shows only manifest.json changed (this workstream touches ONLY that file)
git -C C:\Users\winno\projects\cairn\cairn diff --name-only
# Expected: manifest.json (only)
```

**Commit-message template** (do NOT commit until the executor hands off to main context per §9.3):

```
feat(manifest): reshape manifest.json to .cairn/ dests + package-delivered skills (WS06)

- version bumped 0.13.1 → 0.14.0
- pathVariables: drop userClaude/userMemory/userSkills/projectClaude; add cairnRoot
- {projectRoot}/CLAUDE.md entry dropped (user-owned, never seeded per §2.1/§3)
- state file src+dest rewritten in lockstep to files/.cairn/... / {projectRoot}/.cairn/...
- 18 SKILL.md entries + skills/README.md (19 total) converted from {userSkills}/... dests to package delivery descriptors
- false .agents/skills alignment text (v0.14-note, v0.14.0-aligned) fully removed
- description updated to reflect .cairn/ model and package distribution

Part of SPEC_CAIRN_OWNERSHIP program (WS06); depends on WS01.
rg "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json → zero (DoD#8).
rg "userMemory|userSkills|projectClaude" manifest.json → zero.
rg '"src": "files/(CLAUDE|LAWS|memory)' manifest.json → zero (src lockstep).
node -e "JSON.parse(...)" → valid.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Archive line** (run after the commit merges to main — moves the spec to the archive, do NOT run before merge):
```powershell
git -C C:\Users\winno\projects\cairn\cairn mv docs/specs/SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE.md docs/specs/archive/SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE.md
```

---

## Executor Handoff

**Three files to read first (in order):**
1. `C:\Users\winno\projects\cairn\cairn\manifest.json` — the only file you edit; read it completely before touching it so you know the exact current structure.
2. `C:\Users\winno\projects\cairn\cairn\docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §2 (CONTRACT SURFACES) and §4 (HARD CONTRACT) — the invariants your edits must preserve.
3. `C:\Users\winno\projects\cairn\cairn\docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` — WS06 depends on WS01; the `.cairn/` directory layout must be frozen there before you finalize the dests here (if WS01 is not COMPLETE, wait).

**The two constraints most likely to cause a mistake:**
1. Phase 3 Step 3.4 converts 19 package-delivered entries. It is easy to miss one entry mid-list, especially if the entries are processed manually. After Step 3.4, run CP-3f (`rg -c '"method": "package"'`) immediately — if the count is not 19, you missed an entry. Do not proceed to Phase 4 until CP-3f passes.
2. State file `src` and `dest` must be updated in lockstep. Run CP-3g after Steps 3.1–3.3 to confirm no stale `files/LAWS.md` or `files/memory/...` src remains — a stale src causes WS08's fetch to 404 silently.

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| JSON parse error after an edit | `git checkout -- manifest.json` to restore; re-apply the specific step carefully, paying attention to trailing commas |
| CP-3b/3c/3d still shows matches | `Select-String` the pattern → note the line → re-read the surrounding JSON object → apply the correct transformation |
| DoD#8 grep (CP-4a) shows a match | The `userSkills.pi.v0.14-note` or `projectClaude.pi` block was not fully removed in Phase 2 — delete the containing object entirely, validate JSON, re-run CP-4a |
| WS01 not yet COMPLETE | Do NOT finalize the dests; verify the `.cairn/` layout spec is merged first; the dest paths in Phase 3 must match WS01's frozen layout |

---

## Review Checklist

A fresh reviewer (who did NOT write these edits) checks:

- [ ] `node -e "JSON.parse(...)"` returns `valid` — no syntax errors
- [ ] `rg "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json` returns zero (DoD#8)
- [ ] `rg "userMemory|userSkills|userClaude|projectClaude" manifest.json` returns zero
- [ ] `manifest.json` contains exactly 2 `pathVariables` entries: `projectRoot` and `cairnRoot`
- [ ] `cairnRoot` description makes no reference to vendor paths (`~/.claude`, `~/.pi`, `~/.gemini`, `.agents/`)
- [ ] All 5 former `{userMemory}` dests are now `{projectRoot}/.cairn/memory/...` — AND each `src` is updated in lockstep to `files/.cairn/memory/...`
- [ ] The former `{projectClaude}/LAWS.md` dest is now `{projectRoot}/.cairn/LAWS.md` — AND its `src` is `files/.cairn/LAWS.md`
- [ ] 18 SKILL.md entries + the skills/README.md (19 total), formerly `{userSkills}/...` dests, are now `"delivery": { "method": "package", ... }` objects
- [ ] `version` is `"0.14.0"` not `"0.13.1"`
- [ ] `description` mentions `.cairn/` and the package names
- [ ] No `{projectRoot}/CLAUDE.md` entry exists — it is fully user-owned and the manifest must not carry it (master §2.1/§3)
- [ ] `rg '"src": "files/(CLAUDE|LAWS|memory)' manifest.json` returns zero (stale src would 404 WS08's fetch)
- [ ] No vendor path (`~/.claude`, `~/.pi`, `~/.gemini`, `~/.agents`) appears in any `dest` or `delivery` field
- [ ] No step in this spec tells the executor to write to any path outside `manifest.json` itself (single-file discipline — WS06 touches ONLY `manifest.json`)
- [ ] Commit is NOT made in the worktree — the spec says to hand off to main context first per §9.3
