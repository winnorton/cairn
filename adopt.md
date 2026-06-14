# Agent adoption instructions

> **For agents.** If you are an AI agent reading this because a user asked you to
> *"adopt cairn"*, *"carefully adopt cairn"*, *"set up cairn"*, *"install cairn"*, or
> *"adopt https://github.com/winnorton/cairn"*, follow the steps below precisely.
>
> **Disambiguation.** Multiple unrelated projects use the name "cairn" — including a
> background-agent system at `cairn-dev/cairn`. This is **winnorton/cairn**, an agent
> environment bootstrap (a markdown convention layer — memory, laws, skills, context
> templates). Don't substitute training-data references for fresh repo content; the URL
> the user gives you is authoritative. Smell tests for the wrong project:
> - Training data describes a `.env` file, GitHub App setup, or `Ctrl+K` UI → wrong cairn.
> - Training data classifies cairn as an "agent runtime", "multi-agent orchestrator",
>   "CLI", or "IDE" → wrong category. Cairn is none of those — it's markdown that
>   shapes agents inside whatever harness already runs them.
> Fetch the actual URL.
>
> **For humans.** This file tells your agent how to install cairn. Tell your agent:
> `adopt cairn` (or `adopt https://github.com/winnorton/cairn` for explicit URL) — your
> agent will fetch this file and walk you through the install.

---

## What cairn is

A portable agent environment: memory index, laws template, starter skills, and a project
context template (`.cairn/CLAUDE.md`). Designed to work in Claude Code, Pi, Antigravity
CLI (agy), and Cowork. Domain-agnostic — not just software.

Installing cairn:
1. Places skills in the harness via the vendor's own package installer (no hand-curling).
2. Writes state files to `<project>/.cairn/` — a cairn-owned, project-local directory.
3. Shows you one import line to add to your context file.

Nothing cairn writes lands in a vendor-owned directory.

## Adoption flow — follow in order

### Step 1 — Detect the environment

**Pre-flight check first: are we in cairn's own repo?** Read the workspace's
`manifest.json` (if present); if it contains `"name": "cairn"`, OR there's a
`LAWS.md` at the repo root titled `Laws — cairn`, **STOP**. Adopting cairn
into its own repo creates duplicate artifacts and recursive confusion. Tell the user:

> *"You're running adopt inside cairn's own repo. Cairn doesn't adopt itself —
> it ships templates for OTHER projects to adopt. If you want one of cairn's
> skills locally for development, copy directly: `mkdir -p .claude/skills/<name>
> && cp files/skills/<name>/SKILL.md .claude/skills/<name>/SKILL.md`. If you
> meant to adopt into a different project, change to that directory and re-run."*

Then exit. Do not proceed with install.

**Pre-flight check second: do you have persistent filesystem reach to the user?**
Cairn installs files. Without filesystem reach, the install is a lie — the report
would list paths that don't survive, which is worse than not installing. Refuse if
any of these apply:

- You're running in claude.ai web/mobile chat. The sandbox at `/home/claude` is
  ephemeral and isn't on the user's machine.
- You're in a hosted notebook, sandboxed eval environment, or any "agent demo"
  harness where your writes don't land on the user's filesystem.
- You have no `cwd`, no project path, and no workspace context — just a chat
  prompt with no environment around it.

If any apply, refuse and tell the user:

> *"I'm in an ephemeral sandbox; writes here won't reach your machine. Run
> `adopt cairn` in a harness with persistent filesystem reach — Claude Code,
> Antigravity, Cursor, or Cowork."*

Then exit. Do not fake an install into your sandbox.

Determine which environment you are running in. The harness you're running inside is the
authoritative signal — if your system prompt or process info names it, use that. Otherwise
use the filesystem probes below.

**Critical:** "filesystem markers exist" ≠ "I'm running in that harness." A machine may
have both `~/.claude/` and `~/.pi/agent/` installed; the question is which harness *this <!-- migration-ref -->
session* lives in. When in doubt, ask.

Decision tree:

