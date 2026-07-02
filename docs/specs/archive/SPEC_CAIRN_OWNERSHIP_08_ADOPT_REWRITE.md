# SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 02, 03, 04, 06 · **Parallel-safe-with:** — (Wave 2)

## Goal
Rewrite `adopt.md` so the install path performs **zero agent writes to vendor-owned config/skill dirs** — package-install + `.cairn/` state + a user-added import line.

## Scope
- New flow per harness: Claude → install `cairn` plugin (WS03); Pi → `pi install npm:@winnorton/cairn-pi`; agy → `agy plugin import claude` (WS04).
- State: agent writes `.cairn/**` (the only writes), fetched/validated per the WS-era `curl -sfL` + content-check already in adopt.
- The user-action Step (WS02): show the import line; user adds it.
- Remove the curl-into-`~/.claude/skills` / `.claude/LAWS.md` / vendor-memory loop entirely.
- Preserve the ephemeral-sandbox + don't-clone + don't-adopt-into-cairn pre-flights.

## Telemetry hook
N/A: markdown.

## Diagnostics path
Walk Step 1→end; grep that no step writes a vendor path; the install-integrity check (WS09) confirms a real install.

## Rollback story
`git revert`; `adopt.md` is fetched fresh per adoption (not a user-maintained file).

## Gate
`adopt.md` has zero vendor-dir write targets; skills come via package install; the import line is a user Step; pre-flights intact.

## Files
`adopt.md`.

---

## Pre-flight

The executor runs these commands before touching `adopt.md`. If any expected result does not hold, **STOP and surface the discrepancy** before Phase 1.

```powershell
# Shell dialect: PowerShell (Windows). Executor on POSIX: replace $() with $() — syntax identical.
# Run from repo root: C:/Users/winno/projects/cairn/cairn
```

**PF-1. Confirm adopt.md exists and is readable.**

```powershell
Test-Path adopt.md
```

Expected: `True`. If `False`: wrong working directory — `cd` to repo root.

**PF-2. Confirm current vendor-write lines exist (these are what we are removing).**

```powershell
Select-String -Path adopt.md -Pattern "~/.claude/skills|~/.pi/agent/skills|projectClaude.*LAWS" | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: a count > 0 (the old curl-to-vendor references are present). If 0: adopt.md may already be partially rewritten — inspect before proceeding.

**PF-3. Count vendor-path write references (establish baseline to verify complete removal).**

```powershell
Select-String -Path adopt.md -Pattern "~/.claude|~/.gemini|~/.pi|userMemory|userSkills|projectClaude" | Measure-Object | Select-Object -ExpandProperty Count
```

Record this count. Post-flight PF verification must confirm zero lines with these patterns remain outside `<!-- migration-ref -->` sentinel lines.

**PF-4. Confirm WS04 agy note is present (executor must not guess agy Step text).**

```powershell
Test-Path docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md
```

Expected: `True`. The agy Step text in Phase 3 is sourced from this note's "Verified facts" section. If WS04 has been elaborated and differs from the note, defer to WS04's output.

**PF-5. Confirm no other file is a dependency.**

```powershell
# This spec edits exactly one file. Verify the file list stub matches:
# Files section above says: adopt.md — the only file.
Write-Host "Editing: adopt.md only. Proceed."
```

---

## Phase 1 — Remove all vendor-dir write targets from the main install flow

**Goal:** Strip the four classes of vendor writes from adopt.md's Step 1–6 flow:
1. Skill curl-writes to `~/.claude/skills/` / `~/.pi/agent/skills/`
2. State curl-writes to `{projectClaude}/LAWS.md` and similar
3. Memory writes to `{userMemory}/` and subdirs
4. Version marker write to `{projectClaude}/cairn-version`

After this phase, the adopt.md flow declares `.cairn/` as the only write target; skill install is directed to package managers (text stubs for WS03/WS04-produced Step text).

### STEP 1.1 — Replace Step 3 path-resolution section (remove vendor variables; add `.cairn/`)

**Current content (adopt.md lines 183–268, the "Step 3 — Resolve paths" section):**

The section currently defines `{userClaude}`, `{userMemory}`, `{userSkills}`, `{projectClaude}`, `{projectRoot}` as install targets. All memory and skill resolutions point into `~/.claude/`, `~/.pi/agent/`, etc.

**Replacement — rewrite Step 3 entirely:**

```markdown
### Step 3 — Resolve the cairn state path

