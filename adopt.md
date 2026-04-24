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

### Step 2 — Fetch the manifest

Fetch the manifest at:

```
https://raw.githubusercontent.com/winnorton/cairn/main/manifest.json
```

It contains:
- `pathVariables` — environment-specific path mappings (e.g. `{userMemory}`, `{projectRoot}`).
- `files` — the list of files to install, each with `src`, `dest`, `mode`, `description`.

### Step 3 — Resolve paths

For each file in the manifest, resolve `dest` by substituting path variables for your
detected environment.

For **Claude Code**, the variables resolve as:
- `{userClaude}` → `~/.claude`
- `{userMemory}` → `~/.claude/memory`
- `{userSkills}` → `~/.claude/skills`
- `{projectClaude}` → `<cwd>/.claude`
- `{projectRoot}` → `<cwd>` (the user's current project directory)

For **Cowork**, resolve relative to the workspace root using Cowork's APIs. If any path is
ambiguous, **ask the user** rather than guessing — wrong install locations are the most
common failure mode.

### Step 4 — Preview the plan

Before writing anything, show the user a compact preview:

```
cairn v0.3.0 — install preview

Will create (mode: create-if-absent):
  ~/.claude/memory/MEMORY.md           — memory index
  <project>/CLAUDE.md                  — project context template
  <project>/.claude/LAWS.md            — laws template (meta + 5 seed laws)
  ~/.claude/skills/README.md           — skills authoring guide
  ~/.claude/skills/tour.md             — onboarding walk-through
  ~/.claude/skills/reflect.md          — reflection skill
  ~/.claude/skills/plan.md             — planning skill
  ~/.claude/skills/prune.md            — stale memory/law review
  ~/.claude/skills/audit.md            — usage citation report
  ~/.claude/skills/feedback.md         — file feedback to cairn directly

Skipping (already exist): <list any>

Proceed? (y/n)
```

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

### Step 6 — Report

When done, show the user:

```
cairn v0.3.0 installed.

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

## Version pinning

The manifest and this file live on `main`. For a pinned version, fetch from a tag:

```
https://raw.githubusercontent.com/winnorton/cairn/v0.3.0/manifest.json
```

If the user invoked with `adopt ...@<tag>`, use that tag. Otherwise use `main`.

## Re-adoption / upgrade

If the user adopts again with cairn already installed:
1. Diff each existing destination against the new source.
2. For each file with changes, show the diff and ask: keep local, take new, or merge.
3. Never auto-overwrite a file the user may have customized.

---

## Manifest reference (quick lookup)

| `src` | `dest` (Claude Code) | `mode` |
|---|---|---|
| `files/MEMORY.md` | `~/.claude/memory/MEMORY.md` | create-if-absent |
| `files/CLAUDE.md` | `<project>/CLAUDE.md` | create-if-absent |
| `files/LAWS.md` | `<project>/.claude/LAWS.md` | create-if-absent |
| `files/skills/README.md` | `~/.claude/skills/README.md` | create-if-absent |
| `files/skills/tour.md` | `~/.claude/skills/tour.md` | create-if-absent |
| `files/skills/reflect.md` | `~/.claude/skills/reflect.md` | create-if-absent |
| `files/skills/plan.md` | `~/.claude/skills/plan.md` | create-if-absent |
| `files/skills/prune.md` | `~/.claude/skills/prune.md` | create-if-absent |
| `files/skills/audit.md` | `~/.claude/skills/audit.md` | create-if-absent |
| `files/skills/feedback.md` | `~/.claude/skills/feedback.md` | create-if-absent |

For the authoritative list, always use the manifest at runtime — this table may drift.