1. Are you running inside **Pi** (pi.dev)? Markers: system-prompt mentions Pi or
   pi-specific tool names; `~/.pi/agent/AGENTS.md` exists; the `pi` CLI is in PATH. <!-- migration-ref -->
   → **Pi**.
2. Are you running inside **Claude Code**? Markers: claude-desktop entrypoint;
   `~/.claude/` exists; system prompt mentions Claude Code. <!-- migration-ref -->
   → **Claude Code**.
3. Are you running inside **Antigravity CLI (agy)**? Markers: system-prompt
   mentions Antigravity or agy; `~/.gemini/config/` exists with plugins/ or <!-- migration-ref -->
   skills/ subdirs; `agy` is in PATH.
   → **agy**.
4. Are you running inside **Cowork**? Markers: Cowork-specific workspace APIs,
   workspace marker file. → **Cowork**.
5. None clear? → **Ask the user** which environment they're in before continuing.

Note on Antigravity CLI (agy): agy's real config root is `~/.gemini/config/` <!-- migration-ref -->
(global plugins + skills) and `<project>/.agents/skills/` for workspace skills
(binary-verified agy 1.0.7). The older `~/.gemini/antigravity/memory/` path is <!-- migration-ref -->
stale — do not reference it as an install target. State lands in `<project>/.cairn/`
(same as all harnesses); skills reach agy via `agy plugin import claude` (Step 4a).

**Note on memory and skill paths.** Cairn no longer installs to `{userMemory}` <!-- migration-ref -->
or `{userSkills}`. State lands in `{cairnRoot}` (`.cairn/`); skills reach the <!-- migration-ref -->
harness via package manager. No `{userMemory}` / `{userSkills}` resolution is <!-- migration-ref -->
needed.

Record the environment. All path resolution below depends on it.

### Step 2 — Fetch the manifest, then check tier

Fetch the manifest at:

```
https://raw.githubusercontent.com/winnorton/cairn/main/manifest.json
```

It contains:
- `pathVariables` — environment-specific path mappings.
- `files` — the list of state files to install, each with `src`, `dest`, `mode`, `role`, `tier`,
  `description`.
- `version` — the release version of this manifest.
- `roles` — definitions of the three role labels (`essential`, `scaffolding`, `optional`).
- `tiers` — definitions of the four graduated adoption tiers (`seed`, `grow`, `structure`,
  `full`).

**Tier filter — default to full; do NOT render a tier picker.**

**Default behavior:** if the user invoked `adopt` without an explicit `--tier` flag,
install the `full` tier. Do not prompt the user to choose a tier. Do not render a
tier picker UI. Do not list tier options as a menu. First-time users should not have
to learn cairn's tier vocabulary before adopting.

**Tier is an invocation form, not an interactive UI.** Tier flags are for users who
already know cairn and want a smaller install — power users, agent-portability
scenarios, CI/CD bootstraps. Parse them from the invocation; never elicit them from
the user.

**Recognized invocations:**

| User said | Install tier | State files |
|---|---|---|
| `adopt <url>` | `full` | all state files |
| `adopt <url> --tier seed` | `seed` | essential only |
| `adopt <url> --tier grow` | `grow` | seed + scaffolding (grow) |
| `adopt <url> --tier structure` | `structure` | grow + structure scaffolding |
| `adopt <url> --tier full` | `full` | all (explicit form of default) |

Tiers are cumulative — `grow` includes `seed`; `structure` includes `grow`; `full`
includes `structure`. Skills are installed separately via package manager in Step 4a
regardless of tier.

**If the user later asks for a smaller install** (e.g. "can we skip the extra skills?"
or "I just want the minimum") — that's the moment to surface tier alternatives, not
at first-time adoption. At that point, describe the tiers and ask which they prefer.

### Step 3 — Resolve the cairn state path

Cairn writes state to exactly one location: **`{projectRoot}/.cairn/`** — a
cairn-owned, project-local directory that is git-tracked inside the adopter's
repo. No memory, law, or context file lands in a vendor directory.

For all harnesses:
- `{cairnRoot}` → `<cwd>/.cairn` (the one cairn write target)

