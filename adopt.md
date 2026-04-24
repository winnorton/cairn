# Agent adoption instructions

> **For agents.** If you are an AI agent reading this because a user asked you to "adopt
> cairn" or "adopt https://github.com/winnorton/cairn", follow the steps below precisely.
>
> **For humans.** This file tells your agent how to install cairn. Tell your agent:
> `adopt https://github.com/winnorton/cairn` — your agent will fetch this file and walk
> you through the install.

---

## What cairn is

A portable agent environment: memory index, laws template, starter skills, and a project
context template (CLAUDE.md). Designed to work in Claude Code and Cowork. Domain-agnostic —
not just software.

Installing cairn creates files in the user's environment. It does not install a package,
start a server, or modify the user's shell. Everything is files.

## Adoption flow — follow in order

### Step 1 — Detect the environment

Determine which environment you are running in. Use this decision tree:

1. Does the current working directory have a `.claude/` folder, **or** is there a
   `~/.claude/` directory accessible? → **Claude Code**.
2. Do you have Cowork-specific workspace APIs, or a workspace marker file? → **Cowork**.
3. Neither clear? → **Ask the user** which environment they're in before continuing.

Record the environment. All path resolution below depends on it.

**Claude Code only — also detect memory scope.** Claude Code has two memory conventions
and installing to the wrong one is a silent failure (files land where the agent's memory
loader never reads):

- **User-global:** `~/.claude/memory/` — memories shared across all projects.
- **Project-scoped:** `~/.claude/projects/<project-slug>/memory/` — memories scoped to one
  project. The slug is the project's absolute path with slashes/colons replaced by hyphens
  (e.g. `C:\Users\winno\projects\foo` → `C--Users-winno-projects-foo`).

Detect which this session uses:

1. **Check the system prompt / agent config** — if there's an explicit directive like
   "your memory system is at `<path>`," use that path. Authoritative.
2. **Probe the filesystem** — check which candidate path contains an existing `MEMORY.md`
   or entries. If one has content and the other doesn't, the populated one is probably
   where memory actually loads from.
3. **Ask the user** if both paths exist or if you're uncertain. A direct "is memory
   user-global or project-scoped in this setup?" is better than a wrong install.

Record the resolved memory root. Use it everywhere the manifest says `{userMemory}`.

### Step 2 — Fetch the manifest, then check for fast-path and tier

Fetch the manifest at:

```
https://raw.githubusercontent.com/winnorton/cairn/main/manifest.json
```

It contains:
- `pathVariables` — environment-specific path mappings (e.g. `{userMemory}`, `{projectRoot}`).
- `files` — the list of files to install, each with `src`, `dest`, `mode`, `role`, `tier`,
  `description`.
- `version` — the release version of this manifest.
- `roles` — definitions of the three role labels (`essential`, `scaffolding`, `optional`).
- `tiers` — definitions of the four graduated adoption tiers (`seed`, `grow`, `structure`,
  `full`).

**Tier filter** — check whether the user requested a specific tier. Accepted forms:

- `adopt …` → default: install **full** (everything).
- `adopt … --tier seed` → install only seed-tier files (CLAUDE.md + MEMORY.md). For
  agent-portable minimal use.
- `adopt … --tier grow` → install seed + grow (adds LAWS.md + reflect/plan skills).
- `adopt … --tier structure` → install seed + grow + structure (adds typed memory,
  tour/prune/audit).
- `adopt … --tier full` → install everything (explicit form of the default).

Tiers are cumulative. If the user didn't explicitly request a tier, default to `full`
but mention the lower-tier options in the Step 4 preview so they can choose.

**Fast-path check** — before walking the file list, look for a local version marker at
`{projectClaude}/cairn-version`:

- **Not found** → fresh install. Proceed to Step 3.
- **Found and matches `manifest.version`** → report *"cairn vX.Y.Z already installed at
  `{projectClaude}/` — nothing to do."* and stop. No further steps.
- **Found but version differs** → re-adoption. Proceed to Step 3. The diff pass in the
  "Re-adoption / upgrade" section below becomes cheaper because the delta is bounded.