Cairn writes state to exactly one location: **`{projectRoot}/.cairn/`** — a
cairn-owned, project-local directory that is git-tracked inside the adopter's
repo. No memory, law, or context file lands in a vendor directory.

For all harnesses:
- `{cairnRoot}` → `<cwd>/.cairn` (the one cairn write target)

**Do not resolve `{userMemory}`, `{userSkills}`, or `{projectClaude}` as install
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
the end of a successful install — see Step 5.
```

**Why:** Removes all vendor-variable resolution from Step 3. Replaces `{projectClaude}/cairn-version` fast-path with `{cairnRoot}/cairn-version` per the stub's "also update Step 2's fast-path to read `{projectRoot}/.cairn/cairn-version`" note (coordinated with WS09).

### STEP 1.2 — Remove Step 4 (the preview) and Step 5 (the install) vendor-write content

**Current content (adopt.md lines 269–413, "Step 4 — Preview the plan" and "Step 5 — Install"):**

Step 4 lists files like `~/.claude/memory/MEMORY.md`, `~/.claude/skills/reframe/SKILL.md`, etc. as install destinations. Step 5 instructs the agent to `curl` each file to these vendor paths.

**Replacement — rewrite Step 4 and Step 5:**

```markdown
### Step 4a — Package install (skills reach the harness via package manager)

Skills are distributed as cairn-named packages installed by the vendor's own
tooling. **Do not curl skill files into vendor directories.**

Show the user the harness-appropriate package install command:

**Claude Code:**

```
cairn Claude Code plugin — install via:
  /install cairn
  (or: Settings → Extensions → search "cairn")
```

[EXECUTOR NOTE: Replace this placeholder with the exact install Step text
produced by WS03 (SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md) once elaborated.
WS03 owns the definitive Claude Code plugin install UX. Do not invent the
command — leave this as a clearly-marked stub if WS03 is not yet complete.]

**Pi (pi.dev):**

```
pi install npm:@winnorton/cairn-pi
```

This installs `spec`, `program`, `round-review`, `fast-execute`, `peer-review`,
and `note` as a Pi package (invoked as
`/skill:spec` etc.; add `-l` for a project-local install recorded in
`.pi/settings.json`). Version-locked to the cairn release; upgradable via Pi's
package manager.

**Antigravity CLI (agy):**

[EXECUTOR NOTE: Replace this placeholder with the exact install Step text
produced by WS04 (SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md) once elaborated.
WS04 owns the empirically-validated `agy plugin import claude` path. The agy
assessment note (docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md)
confirms `agy plugin import claude` exists and agy ingests Claude Code plugin
format; WS04 adds the validated install sequence. Do not write a speculative
agy install command here — leave as stub until WS04 delivers the Step text.]

Wait for the user to confirm the package is installed before proceeding to
Step 4b.

### Step 4b — Preview the `.cairn/` state install

After package install, show the user a compact preview of the state files that
will land in `.cairn/`:

```
cairn v0.14.0 — state install preview

State files (written to <cwd>/.cairn/):
  .cairn/CLAUDE.md            — cairn context sections (import this into your CLAUDE.md/AGENTS.md)
  .cairn/LAWS.md              — laws template + 6 seed laws
  .cairn/memory/MEMORY.md     — memory lookup entry point
  .cairn/memory/user/README.md
  .cairn/memory/feedback/README.md
  .cairn/memory/project/README.md
  .cairn/memory/reference/README.md
  .cairn/context/             — (reserved, not written now)
  .cairn/cairn-version        — version marker for re-adoption fast-path (written on success)

Will skip any file that already exists (create-if-absent mode).

Proceed? (y/n)
```

Show **absolute resolved paths**, not variable templates. If any destination
already exists, list it under "Skipping."