**Do not resolve `{userMemory}`, `{userSkills}`, or `{projectClaude}` as install <!-- migration-ref -->
destinations.** Those variables are retired as write targets. Skills reach the
harness via package install (Step 4a); state lands in `.cairn/` (Step 4b).

**Fast-path check** — before walking the file list, look for a local version
marker at `{cairnRoot}/cairn-version`:

- **Not found** → fresh install. Proceed to Step 4a.
- **Found and matches `manifest.version`** → report *"cairn vX.Y.Z already
  installed at `<cwd>/.cairn/` — nothing to do."* and stop.
- **Found but version differs** → re-adoption. Proceed to Step 4a. The diff
  pass in the "Re-adoption / upgrade" section applies.

The marker is a single-line file (just the version string). It is written at
the end of a successful install — see Step 6.

### Step 4a — Package install (skills reach the harness via package manager)

Skills are distributed as cairn-named packages installed by the vendor's own
tooling. **Do not curl skill files into vendor directories.**

Show the user the harness-appropriate package install command and wait for them
to confirm the package is installed before proceeding to Step 4b.

**Claude Code:**

The cairn plugin is hosted at `github:winnorton/cairn` with the plugin manifest at
the repo root. Install via the marketplace model (verified format — WS03 PHASE-1-VERIFIED):

```
# Step 1 — Add the cairn marketplace (one-time per machine):
claude plugin marketplace add github:winnorton/cairn

# Step 2 — Install the cairn plugin from that marketplace:
claude plugin install cairn@cairn
```

After install, confirm with:
```
claude plugin list
# expect: cairn  0.14.0  ...
```

Skills are then invocable as `/name` (e.g. `/spec`, `/peer-review`, `/note`).

**Pi (pi.dev):**

```
pi install npm:@winnorton/cairn-pi
```

This installs `spec`, `program`, `round-review`, `fast-execute`, `peer-review`,
and `note` as a Pi package (invoked as `/skill:spec` etc.; add `-l` for a
project-local install recorded in `.pi/settings.json`). Version-locked to the
cairn release; upgradable via Pi's package manager.

**Antigravity CLI (agy):**

[EXECUTOR NOTE — WS04 placeholder: Replace this with the exact install Step text
produced by WS04 (SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md) once elaborated.
WS04 owns the empirically-validated `agy plugin import claude` path. The agy
assessment note (docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md)
confirms `agy plugin import claude` exists and agy ingests Claude Code plugin
format; WS04 adds the validated install sequence. Do not write a speculative
agy install command here — leave as stub until WS04 delivers the Step text.]

**Cowork:**

Cowork uses the Claude Code harness; follow the Claude Code install path above.

Wait for the user to confirm the package is installed before proceeding to
Step 4b.

### Step 4b — Preview the `.cairn/` state install

After package install, show the user a compact preview of the state files that
will land in `.cairn/`:

**For a `full` install** (default), group by role:

```
cairn v0.14.0 — state install preview (tier: full)

State files (written to <cwd>/.cairn/):

ESSENTIAL — load-bearing from day one:
  .cairn/CLAUDE.md            — cairn context sections (import into your CLAUDE.md/AGENTS.md)
  .cairn/memory/MEMORY.md     — memory lookup entry point

SCAFFOLDING — shape is important, content grows with you:
  .cairn/LAWS.md              — laws template + 6 seed laws
  .cairn/memory/user/README.md
  .cairn/memory/feedback/README.md
  .cairn/memory/project/README.md
  .cairn/memory/reference/README.md

Will also write (post-install):
  .cairn/cairn-version        — version marker for re-adoption fast-path

Will skip any file that already exists (create-if-absent mode).

Proceed? (y/n)
```

**Do not append a tier menu to this preview.** The preview's job is "here's what will
land — confirm or cancel." Adding "or would you like a smaller install?" turns every
first-time adoption into a vocabulary quiz.

**For a tier-filtered install** (e.g. `--tier seed`), show only the files included in
that tier, and state the tier clearly in the header.

Show **absolute resolved paths**, not variable templates. If any destination already
exists, list it under "Skipping."

