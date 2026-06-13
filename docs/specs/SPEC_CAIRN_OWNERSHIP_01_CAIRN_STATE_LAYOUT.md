# SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 12 (NOT parallel-safe with WS02 on `files/.cairn/CLAUDE.md` — WS01 owns the body via `git mv`, WS02 prepends its header after; see master §9.5)

## Goal
Define and template the cairn-owned `<project>/.cairn/` state directory — the namespace that replaces every vendor-dir cairn write.

## Scope
- The §2.1 tree: `.cairn/{CLAUDE.md, LAWS.md, memory/{MEMORY.md, user/, feedback/, project/, reference/}, context/, sessions/, cairn-version}`.
- Relocate the template tree from `files/{CLAUDE.md,LAWS.md,memory/}` → `files/.cairn/...` (mirrors the parked prototype's `files/agents/` move, but to `.cairn/`).
- Create `files/.cairn/sessions/` as a reserved, empty directory — HIVE-owned (§2.6); this workstream creates it but does NOT own or populate it.
- Establish that ALL cairn state is git-tracked inside the adopter's repo; no `~/.*` or `.claude`/`.agents` write target.
- This workstream does NOT seed `<project>/CLAUDE.md` — that file is fully user-owned per master §2.1/§3; the manifest carries no `{projectRoot}/CLAUDE.md` entry.
- `files/.cairn/CLAUDE.md` is owned by this workstream (via `git mv`). WS02 runs AFTER this workstream on that file and ONLY prepends a header — see "WS01↔WS02 ordering" note below.
- Freeze the layout as Contract §2.1 for Wave 1.

## WS01↔WS02 ordering — `files/.cairn/CLAUDE.md` is NOT parallel-safe

This workstream (WS01) owns the **body** of `files/.cairn/CLAUDE.md` via `git mv` from `files/CLAUDE.md`. WS02 (import-bridge) runs **after** WS01 on this file and **only prepends a header** — it never overwrites the body. Per master §9.5, these two workstreams are both Wave 0 but are **NOT parallel-safe** with respect to `files/.cairn/CLAUDE.md`. The integration order is strict: WS01 lands first; WS02 prepends after.

Executor constraint: do not run WS01 and WS02 simultaneously in the same worktree or with overlapping edits to `files/.cairn/CLAUDE.md`. The sequencing is enforced at integration time, not by git — both workstreams may author in separate worktrees, but `files/.cairn/CLAUDE.md` must be resolved by first merging WS01, then applying WS02's header-prepend on top.

## Telemetry hook
N/A: markdown framework, no runtime telemetry.

## Diagnostics path
Defines (does not implement) the install-integrity check consumed by WS09: "does `.cairn/` exist with the required files, AND is the import line present in the context file?"

## Rollback story
Pre-production for the template itself → `git revert`. For adopters the dir is additive (`create-if-absent`), so no destructive change.

## Gate
A fresh `adopt` produces the §2.1 tree exactly; a CHECKPOINT grep confirms structure and that no file lands outside `<project>/.cairn/`.

## Files
`files/.cairn/**` (moved from `files/`), coordinate dests with WS06 (`manifest.json`).

---

## Pre-flight

Run these commands **before Phase 1**. Each has an expected result. If any expectation fails, STOP and surface before continuing.

```powershell
# Shell: PowerShell (Windows executor). POSIX-equivalent shown in comments.
# All paths relative to the cairn repo root.

# PF-1: Confirm you are in the cairn repo root
git rev-parse --show-toplevel
# Expected: absolute path ending in \cairn  (e.g. C:\Users\winno\projects\cairn\cairn)
# HALT if: output is any other directory

# PF-2: Confirm the three template source files exist at their OLD locations
Test-Path files\CLAUDE.md; Test-Path files\LAWS.md; Test-Path files\memory\MEMORY.md
# Expected: True; True; True (all three)
# HALT if: any returns False — source is already moved or was never there; investigate

# PF-3: Confirm files/.cairn/ does NOT yet exist (this spec creates it)
Test-Path files\.cairn
# Expected: False
# HALT if: True — .cairn/ already exists; check what's in it and reconcile before proceeding

# PF-4: Confirm the memory subdirectory READMEs exist
@("files\memory\feedback\README.md","files\memory\project\README.md",
  "files\memory\reference\README.md","files\memory\user\README.md") |
  ForEach-Object { Test-Path $_ }
# Expected: True; True; True; True
# HALT if: any returns False — memory subdirectory is incomplete; do not proceed

# PF-5: Count existing references to old template paths in the entire repo
# (establishes the baseline; Phase 3 will update the files this spec owns)
rg -c "files/CLAUDE\.md|files/LAWS\.md|files/memory" --type md --type json 2>&1 |
  Select-String -Pattern "\d+$"
# Expected: non-zero output (confirms references exist that later phases will update)
# HALT if: zero lines — something is already renamed; check git status

# PF-6: Confirm git working tree is clean (or at least that files/ is unmodified)
git status --short -- files/
# Expected: empty output (no staged or unstaged changes under files/)
# HALT if: any output — stash or commit changes under files/ before this spec runs
```

---

## Phase 1 — Create the `files/.cairn/` directory skeleton

**Goal:** create the new destination directory tree under `files/.cairn/` with empty placeholder files so the structure is visible and greppable before any content moves.

### STEP 1.1 — Create `files/.cairn/` and the `context/` placeholder

**Current state:** `files/.cairn/` does not exist.

**Replacement (create):**

```powershell
# Shell: PowerShell
New-Item -ItemType Directory -Path files\.cairn\memory\feedback -Force | Out-Null
New-Item -ItemType Directory -Path files\.cairn\memory\project  -Force | Out-Null
New-Item -ItemType Directory -Path files\.cairn\memory\reference -Force | Out-Null
New-Item -ItemType Directory -Path files\.cairn\memory\user     -Force | Out-Null
New-Item -ItemType Directory -Path files\.cairn\context         -Force | Out-Null
New-Item -ItemType Directory -Path files\.cairn\sessions        -Force | Out-Null
```

```bash
# POSIX equivalent
mkdir -p files/.cairn/memory/{feedback,project,reference,user} files/.cairn/context files/.cairn/sessions
```

**Why:** `git mv` (Phase 2) requires the parent directories to exist. Creating them now makes the skeleton greppable and confirms there are no permission issues before content moves. `sessions/` is created here as a reserved placeholder — it is HIVE-owned (master §2.6) and must exist in the skeleton so adopters have the directory from day one; this workstream does NOT populate it.

**After this step:** `ls files/.cairn/` shows `memory/`, `context/`, and `sessions/`. All are empty.

---

### STEP 1.2 — Create the `cairn-version` marker file

**Current state:** no `cairn-version` file exists anywhere in `files/`.

**Replacement (create `files/.cairn/cairn-version`):**

```
0.14.0
```

The file contains exactly one line: the target version string `0.14.0`. No trailing newline variations matter — just keep it a single line. The version token must match `VERSION` at repo root (WS09 install-integrity check reads both).

```powershell
# Shell: PowerShell
Set-Content -Path files\.cairn\cairn-version -Value "0.14.0" -NoNewline
```

```bash
# POSIX equivalent
printf '0.14.0' > files/.cairn/cairn-version
```

**Why:** `§2.1` requires `cairn-version` in the layout. WS09 install-integrity check probes `{projectRoot}/.cairn/cairn-version`. The file must exist in the template source so `adopt` can deliver it.

**After this step:** `Get-Content files\.cairn\cairn-version` prints `0.14.0`.

---

**CHECKPOINT after Phase 1**

```powershell
# Shell: PowerShell
# CP-1a: skeleton directories exist
Test-Path files\.cairn\memory\feedback; Test-Path files\.cairn\memory\project
Test-Path files\.cairn\memory\reference; Test-Path files\.cairn\memory\user
Test-Path files\.cairn\context; Test-Path files\.cairn\sessions
# Expected: True for each (sessions/ is the HIVE-reserved slot — created empty)

# CP-1b: cairn-version file present and correct
Get-Content files\.cairn\cairn-version
# Expected: 0.14.0

# CP-1c: old source files still untouched
Test-Path files\CLAUDE.md; Test-Path files\LAWS.md; Test-Path files\memory\MEMORY.md
# Expected: True; True; True (Phase 2 will move them)
```

If CP-1a or CP-1b fail: delete `files\.cairn\` and re-run STEP 1.1–1.2.
If CP-1c fails: STOP — someone else moved them; reconcile before Phase 2.

---

## Phase 2 — Move template files into `files/.cairn/`

**Goal:** relocate `files/CLAUDE.md`, `files/LAWS.md`, and the entire `files/memory/` tree into `files/.cairn/` via `git mv` so git history tracks the rename.

**Critical rule:** use `git mv`, never `mv` or `Copy-Item`. `git mv` stages the rename; a plain move leaves git seeing an untracked add + a delete, which breaks `git log --follow` and confuses the diff in peer-review.

### STEP 2.1 — Move `files/CLAUDE.md` → `files/.cairn/CLAUDE.md`

**Current state:** `files/CLAUDE.md` — the adopter CLAUDE.md template (the "Project / Effort Name — Agent Context" shape). Line 39 references `.claude/LAWS.md` — that reference must be updated in Phase 3 STEP 3.3.

**Move:**

```powershell
# Shell: PowerShell
git mv files\CLAUDE.md files\.cairn\CLAUDE.md
```

```bash
# POSIX equivalent
git mv files/CLAUDE.md files/.cairn/CLAUDE.md
```

**Why:** the source of truth for the CLAUDE.md template moves to the cairn-owned namespace. WS06 will update `manifest.json` `"src"` field from `"files/CLAUDE.md"` to `"files/.cairn/CLAUDE.md"`.

---

### STEP 2.2 — Move `files/LAWS.md` → `files/.cairn/LAWS.md`

**Current state:** `files/LAWS.md` — the Laws template (schema doc + 7 seed laws). No internal path references need updating (the only external-path mention is the meta-laws GitHub URL, which is not a cairn path).

**Move:**

```powershell
# Shell: PowerShell
git mv files\LAWS.md files\.cairn\LAWS.md
```

```bash
# POSIX equivalent
git mv files/LAWS.md files/.cairn/LAWS.md
```

**Why:** same ownership reason as STEP 2.1. WS06 updates `manifest.json` `"src"` from `"files/LAWS.md"` to `"files/.cairn/LAWS.md"`.

---

### STEP 2.3 — Move `files/memory/MEMORY.md` → `files/.cairn/memory/MEMORY.md`

**Current state:** `files/memory/MEMORY.md` — the top-level memory index template. No internal cairn-path references; all links are relative (`user/README.md` etc.) and will resolve correctly after move.

**Move:**

```powershell
# Shell: PowerShell
git mv files\memory\MEMORY.md files\.cairn\memory\MEMORY.md
```

```bash
# POSIX equivalent
git mv files/memory/MEMORY.md files/.cairn/memory/MEMORY.md
```

**Why:** memory template belongs in the cairn-owned layout. WS06 updates `manifest.json` `"src"` from `"files/memory/MEMORY.md"` to `"files/.cairn/memory/MEMORY.md"`.

---

### STEP 2.4 — Move the four memory-type READMEs

**Current state:** four files at `files/memory/{feedback,project,reference,user}/README.md`.

**Move (one command per file; keep them discrete for review):**

```powershell
# Shell: PowerShell
git mv files\memory\feedback\README.md  files\.cairn\memory\feedback\README.md
git mv files\memory\project\README.md   files\.cairn\memory\project\README.md
git mv files\memory\reference\README.md files\.cairn\memory\reference\README.md
git mv files\memory\user\README.md      files\.cairn\memory\user\README.md
```

```bash
# POSIX equivalent
git mv files/memory/feedback/README.md  files/.cairn/memory/feedback/README.md
git mv files/memory/project/README.md   files/.cairn/memory/project/README.md
git mv files/memory/reference/README.md files/.cairn/memory/reference/README.md
git mv files/memory/user/README.md      files/.cairn/memory/user/README.md
```

**Why:** four sub-type READMEs are part of the §2.1 layout. WS06 updates `manifest.json` `"src"` fields for all four.

---

### STEP 2.5 — Remove the now-empty `files/memory/` directories

After STEP 2.4, `files/memory/{feedback,project,reference,user}/` are empty; `files/memory/` itself is empty. Git does not track empty directories, so no explicit removal is needed — but confirm git sees the directories as gone.

```powershell
# Shell: PowerShell
git status --short -- files\memory\
# Expected: entries like 'D  files/memory/MEMORY.md' and 'D  files/memory/...README.md'
# (all deletions are already staged by the git mv commands above)
```

If any subdirectory entries show as untracked instead of staged deletions, re-run the `git mv` for those files.

**After STEP 2.5:** `Test-Path files\memory` returns False (or the directory exists but is empty and untracked — acceptable). `files\CLAUDE.md` and `files\LAWS.md` are gone. `git status --short -- files\` shows only staged renames (R-prefixed lines) and `files\.cairn\cairn-version` as a new untracked or staged-add.

Stage `cairn-version`:
```powershell
git add files\.cairn\cairn-version
```

---

**CHECKPOINT after Phase 2**

```powershell
# Shell: PowerShell
# CP-2a: new locations exist
@("files\.cairn\CLAUDE.md","files\.cairn\LAWS.md",
  "files\.cairn\memory\MEMORY.md",
  "files\.cairn\memory\feedback\README.md",
  "files\.cairn\memory\project\README.md",
  "files\.cairn\memory\reference\README.md",
  "files\.cairn\memory\user\README.md",
  "files\.cairn\cairn-version") |
  ForEach-Object { Test-Path $_ }
# Expected: True for all 8

# CP-2b: old locations are gone
Test-Path files\CLAUDE.md; Test-Path files\LAWS.md; Test-Path files\memory\MEMORY.md
# Expected: False; False; False

# CP-2c: git index shows staged renames (R prefix)
git status --short -- files\
# Expected: lines like 'R  files/CLAUDE.md -> files/.cairn/CLAUDE.md' (7 renames + 1 new add)
# HALT if: any D (deletion without corresponding addition) — a git mv failed

# CP-2d: no file has landed outside files/.cairn/ (this workstream's invariant)
rg -rn "." files\CLAUDE.md 2>$null; rg -rn "." files\LAWS.md 2>$null
# Expected: no output (files are gone from old paths)
```

If CP-2a fails for any file: the `git mv` for that file failed. Check git status, then re-run the specific `git mv`.
If CP-2b shows True: a file was not moved. Run the corresponding `git mv` step again.
If CP-2c shows plain D lines: the file was deleted without being git-moved to the new path. Run `git add files/.cairn/<name>` to stage the add side.

---

## Phase 3 — Update in-cairn-repo references (this workstream's scope only)

**Goal:** update the two files this workstream owns (the `reflect` skill and `files/.cairn/CLAUDE.md`) to reference the new paths. Leave `manifest.json`, `adopt.md`, `AGENTS.md`, `HANDOFF.md`, and `README.md` for their owning workstreams (WS06, WS08, WS10).

**Scope boundary:** this spec ONLY edits files under `files/skills/` and `files/.cairn/`. It does NOT touch `manifest.json` (WS06), `adopt.md` (WS08), `AGENTS.md`/`README.md`/`HANDOFF.md` (WS10).

### STEP 3.1 — Update `files/skills/reflect/SKILL.md` — old memory/project path

**Current state** (line 96):
```
   See `files/memory/project/README.md` for the layout rule.
```

**Replacement:**
```
   See `files/.cairn/memory/project/README.md` for the layout rule.
```

**Why:** the reference points at the source template path a maintainer or contributor would open. After the move the correct location is `files/.cairn/memory/project/README.md`.

**Edit command:**

```powershell
# Shell: PowerShell
# Use the Edit tool (preferred) or:
(Get-Content files\skills\reflect\SKILL.md -Raw) `
  -replace 'files/memory/project/README\.md', 'files/.cairn/memory/project/README.md' |
  Set-Content files\skills\reflect\SKILL.md -NoNewline
```

Verify:
```powershell
rg "cairn/memory/project/README" files\skills\reflect\SKILL.md
# Expected: one match on the corrected line
rg "files/memory/project/README" files\skills\reflect\SKILL.md
# Expected: zero matches (old path gone)
```

---

### STEP 3.2 — Update `files/.cairn/LAWS.md` — internal cross-reference check

**Current state:** read `files/.cairn/LAWS.md` (formerly `files/LAWS.md`) and search for any `files/memory` or `files/CLAUDE.md` self-references.

```powershell
rg "files/(CLAUDE|LAWS|memory)" files\.cairn\LAWS.md
```

**Expected:** zero matches (the LAWS.md template contains no cairn-path self-references; all its references are to `LAWS.md` as the reader's own project laws, or to a GitHub URL for the meta-laws document).

**Action:** if zero matches — no edit needed, move on. If any matches found — update each to the new `files/.cairn/...` path.

---

### STEP 3.3 — Update `files/.cairn/CLAUDE.md` — stale `.claude/LAWS.md` pointer

**Current state** (line 39 of `files/.cairn/CLAUDE.md`, formerly `files/CLAUDE.md`):
```markdown
See [LAWS.md](.claude/LAWS.md) for the non-negotiable rules for this effort.
```

This link points at `.claude/LAWS.md` — a vendor-path under the v0.13.x model. Under the new model LAWS.md lives at `.cairn/LAWS.md` in the adopter's project.

**Replacement:**
```markdown
See [LAWS.md](.cairn/LAWS.md) for the non-negotiable rules for this effort.
```

**Why:** `.cairn/LAWS.md` is the correct destination path once WS08's adopt completes. The template must describe the post-migration world, not the v0.13.x vendor path.

**Edit command:**

```powershell
# Shell: PowerShell
(Get-Content files\.cairn\CLAUDE.md -Raw) `
  -replace '\(\.claude/LAWS\.md\)', '(.cairn/LAWS.md)' |
  Set-Content files\.cairn\CLAUDE.md -NoNewline
```

Verify:
```powershell
rg "\.cairn/LAWS\.md" files\.cairn\CLAUDE.md
# Expected: one match

rg "\.claude/LAWS\.md" files\.cairn\CLAUDE.md
# Expected: zero matches
```

---

### STEP 3.4 — Update `files/.cairn/memory/MEMORY.md` — notes vs cross-session memory path reference

**Current state:** read `files/.cairn/memory/MEMORY.md` and check for any `~/.claude/memory/` path references.

```powershell
rg "~/\.claude|userMemory|\.claude/memory" files\.cairn\memory\MEMORY.md
```

**Expected:** zero matches (the MEMORY.md template uses relative subdir links like `user/README.md`, not absolute vendor paths).

**Action:** if zero matches — no edit needed, move on. If matches found — remove or genericize any vendor-path references (the template should never hardcode `~/.claude/memory/`; that is the old model WS08 retires).

---

**CHECKPOINT after Phase 3**

```powershell
# Shell: PowerShell
# CP-3a: old path gone from reflect skill
rg "files/memory/project/README" files\skills\reflect\SKILL.md
# Expected: zero matches

# CP-3b: new path present in reflect skill
rg "files/\.cairn/memory/project/README" files\skills\reflect\SKILL.md
# Expected: one match

# CP-3c: .claude/LAWS.md pointer gone from CLAUDE.md template
rg "\.claude/LAWS\.md" files\.cairn\CLAUDE.md
# Expected: zero matches

# CP-3d: .cairn/LAWS.md pointer present in CLAUDE.md template
rg "\.cairn/LAWS\.md" files\.cairn\CLAUDE.md
# Expected: one match

# CP-3e: no residual old template paths in files this spec edited
rg "files/CLAUDE\.md|files/LAWS\.md|files/memory/" files\skills\reflect\SKILL.md files\.cairn\CLAUDE.md files\.cairn\LAWS.md files\.cairn\memory\MEMORY.md
# Expected: zero matches
```

If CP-3a shows a match: STEP 3.1 edit was not applied. Re-run the sed/Set-Content command.
If CP-3c shows a match: STEP 3.3 edit was not applied. Re-run the replacement.

---

## Post-flight

Final verification before handing off to peer-review. All commands from repo root.

```powershell
# Shell: PowerShell

# PF-POST-1: complete §2.1 layout exists under files/.cairn/
$required = @(
  "files\.cairn\CLAUDE.md",
  "files\.cairn\LAWS.md",
  "files\.cairn\memory\MEMORY.md",
  "files\.cairn\memory\feedback\README.md",
  "files\.cairn\memory\project\README.md",
  "files\.cairn\memory\reference\README.md",
  "files\.cairn\memory\user\README.md",
  "files\.cairn\context",
  "files\.cairn\sessions",
  "files\.cairn\cairn-version"
)
$required | ForEach-Object { "$_`: $(Test-Path $_)" }
# Expected: all lines end in ': True'

# PF-POST-2: no file from this spec landed outside files/.cairn/ or files/skills/
Test-Path files\CLAUDE.md; Test-Path files\LAWS.md
(Get-ChildItem files\memory -ErrorAction SilentlyContinue | Measure-Object).Count
# Expected: False; False; 0  (old paths gone, old memory dir empty or absent)

# PF-POST-3: program-level DoD grep (DoD#1, vendor-path cleanliness in files this spec touched)
# Note: adopt.md and manifest.json are out of scope for this WS; skip them here
rg -n "~/\.claude|~/\.gemini|~/\.pi/agent|userMemory|projectClaude\}/LAWS" `
  files\.cairn\CLAUDE.md files\.cairn\LAWS.md files\.cairn\memory\MEMORY.md `
  files\skills\reflect\SKILL.md 2>&1 | Select-String -NotMatch "migration-ref"
# Expected: zero matches (no forbidden vendor paths in files this workstream owns)

# PF-POST-4: git status shows clean staging of only this workstream's changes
git status --short
# Expected: staged renames (R), one staged add (files/.cairn/cairn-version),
#           edits under files/skills/reflect/ and files/.cairn/
#           No unexpected modifications outside files/
```

**Commit-message template:**

```
feat(ws01): move template tree to files/.cairn/ — freeze §2.1 layout

- git mv files/{CLAUDE.md,LAWS.md,memory/**} → files/.cairn/
- add files/.cairn/context/ (reserved, empty), files/.cairn/sessions/ (reserved, HIVE-owned, empty), and files/.cairn/cairn-version (0.14.0)
- update files/skills/reflect/SKILL.md: memory/project path → files/.cairn/...
- update files/.cairn/CLAUDE.md: .claude/LAWS.md pointer → .cairn/LAWS.md
- manifest.json/adopt.md/AGENTS.md/HANDOFF.md/README.md: deferred to WS06/08/10

[LAW own-your-namespace] — cairn state moves into the cairn-owned namespace.
Contract §2.1 is now frozen for Wave 1.

Co-Authored-By: <executor-model-id> <noreply@anthropic.com>
```

**Archive this spec after commit:**

```powershell
# Shell: PowerShell — run AFTER commit (not before)
# (WS orchestrator handles archiving per §9.3; executor does not self-archive)
# Simply mark the §9.4 row as COMPLETE in SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md.
```

---

## Executor Handoff

**Read first (in this order):**

1. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §2.1 (the exact layout this spec implements) and §4 (hard contract — no vendor path writes).
2. `files/CLAUDE.md` (the file being moved — understand what line 39 says before STEP 3.3).
3. `files/skills/reflect/SKILL.md` lines 94–97 (the only path reference this spec must patch in a skill body).

**The constraint most likely to cause a mistake:** using `mv`/`Copy-Item` instead of `git mv`. If git mv is bypassed, `git status` shows the old path as deleted (D) and the new path as an untracked file (??) rather than a rename (R). Recovery: `git add files/.cairn/<name>` (stages the new file), then `git status` should show R once both sides are staged.

**Second most likely mistake:** running WS01 and WS02 concurrently and letting them both edit `files/.cairn/CLAUDE.md`. WS01 owns the body (the git mv establishes this); WS02 only prepends a header afterward. They are NOT parallel-safe on that file. Do not merge WS02 until WS01 has landed.

**Third most likely mistake:** creating or writing `<project>/CLAUDE.md`. Do not do this. The user creates it; cairn never seeds it.

**Scope boundary — do not touch:**
- `manifest.json` — owned by WS06
- `adopt.md` — owned by WS08
- `AGENTS.md`, `README.md`, `HANDOFF.md` — owned by WS10
- Any file outside `files/.cairn/`, `files/skills/reflect/`, and the deleted `files/memory/`/`files/CLAUDE.md`/`files/LAWS.md` (now moved)

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| `git mv` fails "destination not in working tree" | ensure parent dir exists (`mkdir -p`/`New-Item -ItemType Directory`), then retry |
| CP-2c shows D lines without R | `git add files/.cairn/<missed-file>` to complete the rename staging |
| `cairn-version` content wrong | `Set-Content -Path files\.cairn\cairn-version -Value "0.14.0" -NoNewline` |
| STEP 3.3 edit produced double-replacement | `git diff files\.cairn\CLAUDE.md` to inspect; manually restore to single `.cairn/LAWS.md` |
| Pre-flight PF-3 shows `files/.cairn` already exists | `ls files/.cairn/` to see what's there; if partial from a failed run, `git checkout -- files/` to restore and start fresh |

---

## Review Checklist

A peer-reviewer (fresh agent, did not author) checks:

- [ ] All 7 template files (`CLAUDE.md`, `LAWS.md`, `memory/MEMORY.md`, four type-READMEs) appear in `files/.cairn/` at the §2.1 paths.
- [ ] `files/.cairn/cairn-version` contains exactly `0.14.0`.
- [ ] `files/.cairn/context/` directory exists (§2.1 reserved slot).
- [ ] `files/.cairn/sessions/` directory exists and is empty (HIVE-reserved slot — created by WS01, not owned or populated by it).
- [ ] `files/CLAUDE.md`, `files/LAWS.md`, `files/memory/` are gone from the old locations.
- [ ] `git log --follow files/.cairn/CLAUDE.md` shows rename history (not a fresh file).
- [ ] `rg "\.claude/LAWS\.md" files/.cairn/CLAUDE.md` returns zero.
- [ ] `rg "files/memory/project/README" files/skills/reflect/SKILL.md` returns zero.
- [ ] No file was written outside `files/.cairn/` or `files/skills/reflect/` by this workstream.
- [ ] `<project>/CLAUDE.md` was NOT created, seeded, or written by this workstream (user-owned per master §2.1/§3; manifest carries no `{projectRoot}/CLAUDE.md` entry).
- [ ] WS02 has NOT yet run on `files/.cairn/CLAUDE.md` at the point this WS's commit lands — the file contains only the body content from `git mv`, no WS02 header prepend (ordering enforced at integration; both workstreams are Wave 0 but NOT parallel-safe on this file per master §9.5).
- [ ] DoD#1 grep (PF-POST-3) returns zero for files this workstream owns.
- [ ] No vendor path (`~/.claude`, `~/.gemini`, `~/.pi`, `.claude/`, `.agents/`) appears in any file this spec created or edited — unless accompanied by `<!-- migration-ref -->` (there should be zero such lines in this workstream's files; migration text belongs in WS08/WS09).
- [ ] Commit message cites `[LAW own-your-namespace]` and names the §2.1 contract.