The marker is a single-line file (just the version string, no frontmatter). It is written
at the end of a successful install — see Step 6.

### Step 3 — Resolve paths

For each file in the manifest, resolve `dest` by substituting path variables for your
detected environment.

For **Claude Code**, the variables resolve as:
- `{userClaude}` → `~/.claude`
- `{userMemory}` → `~/.claude/memory`
- `{userSkills}` → `~/.claude/skills`
- `{projectClaude}` → `<cwd>/.claude`
- `{projectRoot}` → `<cwd>` (the user's current project directory)

For **Cowork**, resolve relative to the workspace root. Cowork has **two distinct storage
layers**, each with different tool access patterns — use the right one:

- **Project `.claude/`** (CLAUDE.md, LAWS.md, cairn-version marker) lives on the **bash
  mount** at a path like `/sessions/<session-name>/mnt/<folder>/`. File tools often can't
  write here — writes fail with *"blocked in this session — resolves to a protected
  location."* **Fall back to the shell** (bash or PowerShell). Run `pwd` in the shell to
  confirm where you are, then write from there. Reads via file tools usually still work;
  only writes need the shell.

- **Memory** (`~/.claude/memory/`) lives in Cowork's **persistent memory store**, not the
  bash mount. Access it with **file tools**, not shell. Note: **deletion is not supported**
  from standard tools in this layer — for migrations that retire files, use index
  tombstoning (see Migration section below).

- **Skills** (`~/.claude/skills/`) behavior varies — probe first. If unsure, try file
  tools; fall back to shell.

If any path remains ambiguous after probing, **ask the user** for the absolute target
path rather than guessing. Wrong install locations are the most common failure mode.

### Step 4 — Preview the plan

Before writing anything, show the user a compact preview:

**For a `full` install** (default), group by role so users see what matters most:

```
cairn v0.6.1 — install preview (tier: full)

ESSENTIAL — load-bearing from day one (seed tier):
  <project>/CLAUDE.md                        — project context (read every session)
  ~/.claude/memory/MEMORY.md                 — memory lookup entry point

SCAFFOLDING — shape is important, content grows with you:
  <project>/.claude/LAWS.md                  — schema + 5 seed laws (grow tier)
  ~/.claude/skills/reframe.md                — user-supporting: alt framings (grow)
  ~/.claude/memory/user/README.md            — user memory conventions (structure tier)
  ~/.claude/memory/feedback/README.md        — feedback memory conventions (structure)
  ~/.claude/memory/project/README.md         — project memory conventions (structure)
  ~/.claude/memory/reference/README.md       — reference memory conventions (structure)
  ~/.claude/skills/README.md                 — skills authoring guide (structure)
  ~/.claude/skills/tour.md                   — onboarding (structure)
  ~/.claude/skills/prune.md                  — hygiene (structure)
  ~/.claude/skills/audit.md                  — citation report (structure)

OPTIONAL — ergonomic; delete if you prefer less surface:
  ~/.claude/skills/reflect.md                — capable agents reflect anyway (grow)
  ~/.claude/skills/plan.md                   — capable agents plan anyway (grow)
  ~/.claude/skills/feedback.md               — capable agents file feedback anyway (full)

Will also write (post-install):
  <project>/.claude/cairn-version            — version marker for re-adoption fast-path

Want a smaller install? Re-run with --tier seed (2 files, agent-portable),
--tier grow (6 files), or --tier structure (14 files).

Proceed? (y/n)
```

**For a tier-filtered install** (e.g. `--tier seed`), show only the files included in
that tier, and state the tier clearly in the header. Users who picked a smaller tier
made a conscious choice — don't bombard them with the full tree.

Show **absolute resolved paths**, not the variable templates. If any destination already
exists, list it under "Skipping" — `create-if-absent` mode must never overwrite.

Wait for explicit user approval before proceeding.

### Step 5 — Install

For each file in the manifest:
1. Fetch the source file from `{rawBase}/{src}` where `rawBase` is defined in the manifest.
2. If the resolved `dest` already exists and `mode` is `create-if-absent`, skip it.
3. Ensure parent directories exist.
4. Write the file.

If a fetch or write fails, stop and report the partial state clearly — do not continue
silently.

### Step 6 — Write version marker, then report

**First, write the version marker.** After a successful install (or upgrade), write
`{projectClaude}/cairn-version` containing just the installed version string (e.g. `0.3.3`).
No frontmatter, no comments — just the version on a single line. Create the parent
directory if it doesn't exist. This enables the Step 2 fast-path on future re-adoptions.

**Then report to the user:**

```
cairn v0.6.1 installed.

Created:
  <list of files actually written, absolute paths>

Skipped (already existed):
  <list>

Next: say `tour` and I'll walk you through what was installed and help you take
the first concrete action.
```

The `tour` skill (installed at `~/.claude/skills/tour.md`) will handle onboarding. Point
the user at it rather than dumping a long "what to do" list — it's more actionable.

Keep the report under ~200 words. No prose padding.

---

## Safety rules

- **Never overwrite** files in `create-if-absent` mode. If in doubt, skip and report.
- **Never write outside** the paths resolved from the manifest.
- **Show the plan before writing.** Even if the user said "just install it" — one short
  preview is worth the friction.
- **If the user interrupts**, stop immediately and report current state.
- **If `~/.claude/` or equivalent doesn't exist**, ask the user before creating it.
- **On Cowork, if file-tool writes fail with "blocked/protected location"**, fall back to
  the shell with the mount path (see Step 3). Don't interpret the block as "install
  failed" — it's a tooling-layer restriction, not an install-time error.

## Version pinning

The manifest and this file live on `main`. For a pinned version, fetch from a tag:

```
https://raw.githubusercontent.com/winnorton/cairn/v0.6.1/manifest.json
```

If the user invoked with `adopt ...@<tag>`, use that tag. Otherwise use `main`.

## Migration across version boundaries

Cairn is agent-targeted software. Migration for agent-targeted software does not require
migration *code* — a capable agent can read the old layout, read the new manifest, and
move what needs to move. What this section provides is the pattern, not tooling.

### When to invoke migration

Invoke the migration flow when:
- Step 2's fast-path detects a version marker AND the installed version is a major bump
  behind the target (e.g. installed `0.3.x`, target `0.4.0`).
- The local file layout visibly doesn't match the new manifest's expected layout.
- The user explicitly asks to migrate.

For patch-level bumps (`0.4.0` → `0.4.1`), migration is overkill — the re-adoption diff
flow below handles it.

### Migration flow

1. **Enumerate the installed habitat.** List every file currently at resolved cairn paths
   (memory dir, skills dir, project `.claude/`, CLAUDE.md). Read bodies where needed.

2. **Enumerate the new manifest.** Read the target's `files:` array.

3. **Build a mapping.** For each installed file, decide: **keep** (still present in target),
   **move** (path changed), **transform** (shape changed — e.g. flat entry moving into a
   type subdir), or **retire** (no longer part of cairn). Where classification isn't obvious
   (flat memory → typed memory requires sorting each entry), use the memory file's `type:`
   frontmatter if present, otherwise read the body and classify, otherwise ask the user.

4. **Present the plan to the user.** Show the full mapping before acting:
   ```
   Migrate cairn v0.3.x → v0.4.0

   Keep as-is:    <list>
   Move:          <old path> → <new path>
   Transform:     <old path> → <new path> (+ classification note)
   Retire:        <orphans — see deletion handling below>

   Proceed? (y/n)
   ```

5. **Execute.** Move/copy files using the right tool for the storage layer (shell vs
   file-tools — see environment notes below). Update every index (`MEMORY.md` top-level,
   type-subdirectory READMEs) to point at new paths.

6. **Handle deletion constraints with index tombstoning.** Some environments don't allow
   deleting files from their standard tools (Cowork's memory store is the known case).
   When deletion isn't possible: remove the orphan's entry from every index, then note its
   existence in the migration report as "orphaned-but-present." Orphaned-and-unindexed is
   functionally equivalent to deleted — agents load the index, not the directory listing.

7. **Write the new version marker** (`{projectClaude}/cairn-version`). Report the full
   summary: installed, migrated, transformed, tombstoned.

### Environment notes for migration

**Cowork** has two distinct storage layers with different capabilities:

- **Bash mount** (`/sessions/<name>/mnt/...`): accessible via shell. Project `.claude/`
  lives here (see Step 3 for the write-protection workaround). Deletion is supported.
- **Memory store** (`~/.claude/memory/`): accessible via file tools, not shell. **Deletion
  is not supported from standard tools.** Use index tombstoning (step 6) when the old
  layout leaves orphans.

Use the right tool for each layer. Memory migrations are file-tool operations; `.claude/`
migrations may need the shell fallback documented in Step 3.

## Re-adoption / upgrade

If the user adopts again with cairn already installed, compare the new manifest and
sources against the local state. Apply these four cases in order — a single version
bump may trigger multiple cases.

1. **New files** — present in the new manifest, absent from the installed set. Install
   via the standard `create-if-absent` flow. Report *"installed: <list>."*

2. **Removed files** — present in the old manifest, absent from the new. Leave local
   copies untouched unless the user explicitly asks to remove. Report *"note: <list>
   is no longer part of cairn — your local copy is preserved."*

3. **Changed file bodies** — same `src` and `dest`, different content. Diff each
   changed file and ask per-file: keep local, take new, or merge. Never auto-overwrite
   a file the user may have customized.

4. **Doc-only bump** — none of cases 1–3 produced any action. The version bump changed
   only `adopt.md`, `README.md`, `plans/`, `VERSION`, or other repo metadata; nothing
   in the installed habitat is affected. Report briefly: *"cairn vX.Y.Z is a
   documentation-only update — no changes to your installed habitat. Release notes at
   https://github.com/winnorton/cairn/releases."* Then stop.

   **Do NOT** invent a recommendation to "update the repo copy of adopt.md in your
   workspace." `adopt.md` is fetched fresh on each adoption — it is not a file users
   maintain locally. There is nothing to "keep in sync."

---

## Manifest reference (quick lookup)

| `src` | `dest` (Claude Code) | `role` | `tier` |
|---|---|---|---|
| `files/CLAUDE.md` | `<project>/CLAUDE.md` | essential | seed |
| `files/memory/MEMORY.md` | `~/.claude/memory/MEMORY.md` | essential | seed |
| `files/LAWS.md` | `<project>/.claude/LAWS.md` | scaffolding | grow |
| `files/skills/reflect.md` | `~/.claude/skills/reflect.md` | optional | grow |
| `files/skills/plan.md` | `~/.claude/skills/plan.md` | optional | grow |
| `files/skills/reframe.md` | `~/.claude/skills/reframe.md` | scaffolding | grow |
| `files/memory/user/README.md` | `~/.claude/memory/user/README.md` | scaffolding | structure |
| `files/memory/feedback/README.md` | `~/.claude/memory/feedback/README.md` | scaffolding | structure |
| `files/memory/project/README.md` | `~/.claude/memory/project/README.md` | scaffolding | structure |
| `files/memory/reference/README.md` | `~/.claude/memory/reference/README.md` | scaffolding | structure |
| `files/skills/README.md` | `~/.claude/skills/README.md` | scaffolding | structure |
| `files/skills/tour.md` | `~/.claude/skills/tour.md` | scaffolding | structure |
| `files/skills/prune.md` | `~/.claude/skills/prune.md` | scaffolding | structure |
| `files/skills/audit.md` | `~/.claude/skills/audit.md` | scaffolding | structure |
| `files/skills/feedback.md` | `~/.claude/skills/feedback.md` | optional | full |

All entries use `mode: create-if-absent`. Role and tier definitions: see `manifest.roles`
and `manifest.tiers`.

For the authoritative list, always use the manifest at runtime — this table may drift.