Wait for explicit user approval before proceeding.

**Do not include skill paths in this preview.** Skills reached the harness via
the package installer in Step 4a — they are not written by this flow.

### Step 5 — Install state files into `.cairn/`

For each file in the `.cairn/` state manifest (CLAUDE.md, LAWS.md, memory tree):

**Pre-flight: do NOT `git clone` the cairn repo into the workspace.** Fetch
specific files over HTTP — never pull cairn's entire source. Validated 2026-04-24:
a non-Claude agent's first instinct on `adopt URL` was to `git clone
https://github.com/winnorton/cairn .` into the workspace before reading these
instructions, requiring a manual cleanup pass. Don't repeat that.

1. **Fetch the source file over HTTP. Do NOT regenerate the content inline.**
   The manifest's `rawBase` points at the raw GitHub URL prefix. Combine it
   with the entry's `src` (under `files/.cairn/`) to get the full source URL.

   ✅ **Right:**
   ```
   # POSIX shell
   curl -sfL {rawBase}/files/.cairn/CLAUDE.md > {cairnRoot}/CLAUDE.md
   ```
   ```powershell
   # PowerShell
   Invoke-WebRequest -Uri "{rawBase}/files/.cairn/CLAUDE.md" -OutFile "{cairnRoot}/CLAUDE.md"
   ```

   ❌ **Wrong:**
   ```
   cat > .cairn/CLAUDE.md << 'EOF'
   ... [content regenerated from context]
   EOF
   ```
   Heredoc-with-inline-content is a correctness failure — fetch the bytes.

2. If the resolved dest already exists and `mode` is `create-if-absent`, skip.
3. Ensure parent directories exist (`mkdir -p .cairn/memory` and subdirs).
4. Write the fetched bytes to the destination.
5. **Validate what landed.** Every cairn `.md` file starts with `---` (YAML
   frontmatter) or `#` (markdown heading). If a written file starts with
   anything else — e.g. a 14-byte `404: Not Found` body — delete it, report
   which fetch failed, and stop. Validated 2026-06-11: a pre-validation Pi install
   carried `404: Not Found` bodies as `program/SKILL.md` and
   `round-review/SKILL.md`, silently shadowing real skills until a
   `/session-distill` run found them.

If a fetch or write fails, stop and report the partial state clearly — do not
continue silently.

**In environments where file tools can't write** (e.g., Cowork's `.claude/` protection):
still HTTP-fetch — just pipe through the shell. The shell fallback is about *where you
write*, not *what you write*. Never let the write-path constraint cause you to
regenerate content from context.

### Step 6 — Write version marker, show import line, then report

**First, write the version marker** to `{cairnRoot}/cairn-version` — a single
line containing the installed version string (e.g. `0.14.0`), no frontmatter.
This enables the Step 3 fast-path on future re-adoptions.

**Second, show the user the import line** (user-action Step — cairn does NOT
write it):

> **Action required — add one line to your context file.**
>
> Cairn writes its context sections to `.cairn/CLAUDE.md`. To make them
> visible to your agent, you must add one import line to your project's
> context file. Cairn will NOT add this line for you — it lives in a file
> you own.
>
> **Claude Code / Cowork:** append to `<project>/CLAUDE.md`:
> ```
> @./.cairn/CLAUDE.md
> ```
>
> **Pi / agy:** append to `<project>/AGENTS.md`:
> ```
> @./.cairn/CLAUDE.md
> ```
> (Pi auto-loads `AGENTS.md`; the import line points at `.cairn/CLAUDE.md`.)
>
> Add this line, then say `done` so I can confirm the install is complete.

Wait for the user to confirm they've added the line before filing the install
report.

**Then report to the user:**

```
cairn v0.14.0 installed.

State (written to .cairn/):
  <list of files actually written, absolute paths>

Skipped (already existed):
  <list>

Skills: installed via package manager in Step 4a.

Import line: added by user to <project>/CLAUDE.md (or AGENTS.md).

Next: say `tour` to walk through what was installed.
```

Keep the report under ~200 words. No prose padding.