Wait for explicit user approval before proceeding.

**Do not include skill paths in this preview.** Skills reached the harness via
the package installer in Step 4a — they are not written by this flow.
```

**Why:** Severs the link between adopt's install loop and vendor skill/memory directories. The only "files" adopt now writes are the `.cairn/` state tree, which is fully cairn-owned.

### STEP 1.3 — Rewrite Step 5 as state-only curl install into `.cairn/`

**Current content (adopt.md lines 325–413, "Step 5 — Install"):**

The step currently iterates over the manifest's `files:` array and curl-writes each file to its `dest`, which resolves to vendor paths (`~/.claude/skills/`, etc.).

**Replacement:**

```markdown
### Step 5 — Install state files into `.cairn/`

For each file in the `.cairn/` state manifest (CLAUDE.md, LAWS.md, memory tree):

**Pre-flight: do NOT `git clone` the cairn repo into the workspace.** Fetch
specific files over HTTP — never pull cairn's entire source.

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
   which fetch failed, and stop.

If a fetch or write fails, stop and report the partial state clearly.
```

**Why:** The install loop now targets only `.cairn/` files (sourced from the reshaped `files/.cairn/` tree per WS01/WS06). No vendor path appears as a write target.

### STEP 1.4 — Rewrite Step 6 (version marker + import line + report)

**Current content (adopt.md lines 388–413, "Step 6 — Write version marker, then report"):**

Currently writes `{projectClaude}/cairn-version` (i.e., `.claude/cairn-version` — a vendor path). Also points user at `~/.claude/skills/tour/SKILL.md`.

**Replacement:**

```markdown
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
```

**Why:** Version marker moves from `.claude/cairn-version` to `.cairn/cairn-version` (the only cairn-owned path). Import line is shown as a user action, never written by the agent (program §2.2, §4 rule 3).

**CHECKPOINT — Phase 1**

Run this after completing all four steps above:

```powershell
# Shell dialect: PowerShell
# Verify no agent-write targets remain in the new Step 1–6 flow:
Select-String -Path adopt.md -Pattern "~/.claude|~/.gemini|~/.pi|userMemory|userSkills|projectClaude" |
  Where-Object { $_ -notmatch "migration-ref" }
```

Expected: zero matches. If any remain, identify which step reintroduced them and fix before Phase 2.

```powershell
# Verify version marker target is now .cairn/:
Select-String -Path adopt.md -Pattern "cairn-version"
```

Expected: all matches reference `.cairn/cairn-version`, not `.claude/cairn-version`.

If either check fails: re-read the failing section; apply the replacement again; re-run checkpoint.

---

## Phase 2 — Replace the "Detect environment" section and remove vendor-path skill-detection prose

**Goal:** The current Step 1 detection section instructs agents to probe for `~/.claude/`, `~/.pi/agent/`, and `~/.gemini/` to detect the harness. This is fine for detection (it's a read, not a write) but the section also contains prose about `{userSkills}` and `{userMemory}` resolution as install targets, which must be excised. The decision tree also needs an agy branch, per the agy note's "adopt.md gap" finding.

### STEP 2.1 — Remove skill + memory scope detection as install-target prose

**Current content (adopt.md lines 100–125, the "Claude Code only — also detect memory scope" and "Skills have the same dual-scope pattern" blocks):**

These blocks instruct the agent to resolve `{userMemory}` and `{userSkills}` paths for use as install destinations. They end with "Record the resolved memory root. Use it everywhere the manifest says `{userMemory}`."

**Replacement:** Delete both blocks entirely. Replace with a brief note:

```markdown
**Note on memory and skill paths.** Cairn no longer installs to `{userMemory}`
or `{userSkills}`. State lands in `{cairnRoot}` (`.cairn/`); skills reach the
harness via package manager. No `{userMemory}` / `{userSkills}` resolution is
needed.
```

**Why:** The dual-scope detection logic existed only to route install files to the correct vendor directory. With the vendor-write path removed, there is nothing to route.

### STEP 2.2 — Add agy branch to the Step 1 detection decision tree

**Current content (adopt.md lines 80–98, the detection decision tree):**

```markdown
Decision tree:

1. Are you running inside **Pi** (pi.dev)? ...
2. Are you running inside **Claude Code**? ...
3. Are you running inside **Cowork**? ...
4. None clear? → **Ask the user** ...

Note on Antigravity (Google): cairn's memory + skill layer adopts successfully into
Antigravity at `~/.gemini/antigravity/memory/` (validated empirically; ...
```

**Replacement:** The detection tree gains an agy branch; the Antigravity note is updated to reflect verified paths:

```markdown
Decision tree:

1. Are you running inside **Pi** (pi.dev)? Markers: system-prompt mentions Pi or
   pi-specific tool names; `~/.pi/agent/AGENTS.md` exists; the `pi` CLI is in PATH.
   → **Pi**.
2. Are you running inside **Claude Code**? Markers: claude-desktop entrypoint;
   `~/.claude/` exists; system prompt mentions Claude Code.
   → **Claude Code**.
3. Are you running inside **Antigravity CLI (agy)**? Markers: system-prompt
   mentions Antigravity or agy; `~/.gemini/config/` exists with plugins/ or
   skills/ subdirs; `agy` is in PATH.
   → **agy**.
4. Are you running inside **Cowork**? Markers: Cowork-specific workspace APIs,
   workspace marker file. → **Cowork**.
5. None clear? → **Ask the user** which environment they're in before continuing.

Note on Antigravity CLI (agy): agy's real config root is `~/.gemini/config/`
(global plugins + skills) and `<project>/.agents/skills/` for workspace skills
(binary-verified agy 1.0.7). The older `~/.gemini/antigravity/memory/` path is
stale — do not reference it. State lands in `<project>/.cairn/` (same as all
harnesses); skills reach agy via `agy plugin import claude` (Step 4a).
```

**Why:** The agy assessment note found the Antigravity section "predates the CLI entirely" and documents wrong paths. This fix grounds the detection in the binary-verified facts. The agy branch is added now even though the agy Step 4a text is a stub — detection can be correct before install is finalized.

**CHECKPOINT — Phase 2**

```powershell
# Verify the "Record the resolved memory root. Use it everywhere the manifest says {userMemory}" line is gone:
Select-String -Path adopt.md -Pattern "userMemory"
```

Expected: zero matches (or only lines that have been updated to clarify it is retired).

```powershell
# Verify agy detection branch exists:
Select-String -Path adopt.md -Pattern "Antigravity CLI|agy"
```

Expected: at least 2 matches (detection tree entry + the note).

If check fails: re-apply STEP 2.1 or 2.2; re-run checkpoint.

---

## Phase 3 — Update migration sections and add the `<!-- migration-ref -->` sentinel

**Goal:** The existing migration and re-adoption sections reference old vendor paths. Per program §4, every line that names a vendor path as instruction text to the user must carry `<!-- migration-ref -->`. Lines that tell cairn's install loop to write to a vendor path must be removed entirely (Phase 1 covered the main flow; this phase covers the migration + version-migration sections at the bottom of adopt.md).

### STEP 3.1 — Add `<!-- migration-ref -->` sentinels to every vendor-path reference in the migration section

**Current content (adopt.md lines 440–505, "Migration across version boundaries", "Migration flow", "Environment notes for migration"):**

These sections contain references to `~/.claude/memory/`, `{projectClaude}/cairn-version`, `~/.claude/skills/`, etc. as paths the user is instructed to read, copy, or tombstone during migration. These are INSTRUCTION text (the user reads them), not agent write targets — they are the correct use of vendor paths in a cairn file, per §4's migration-reference exception.

**Replacement:** Do not remove these references. Instead, append `<!-- migration-ref -->` to each line that names a vendor path. Example:

```markdown
- **Memory** (`~/.claude/memory/`) lives in Cowork's **persistent memory store** <!-- migration-ref -->
```

Apply the sentinel to every such line throughout the "Migration across version boundaries" section, the "Environment notes for migration" subsection, and the Re-adoption / upgrade section.

**Why:** The program's §5 DoD#1 grep (`rg -n "~/.claude|..." adopt.md | rg -v "migration-ref"`) must return zero. Any vendor-path string that legitimately belongs in migration instructions must carry the sentinel so the grep excludes it.

### STEP 3.2 — Update the v0.11.x → v0.12.x, v0.12.x → v0.13.0, and v0.13.0 → v0.13.1 migration notes

**Current content (adopt.md lines 567–657, the three legacy migration notes):**

These contain vendor-path references (e.g., `~/.claude/skills/$skill.md` in the bash cleanup snippet, `~/.claude/skills/peer-review/SKILL.md` in the rename note). These are user instruction text — legitimate per §4's exception.

**Replacement:** Append `<!-- migration-ref -->` to each vendor-path line within these three sections. The bash snippet in the v0.11.x note also needs the sentinel on the comment line that references it:

```bash
# Optional cleanup of v0.11.x flat-format skill files <!-- migration-ref -->
for skill in advocate audit bridge feedback plan prune reflect reframe resume tour; do
  [ -f ~/.claude/skills/$skill.md ] && rm ~/.claude/skills/$skill.md  # <!-- migration-ref -->
done
```

**Why:** Same as STEP 3.1 — sentinel marks instruction text, not write targets.

### STEP 3.3 — Add a v0.13.x → v0.14.0 migration note

**Current content:** No v0.14.0 migration note exists. The file ends after the v0.13.0 → v0.13.1 note.

**Replacement:** Append the following section to the bottom of adopt.md:

```markdown
## v0.13.x → v0.14.0 migration note

v0.14.0 moves cairn state from vendor directories into `<project>/.cairn/`.
Skills now reach the harness via package manager rather than curl. The
install model is simpler but the paths are different.

**For re-adopters:** run `adopt cairn` in your project. The fast-path check
(Step 3) will detect your v0.13.x marker at `<project>/.claude/cairn-version`
<!-- migration-ref --> and trigger the re-adoption flow. The re-adoption
flow will write `.cairn/` state files alongside your existing `.claude/` tree.

**After re-adoption, migrate the vendor layout:**

1. **Move your LAWS.md.** Copy `<project>/.claude/LAWS.md` <!-- migration-ref -->
   to `<project>/.cairn/LAWS.md` (if you've customized it); then delete the
   old copy. If you haven't customized, the re-adoption already wrote the
   template; skip.

2. **Move your memory.** Copy files from `~/.claude/memory/` <!-- migration-ref -->
   (or `~/.claude/projects/<slug>/memory/`) to `<project>/.cairn/memory/`.
   Update `MEMORY.md`'s index entries to the new paths.

3. **Remove stale vendor copies.** After confirming the `.cairn/` tree is
   correct, delete `<project>/.claude/cairn-version`, `<project>/.claude/LAWS.md`,
   and any memory files you moved. <!-- migration-ref --> Cairn no longer reads
   from those paths.

4. **Add the import line** (if not already added via Step 6). Append
   `@./.cairn/CLAUDE.md` to your `CLAUDE.md` (Claude Code/Cowork) or
   `AGENTS.md` (Pi/agy).

5. **Skill cleanup (Pi only).** If you have adopt-era skill copies at
   `~/.pi/agent/skills/` <!-- migration-ref --> that were installed by curl
   (pre-v0.14.0), remove them after installing `@winnorton/cairn-pi` — package
   copies take precedence but duplicates can shadow them.

6. **Skill cleanup (agy only).** If you have stale `~/.gemini/config/skills/`
   <!-- migration-ref --> copies (flat-format `.md` files or a legacy `review/`
   dir), remove them. Verified clean-up: delete the flat `.md` files and the
   `review/` subdir, leaving only the v0.13.1+ subdir-format skills (or remove
   all and rely on the plugin after WS03/WS04 ship).

This migration is user-driven; cairn does not automate vendor-dir cleanup.
```

**Why:** DoD #5 (program §5) requires the migration section covers v0.13.x → `.cairn/` and the stale-residue cleanup. This step provides that coverage. Every vendor-path reference carries `<!-- migration-ref -->`.

**CHECKPOINT — Phase 3**

```powershell
# The DoD#1 verification: no vendor-path strings without migration-ref sentinel
Select-String -Path adopt.md -Pattern "~/.claude|~/.gemini|~/.pi|userMemory" |
  Where-Object { $_ -notmatch "migration-ref" }
```

Expected: zero matches. Every surviving vendor-path reference is a user instruction line carrying `<!-- migration-ref -->`.

```powershell
# Confirm migration-ref sentinel is present:
Select-String -Path adopt.md -Pattern "migration-ref" | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: count >= 10 (the v0.14.0 note alone accounts for ~8; the legacy sections add more).

```powershell
# Confirm v0.14.0 migration note section exists:
Select-String -Path adopt.md -Pattern "v0.13.x.*v0.14.0|v0.14.0 migration"
```

Expected: at least 1 match (the new section header).

If any check fails: re-apply the failing step; re-run checkpoint.

---

## Phase 4 — Update the manifest reference table and Safety rules section

**Goal:** The "Manifest reference" table at the bottom of adopt.md lists old install destinations (e.g., `~/.claude/memory/MEMORY.md`). The "Safety rules" section references `~/.claude/`. Both must be updated to reflect the new model.

### STEP 4.1 — Replace the manifest reference table

**Current content (adopt.md lines 536–565, "## Manifest reference (quick lookup)"):**

The table has columns `src | dest (Claude Code) | role | tier` with rows like `| files/memory/MEMORY.md | ~/.claude/memory/MEMORY.md | essential | seed |`.

**Replacement:**

```markdown
## Manifest reference (quick lookup)

State files installed to `.cairn/` by adopt:

| `src` | `.cairn/` destination | `role` | `tier` |
|---|---|---|---|
| `files/.cairn/CLAUDE.md` | `.cairn/CLAUDE.md` | essential | seed |
| `files/.cairn/LAWS.md` | `.cairn/LAWS.md` | scaffolding | grow |
| `files/.cairn/memory/MEMORY.md` | `.cairn/memory/MEMORY.md` | essential | seed |
| `files/.cairn/memory/user/README.md` | `.cairn/memory/user/README.md` | scaffolding | structure |
| `files/.cairn/memory/feedback/README.md` | `.cairn/memory/feedback/README.md` | scaffolding | structure |
| `files/.cairn/memory/project/README.md` | `.cairn/memory/project/README.md` | scaffolding | structure |
| `files/.cairn/memory/reference/README.md` | `.cairn/memory/reference/README.md` | scaffolding | structure |

Skills are distributed via package manager — not in this table. See Step 4a.

All entries use `mode: create-if-absent`. For the authoritative list, use the
manifest at runtime — this table may drift.
```

**Why:** The table currently shows vendor destinations. WS01 moves the source tree to `files/.cairn/` and WS06 moves the dest to `{projectRoot}/.cairn/`. The new table reflects both changes. Skill entries are removed because they are no longer adopt's responsibility.

### STEP 4.2 — Update the Safety rules section

**Current content (adopt.md lines 417–427, "## Safety rules"):**

```markdown
- **If `~/.claude/` or equivalent doesn't exist**, ask the user before creating it.
```

**Replacement:** Remove that bullet (it references a vendor dir that adopt no longer creates). Replace with:

```markdown
- **If `.cairn/` doesn't exist**, create it — it is cairn's own namespace. No user
  confirmation needed to create a cairn-owned directory.
- **Never write outside `.cairn/`** during the state-install loop.
```

Keep all other Safety rules bullets unchanged.

**Why:** The `~/.claude/` creation check guarded against cairn creating a vendor dir the user didn't expect. With the model flipped (cairn owns `.cairn/`, not `~/.claude/`), creating `.cairn/` needs no guard — it's cairn's namespace.

**CHECKPOINT — Phase 4**

```powershell
# Full DoD#1 check: zero vendor-path strings without migration-ref (re-run after Phase 4):
Select-String -Path adopt.md -Pattern "~/.claude|~/.gemini|~/.pi|userMemory|userSkills|projectClaude" |
  Where-Object { $_ -notmatch "migration-ref" }
```

Expected: **zero matches**. This is the final gate before post-flight.

```powershell
# Confirm the new manifest table references .cairn/ destinations:
Select-String -Path adopt.md -Pattern "\.cairn/CLAUDE|\.cairn/memory|\.cairn/LAWS"
```

Expected: at least 4 matches (the table rows).

```powershell
# Confirm old vendor-path manifest rows are gone:
Select-String -Path adopt.md -Pattern "~/.claude/memory/MEMORY|~/.claude/skills"
```

Expected: zero matches (outside any migration-ref lines).

If any check fails: re-apply the failing step; re-run checkpoint.

---

## Post-flight

Run these verifications after all four phases are complete, before filing the commit.

**PF-A. DoD#1 — the program-level ownership grep:**

```powershell
# PowerShell
Select-String -Path adopt.md, manifest.json -Pattern "~/.claude|~/.gemini|~/.pi/agent|projectClaude/LAWS|userMemory" |
  Where-Object { $_ -notmatch "migration-ref" }
```

```bash
# POSIX (equivalent for POSIX executors)
rg -n "~/.claude|~/.gemini|~/.pi/agent|projectClaude.*LAWS|userMemory" adopt.md manifest.json | rg -v "migration-ref"
```

Expected: zero lines. **If non-zero: STOP. Do not commit. Fix the offending line(s) and re-run.**

**PF-B. Import line appears as user-action text only (never in a write loop):**

```powershell
Select-String -Path adopt.md -Pattern "@\./.cairn/CLAUDE\.md"
```

Expected: matches found only inside a user-instruction block (the Step 6 "Action required" callout), not inside a file-write command or manifest entry.

**PF-C. Version marker target is `.cairn/`:**

```powershell
Select-String -Path adopt.md -Pattern "cairn-version"
```

Expected: all matches reference `.cairn/cairn-version`, not `.claude/cairn-version`.

**PF-D. agy Step placeholder is clearly marked:**

```powershell
Select-String -Path adopt.md -Pattern "EXECUTOR NOTE.*WS04|WS04.*EXECUTOR NOTE"
```

Expected: at least 1 match (the placeholder in Step 4a for agy). If the executor has access to WS04's finalized Step text, replace the placeholder; otherwise leave it clearly marked.

**PF-E. Pre-flight checks preserved (don't-clone + ephemeral-sandbox):**

```powershell
Select-String -Path adopt.md -Pattern "do NOT.*git clone|ephemeral sandbox"
```

Expected: both strings present (the don't-clone pre-flight in Step 5 and the ephemeral-sandbox pre-flight in Step 1).

**PF-F. File count sanity (adopt.md must not have been accidentally truncated):**

```powershell
(Get-Content adopt.md | Measure-Object -Line).Lines
```

Expected: a count substantially greater than the current ~657 lines (the rewrite adds Phase 3's migration note, the Step 4a package-install text, etc.). A count below 400 indicates accidental truncation — abort and `git restore adopt.md`.

**Commit message template:**

```
feat(adopt): rewrite to zero vendor-dir writes (WS08)

- Remove curl-to-~/.claude/skills, ~/.pi/agent/skills, .claude/LAWS.md install loop
- State now written only to <project>/.cairn/ (WS01 layout)
- Skills reach harness via package manager: cairn Claude plugin (WS03), cairn-pi npm (Pi), agy import claude stub (WS04 placeholder)
- Import line shown as user-action Step; agent never writes CLAUDE.md/AGENTS.md (WS02 contract)
- Version marker moves from {projectClaude}/cairn-version to {cairnRoot}/cairn-version
- agy detection branch added; stale ~/.gemini/antigravity/ paths corrected to ~/.gemini/config/
- All surviving vendor-path strings in migration sections carry <!-- migration-ref --> sentinel
- v0.13.x → v0.14.0 migration note added

Closes WS08. Program §5 DoD#1: zero vendor-path strings without migration-ref sentinel.
[LAW own-your-namespace]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Archive move (run after peer-review, not before):**

```powershell
# PowerShell — run only after /peer-review passes with no blockers
git mv docs/specs/SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE.md docs/specs/archive/SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE.md
```

---

## Executor Handoff

**Three files to read first, in order:**

1. `C:/Users/winno/projects/cairn/cairn/docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` — §4 (hard contract / forbidden write targets / sentinel), §2.1 (`.cairn/` layout), §2.2 (import line). These are load-bearing constraints; re-read §4 before every step.
2. `C:/Users/winno/projects/cairn/cairn/adopt.md` — the current file you are rewriting. Read it end-to-end first to understand the structure before editing.
3. `C:/Users/winno/projects/cairn/cairn/docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md` — "Verified facts (agy 1.0.7)" and "adopt.md gap" sections. These are the only agy facts on file; do not invent agy Step text beyond what they support.

**Step 3 is the fast-path re-adoption check.** The program master (§9.5 integration notes, WS09 cross-reference) refers to a "Step 2 fast-path"; in this rewrite that logic lands in **Step 3** ("Resolve the cairn state path" — the `cairn-version` marker check). WS09's reference to the fast-path resolves to Step 3 of this rewritten `adopt.md`.

**The one constraint most likely to cause a mistake:**

WS04 is not yet elaborated. The agy install Step in adopt.md (Step 4a, agy branch) must remain a clearly-marked placeholder until WS04 delivers its empirically-validated `agy plugin import claude` sequence. Do not write a speculative agy install command — it will be wrong or outdated. The placeholder text is the correct output for WS08 acting before WS04.

**Recovery for common failures:**

- *Pre-flight PF-2 shows count = 0 (vendor writes already removed):* Someone ran a partial rewrite. Read the current adopt.md carefully; apply only the steps whose target sections still differ from the spec. Run all checkpoints.
- *DoD#1 grep still returns matches after Phase 4:* Find the specific pattern match; check whether it is migration-instruction text (add sentinel) or an actual agent-write instruction (remove entirely). Re-run PF-A.
- *adopt.md line count drops below 400:* Accidental truncation. Run `git restore adopt.md` and restart from Pre-flight.
- *WS04 delivers its Step text mid-execution:* Replace the WS04 placeholder in Step 4a with WS04's exact text, then continue. No other phase is affected.
- *WS01 or WS06 is not yet complete:* The `files/.cairn/` source paths in Phase 4's manifest table (STEP 4.1) depend on WS01's file move. If WS01 is not done, the table references `files/.cairn/` paths that don't exist yet. In that case: write the table with the WS01-shaped paths as described (they are the target state), and note in the commit that WS01 must land before this commit goes to main.

---

## Review Checklist

A fresh reviewer (not the executor) checks:

- [ ] `adopt.md` contains zero agent write commands targeting `~/.claude/`, `~/.gemini/config/`, `~/.pi/agent/`, `{projectClaude}`, `{userMemory}`, or `{userSkills}` in the main install flow (Steps 1–6).
- [ ] Every surviving vendor-path string in migration sections carries `<!-- migration-ref -->`.
- [ ] The DoD#1 grep (`rg -n "~/.claude|~/.gemini|~/.pi/agent|projectClaude.*LAWS|userMemory" adopt.md | rg -v "migration-ref"`) returns zero.
- [ ] The import line (`@./.cairn/CLAUDE.md`) appears only in user-instruction text, never in a write command.
- [ ] The version marker target is `{cairnRoot}/cairn-version` (`.cairn/`), not `.claude/cairn-version`.
- [ ] The agy Step 4a block is either WS04's finalized text or a clearly-marked placeholder — not a speculative command.
- [ ] The v0.13.x → v0.14.0 migration note covers vendor-residue cleanup for Pi and agy.
- [ ] The don't-clone and ephemeral-sandbox pre-flights from the original adopt.md are preserved.
- [ ] No other file was modified (this spec targets `adopt.md` only).
- [ ] The commit message cites `[LAW own-your-namespace]` and references the DoD#1 grep result.