---

## Safety rules

- **Never overwrite** files in `create-if-absent` mode. If in doubt, skip and report.
- **Never write outside** `.cairn/` during the state-install loop.
- **Show the plan before writing.** Even if the user said "just install it" — one short
  preview is worth the friction.
- **If the user interrupts**, stop immediately and report current state.
- **If `.cairn/` doesn't exist**, create it — it is cairn's own namespace. No user
  confirmation needed to create a cairn-owned directory.
- **On Cowork, if file-tool writes fail with "blocked/protected location"**, fall back to
  the shell with the mount path (see Step 3). Don't interpret the block as "install
  failed" — it's a tooling-layer restriction, not an install-time error.

## Version pinning

The manifest and this file live on `main`. For a pinned version, fetch from a tag:

```
https://raw.githubusercontent.com/winnorton/cairn/v0.14.0/manifest.json
```

If the user invoked with `adopt ...@<tag>`, use that tag. Otherwise use `main`.

## Migration across version boundaries

Cairn is agent-targeted software. Migration for agent-targeted software does not require
migration *code* — a capable agent can read the old layout, read the new manifest, and
move what needs to move. What this section provides is the pattern, not tooling.

### When to invoke migration

Invoke the migration flow when:
- Step 3's fast-path detects a version marker AND the installed version is a major bump
  behind the target (e.g. installed `0.13.x`, target `0.14.0`).
- The local file layout visibly doesn't match the new manifest's expected layout.
- The user explicitly asks to migrate.

For patch-level bumps (`0.14.0` → `0.14.1`), migration is overkill — the re-adoption diff
flow below handles it.

### Migration flow

1. **Enumerate the installed habitat.** List every file currently at resolved cairn paths
   (`.cairn/` tree, and any legacy vendor-path cairn state for migrators — see
   environment notes below).

2. **Enumerate the new manifest.** Read the target's `files:` array.

3. **Build a mapping.** For each installed file, decide: **keep** (still present in target),
   **move** (path changed), **transform** (shape changed), or **retire** (no longer part of
   cairn). Where classification isn't obvious, read the body and classify, or ask the user.

4. **Present the plan to the user.** Show the full mapping before acting:
   ```
   Migrate cairn v0.13.x → v0.14.0

   Keep as-is:    <list>
   Move:          <old path> → <new path>
   Transform:     <old path> → <new path> (+ classification note)
   Retire:        <orphans — see deletion handling below>

   Proceed? (y/n)
   ```

5. **Execute.** Move/copy files using the right tool for the storage layer. Update every
   index (`MEMORY.md` top-level, type-subdirectory READMEs) to point at new paths.

6. **Handle deletion constraints with index tombstoning.** Some environments don't allow
   deleting files from their standard tools (Cowork's memory store is the known case).
   When deletion isn't possible: remove the orphan's entry from every index, then note its
   existence in the migration report as "orphaned-but-present." Orphaned-and-unindexed is
   functionally equivalent to deleted — agents load the index, not the directory listing.

7. **Write the new version marker** (`{cairnRoot}/cairn-version`). Report the full
   summary: installed, migrated, transformed, tombstoned.

### Environment notes for migration

**Cowork** has two distinct storage layers with different capabilities:

- **Bash mount** (`/sessions/<name>/mnt/...`): accessible via shell. Project `.claude/`
  lives here. <!-- migration-ref --> Deletion is supported.
- **Memory store** (`~/.claude/memory/`): <!-- migration-ref --> accessible via file tools,
  not shell. **Deletion is not supported from standard tools.** Use index tombstoning
  (step 6) when the old layout leaves orphans.

Use the right tool for each layer. Memory migrations are file-tool operations; `.claude/`
<!-- migration-ref --> migrations may need the shell fallback documented in Step 3.

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

State files installed to `.cairn/` by adopt:

| `src` | `.cairn/` destination | `role` | `tier` |
|---|---|---|---|
| `files/.cairn/CLAUDE.md` | `.cairn/CLAUDE.md` | essential | seed |
| `files/.cairn/memory/MEMORY.md` | `.cairn/memory/MEMORY.md` | essential | seed |
| `files/.cairn/LAWS.md` | `.cairn/LAWS.md` | scaffolding | grow |
| `files/.cairn/memory/user/README.md` | `.cairn/memory/user/README.md` | scaffolding | structure |
| `files/.cairn/memory/feedback/README.md` | `.cairn/memory/feedback/README.md` | scaffolding | structure |
| `files/.cairn/memory/project/README.md` | `.cairn/memory/project/README.md` | scaffolding | structure |
| `files/.cairn/memory/reference/README.md` | `.cairn/memory/reference/README.md` | scaffolding | structure |

Skills are distributed via package manager — not in this table. See Step 4a.

All entries use `mode: create-if-absent`. For the authoritative list, use the
manifest at runtime — this table may drift.

## v0.11.x → v0.12.x format migration note

v0.12.1 changes the skill format from flat `~/.claude/skills/<name>.md` <!-- migration-ref -->
to subdir `~/.claude/skills/<name>/SKILL.md` <!-- migration-ref -->. This is the canonical
Claude Code format, and flat-format skills don't reliably register as slash commands.
(v0.12.0 introduced `/note` and `/spec` under the old flat format; v0.12.1 migrated
everything to subdirs and is the version that actually fixes the slash-invocation issue.)

**For re-adopters:** the v0.12.x install will write the new subdir form alongside any
existing flat-format files (because `create-if-absent` only checks the new path). After a
successful install, you can remove the old flat duplicates at your leisure:

```bash
# Optional cleanup of v0.11.x flat-format skill files <!-- migration-ref -->
for skill in advocate audit bridge feedback plan prune reflect reframe resume tour; do
  [ -f ~/.claude/skills/$skill.md ] && rm ~/.claude/skills/$skill.md  # <!-- migration-ref -->
done
```

Skip this step if you've made local edits to your old flat-format skills — diff against
the new subdir versions first and merge by hand.

## v0.12.x → v0.13.0 law-numbering migration note

v0.13.0 drops numeric prefixes from law headings — slug becomes the only law identity.
Existing slug citations (`[LAW plan]`, `[LAW cadence]`) keep working unchanged. **But:**
legacy numeric citations (`[LAW 1]`, `[LAW 5]`) in your own notes, commits, or research
docs no longer resolve to a specific law in `/audit`'s output, because the
number-to-slug mapping is no longer in source-of-truth.

**For re-adopters with legacy `[LAW N]` citations:**

```bash
# Find legacy citations in notes/commits/docs
grep -rn '\[LAW [0-9]\+\]' . --include='*.md' --include='*.txt'
git log --all --grep='\[LAW [0-9]\+\]' --oneline
```

For each match, look up which slug the number corresponded to in *your* `LAWS.md` —
that's the historical mapping for *your* habitat. Convert by hand:

```
[LAW 1]  →  [LAW <slug-of-your-first-law>]
[LAW 2]  →  [LAW <slug-of-your-second-law>]
...
```

If you only had cairn's seed laws and never reordered them, the v0.12.x mapping was:
`1=plan, 2=confirm, 3=assumptions, 4=prefer-edit, 5=root-cause, 6=cadence`.

`/audit` will report any remaining numeric citations as "legacy citations needing manual
conversion to slug" — finishable in one sweep.

## v0.13.0 → v0.13.1 /review → /peer-review rename note

v0.13.1 renames cairn's `/review` skill to `/peer-review` to disambiguate from Claude
Code's built-in `/review` skill. In any Claude Code session, the bare `/review` trigger
resolves to the built-in — cairn's external-perspective review skill needs a distinct
namespace to be reachable.

**For re-adopters from any prior version that installed `/review`** (v0.12.1 onward):
the v0.13.1 install will write `~/.claude/skills/peer-review/SKILL.md` <!-- migration-ref -->
alongside any existing `~/.claude/skills/review/SKILL.md` <!-- migration-ref -->
(because `create-if-absent` only checks the new path). The legacy file lingers and
creates trigger ambiguity until cleaned up. The agent should detect the legacy file
and offer to remove it during re-adoption:

1. **Detect:** check whether `~/.claude/skills/review/SKILL.md` <!-- migration-ref -->
   exists in the user's resolved skills path.
2. **Inform the user:**

   > *"Detected legacy `review` skill from a prior cairn install at
   > `~/.claude/skills/review/SKILL.md`. <!-- migration-ref --> v0.13.1 renames this skill to `/peer-review`
   > to disambiguate from Claude Code's built-in `/review`. The skill body is
   > identical; only the directory name changed. Remove the legacy file? (y/n)"*

3. **On y:** delete `~/.claude/skills/review/SKILL.md` <!-- migration-ref --> and the empty parent
   `~/.claude/skills/review/` <!-- migration-ref --> directory. Report: *"Cleaned up legacy `review/`
   directory."*
4. **On n:** leave the file. Tell the user: *"Leaving the legacy file in place. Both
   names will be discoverable to the agent — `/review` (cairn legacy + Claude Code
   built-in, colliding) and `/peer-review` (cairn). Re-run cleanup when ready."*

Skip the prompt entirely if `~/.claude/skills/review/SKILL.md` <!-- migration-ref --> doesn't
exist (no legacy install). If you've made local edits to the skill body, diff against the
new `peer-review/SKILL.md` first and merge by hand before deleting.

**For citations in your own notes / commits / research docs:** any reference to the
legacy `/review` skill name still points at the same gap-class (external-perspective
review). Convert to `/peer-review` at your leisure; there's no audit gate against
legacy `/review` citations because the skill name isn't a tracked-citation form (slug
citations like `[LAW pre-merge-review]` are unaffected).

## v0.13.x → v0.14.0 migration note

v0.14.0 moves cairn state from vendor directories into `<project>/.cairn/`.
Skills now reach the harness via package manager rather than curl. The
install model is simpler but the paths are different.

**For re-adopters:** run `adopt cairn` in your project. The fast-path check
(Step 3) will detect your v0.13.x marker at `<project>/.claude/cairn-version` <!-- migration-ref -->
and trigger the re-adoption flow. The re-adoption
flow will write `.cairn/` state files alongside your existing `.claude/` tree.

**After re-adoption, migrate the vendor layout:**

1. **Move your LAWS.md.** Copy `<project>/.claude/LAWS.md` <!-- migration-ref -->
   to `<project>/.cairn/LAWS.md` (if you've customized it); then delete the
   old copy. If you haven't customized, the re-adoption already wrote the
   template; skip.

2. **Move your memory.** Copy files from `~/.claude/memory/` <!-- migration-ref -->
   (or `~/.claude/projects/<slug>/memory/`) <!-- migration-ref --> to
   `<project>/.cairn/memory/`. Update `MEMORY.md`'s index entries to the new paths.

3. **Remove stale vendor copies.** After confirming the `.cairn/` tree is
   correct, delete `<project>/.claude/cairn-version`, `<project>/.claude/LAWS.md`, <!-- migration-ref -->
   and any memory files you moved. Cairn no longer reads from those paths.

4. **Add the import line** (if not already added via Step 6). Append
   `@./.cairn/CLAUDE.md` to your `CLAUDE.md` (Claude Code/Cowork) or
   `AGENTS.md` (Pi/agy).

5. **Skill cleanup (Pi only).** If you have adopt-era skill copies at
   `~/.pi/agent/skills/` <!-- migration-ref --> that were installed by curl
   (pre-v0.14.0), remove them after installing `@winnorton/cairn-pi` — package
   copies take precedence but duplicates can shadow them.

6. **Skill cleanup (agy only).** If you have stale `~/.gemini/config/skills/` <!-- migration-ref -->
   copies (flat-format `.md` files or a legacy `review/`
   dir), remove them. Verified clean-up: delete the flat `.md` files and the
   `review/` subdir, leaving only the v0.13.1+ subdir-format skills (or remove
   all and rely on the plugin after WS03/WS04 ship).

This migration is user-driven; cairn does not automate vendor-dir cleanup.
