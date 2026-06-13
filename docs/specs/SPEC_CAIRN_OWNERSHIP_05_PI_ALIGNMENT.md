# SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 04, 06, 07

## Goal
Align the already-shipped `@winnorton/cairn-pi` npm package with the `.cairn/` state model so Pi reads cairn state from `<project>/.cairn/`, not a vendor memory path.

## Scope
- Update cairn-pi README + any skill-path references to point Pi at `<project>/.cairn/memory/` (was `~/.pi/agent/memory` / slug paths).
- Keep npm as Pi's distribution channel (different ecosystem from the Claude plugin).
- Version bump in lockstep with `VERSION` (per the sync guard, WS11).
- Confirm the six bundled skills still byte-match source after WS07's path edits.

## Telemetry hook
N/A: markdown.

## Diagnostics path
`npm run check` green; `pi install` + `/skill:` list smoke test.

## Rollback story
npm package is additive; prior version remains installable; `git revert` the repo changes.

## Gate
cairn-pi documents `.cairn/` state, `sync --check` green, lockstep version correct, smoke install passes.

## Files
`packages/cairn-pi/**` (README, skills copies via sync, package.json version).

---

## Pre-flight

Shell dialect: **PowerShell** (executor is on Windows; POSIX equivalents shown in comments where they differ).

Run these commands from the cairn repo root before any Phase. Each line shows the expected result. If an expectation fails, STOP and surface to the human before proceeding.

```powershell
# From repo root: C:\Users\winno\projects\cairn\cairn
# (Adjust path if in a worktree — use git worktree list to confirm root)

# 1. Confirm WS01 has landed (this spec depends on 01)
#    WS01 defines the .cairn/ layout contract; without it, the README we write
#    would reference a structure that doesn't exist yet.
#    Expected: file exists
Test-Path docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md
# => True

# 2. Confirm working tree is clean (or on a dedicated worktree branch)
git status --short
# => empty output, or only your worktree's own in-progress files

# 3. Confirm VERSION is what we expect
Get-Content VERSION
# => 0.13.1  (or whatever the current version is — note it; used in Phase 2)

# 4. Confirm sync check passes before we touch anything
node packages/cairn-pi/scripts/sync-skills.mjs --check
# => "check OK — 6 skills in sync, lockstep <VERSION>"

# 5. Confirm the six source skills exist
foreach ($s in @('spec','program','round-review','fast-execute','peer-review','note')) {
  Test-Path "files/skills/$s/SKILL.md"
}
# => True x6

# 6. Confirm no source skill description is over the 1024-char cap
#    (round-review was fixed before the archived SPEC_CAIRN_PI_PACKAGE shipped;
#     confirmed at 1021 chars as of 2026-06-13)
python3 -c "
import re, sys
skills = ['spec','program','round-review','fast-execute','peer-review','note']
over = []
for s in skills:
    raw = open(f'files/skills/{s}/SKILL.md', encoding='utf-8').read()
    m = re.match(r'^---\r?\n([\s\S]*?)\r?\n---', raw)
    if m:
        dm = re.search(r'(?:^|\n)description:[ \t]*([\s\S]*)$', m.group(1))
        if dm:
            desc = re.sub(r'\r?\n[ \t]+', ' ', dm.group(1)).strip()
            print(f'{s}: {len(desc)}')
            if len(desc) > 1024: over.append(s)
if over: sys.exit(f'OVER CAP: {over}')
"
# => spec: 787, program: 726, round-review: 1021, fast-execute: 996,
#    peer-review: 910, note: 837   (all <= 1024)

# 7. Baseline vendor-path count in packages/cairn-pi/
#    (rg: find ~/.pi occurrences; POSIX: rg -c '~/.pi' packages/cairn-pi/)
rg --count "~/.pi" packages/cairn-pi/
# => packages/cairn-pi/README.md:1
```

**HALTING gate:** if any of the above fails — WS01 not landed, sync not green, a source description over cap, or the repo is dirty in unexpected ways — STOP and surface before Phase 1. Do not attempt to recover silently.

---

## Phase 1 — Update cairn-pi README to document `.cairn/` state

### What this phase changes

The README currently documents a `~/.pi/agent/npm/` install comment and has no mention of `.cairn/` state. Under the new ownership model:

- Pi reads cairn state from `<project>/.cairn/` via one user-written import line in `AGENTS.md` (WS02 contract).
- The `pi install` command itself is still Pi's own action (not a cairn write) — the install path comment `(~/.pi/agent/npm/)` is informational text about where Pi stores its packages. It is NOT a cairn write target and does not violate §4 of the program master.
- However, the README should document the import-line step so Pi users know how state is loaded.

### STEP 1.1 — Update `packages/cairn-pi/README.md`: add `.cairn/` state section

File: `packages/cairn-pi/README.md`

CURRENT (lines 9–11, the Install section):

```markdown
## Install

```
pi install npm:@winnorton/cairn-pi        # user-global (~/.pi/agent/npm/)
pi install -l npm:@winnorton/cairn-pi     # project-local (.pi/npm/, recorded in .pi/settings.json — team-shareable)
```
```

REPLACEMENT (same install commands; one new subsection added after the code block):

````markdown
## Install

```
pi install npm:@winnorton/cairn-pi        # user-global (~/.pi/agent/npm/)
pi install -l npm:@winnorton/cairn-pi     # project-local (.pi/npm/, recorded in .pi/settings.json — team-shareable)
```

### Connect cairn state (one user step)

After installing the package, add one line to your project's `AGENTS.md` so Pi can read cairn's memory, laws, and context:

```
@./.cairn/CLAUDE.md
```

This line imports the cairn-generated context from `<project>/.cairn/CLAUDE.md` — the file produced by `adopt cairn`. Pi auto-loads `AGENTS.md` at session start; the import gives the agent access to project laws, typed memory, and cairn context. This is the only vendor-file touch cairn requests; the user adds it, not the agent.

**cairn state lives in `<project>/.cairn/`** (git-tracked, project-local). The layout:

```
<project>/.cairn/
├── CLAUDE.md         # imported by your AGENTS.md (see above)
├── LAWS.md           # project laws
├── memory/
│   ├── MEMORY.md     # index
│   └── user/ feedback/ project/ reference/
└── cairn-version     # version marker
```

If you haven't run `adopt cairn` yet, do that first to create the `.cairn/` tree. See [cairn README](https://github.com/winnorton/cairn) for the full adopt flow.
````

WHY: The old README had no state documentation at all — a Pi user installing the package would get the six skills but no guidance on how cairn's memory/laws/context reach the agent. The `.cairn/` model requires one user action (adding the import line); the README must explain it. The install commands themselves remain unchanged — `~/.pi/agent/npm/` is where Pi's own package manager stores the package, not a cairn write target (program master §4 only forbids cairn processes writing to vendor paths; this comment describes Pi's own behavior).

**CHECKPOINT 1**

```powershell
# From repo root:

# a. Confirm the new section is present
rg "Connect cairn state" packages/cairn-pi/README.md
# => packages/cairn-pi/README.md:N:### Connect cairn state (one user step)

# b. Confirm the import-line is shown
rg "@./\.cairn/CLAUDE\.md" packages/cairn-pi/README.md
# => packages/cairn-pi/README.md:N:@./.cairn/CLAUDE.md

# c. Confirm .cairn/ layout is documented
rg "\.cairn/" packages/cairn-pi/README.md
# => multiple matches (CLAUDE.md, LAWS.md, memory/, cairn-version)

# d. Confirm the install commands are still there
rg "pi install npm:@winnorton/cairn-pi" packages/cairn-pi/README.md
# => packages/cairn-pi/README.md:N:pi install npm:@winnorton/cairn-pi  ...

# If any expectation fails: diff the file against STEP 1.1 and reconcile
# by intent. The anchor "## Install" and "### Connect cairn state" are the
# load-bearing markers.
```

---

## Phase 2 — Verify sync still passes after Phase 1

Phase 1 only edits `README.md` — not the skill copies. But run the guard to confirm nothing else drifted.

### STEP 2.1 — Re-run sync check

```powershell
# From repo root:
node packages/cairn-pi/scripts/sync-skills.mjs --check
# Expected: "check OK — 6 skills in sync, lockstep <VERSION>"
```

WHY: the sync guard is wired to `prepublishOnly` and is the program-level gating mechanism (§5 DoD#6). Confirming it stays green after any edit to the package directory is the minimum correctness gate.

**CHECKPOINT 2**

```powershell
# Sync check must be green before proceeding.
# If it fails with a version mismatch: VERSION file changed since pre-flight
# but package.json was not updated — go to Phase 3.
# If it fails with "copy drifted": a skill copy was hand-edited — run
# `node packages/cairn-pi/scripts/sync-skills.mjs` (no --check) to regenerate
# from source, then re-check.
```

---

## Phase 3 — Version lockstep check (WS11 dependency handoff)

WS11 (sync-guard) will wire the lockstep check to CI. This workstream's gate requires the package version to equal the `VERSION` file at merge time. This phase verifies or corrects that.

### STEP 3.1 — Confirm version lockstep

```powershell
# From repo root:
$repoVersion = (Get-Content VERSION).Trim()
$pkgJson = Get-Content packages/cairn-pi/package.json | ConvertFrom-Json
$pkgVersion = $pkgJson.version
"Repo VERSION: $repoVersion"
"package.json: $pkgVersion"
if ($repoVersion -eq $pkgVersion) { "MATCH — lockstep OK" } else { "MISMATCH — see recovery below" }
```

**If they match:** no edit needed. Proceed to Phase 4.

**If they mismatch** (e.g., VERSION was bumped to `0.14.0` by another workstream but `packages/cairn-pi/package.json` still reads `0.13.1`):

File: `packages/cairn-pi/package.json`

CURRENT (illustrative — use the actual mismatched version):
```json
  "version": "0.13.1",
```

REPLACEMENT (use whatever `VERSION` file contains):
```json
  "version": "0.14.0",
```

WHY: program master §2.4 (single source of truth) + §8 (sync-guard ratchet) — package versions must track `VERSION`; the guard enforces this mechanically but only at publish/CI time. Correcting it here keeps the merge clean and the guard green.

**CHECKPOINT 3**

```powershell
# Re-run sync check after any version edit:
node packages/cairn-pi/scripts/sync-skills.mjs --check
# Expected: "check OK — 6 skills in sync, lockstep <VERSION>"
# (where <VERSION> now matches both files)
```

---

## Phase 4 — Post-WS07 re-sync (conditional, execute after WS07 lands)

WS07 edits skill body paths in `files/skills/`. When WS07 lands in main, the skill copies in `packages/cairn-pi/skills/` will drift from their source. This phase regenerates them.

**Trigger condition:** only execute this phase AFTER WS07 is merged to the integration branch. If WS07 has not landed yet, skip this phase and note "Phase 4 DEFERRED — WS07 not yet merged" in the commit body.

### STEP 4.1 — Re-sync skill copies after WS07

```powershell
# From repo root:
node packages/cairn-pi/scripts/sync-skills.mjs
# Expected: "synced <skill>" x6 + "sync complete — 6 skills"

node packages/cairn-pi/scripts/sync-skills.mjs --check
# Expected: "check OK — 6 skills in sync, lockstep <VERSION>"
```

WHY: The skill copies in `packages/cairn-pi/skills/` are committed build artifacts — they must be byte-identical to their sources at `files/skills/`. WS07 edits the source; this phase picks up those changes. Never hand-edit the copies; the sync script is the only write path.

**CHECKPOINT 4**

```powershell
# Verify byte identity between sources and copies for all six skills:
$skills = @('spec','program','round-review','fast-execute','peer-review','note')
$drifted = @()
foreach ($s in $skills) {
  $src = Get-Content "files/skills/$s/SKILL.md" -Raw
  $dst = Get-Content "packages/cairn-pi/skills/$s/SKILL.md" -Raw
  if ($src -ne $dst) { $drifted += $s }
}
if ($drifted) { "DRIFT: $($drifted -join ', ')" } else { "All 6 skills byte-identical — OK" }

# If drift is detected after running sync: the sync script may have encountered
# an error. Re-run with: node packages/cairn-pi/scripts/sync-skills.mjs
# and check for errors. Do not hand-edit copies.
```

---

## Post-flight

Run these verification commands after all phases complete:

```powershell
# From repo root:

# 1. Final sync check
node packages/cairn-pi/scripts/sync-skills.mjs --check
# => "check OK — 6 skills in sync, lockstep <VERSION>"

# 2. README has the new state section
rg "Connect cairn state|\.cairn/CLAUDE\.md" packages/cairn-pi/README.md
# => two or more matches

# 3. No new vendor write targets introduced (the one existing ~/.pi reference
#    is the Pi package install path comment — informational, not a cairn write)
rg "~/.pi" packages/cairn-pi/
# => packages/cairn-pi/README.md:1:pi install ... # user-global (~/.pi/agent/npm/)
#    (exactly one match, the install-path comment; this is acceptable per §4
#    because it describes Pi's own behavior, not a cairn write target)

# 4. Vendor-path check per program DoD#1 (excluding migration-ref lines):
#    This workstream only touches packages/cairn-pi/ — run the scoped check:
rg -n "~/.pi/agent/memory|userMemory" packages/cairn-pi/
# => no output (these strings must not appear in cairn-pi)

# 5. git diff summary
git diff --stat HEAD
# => expect changes only under packages/cairn-pi/ (README.md and possibly
#    package.json if version was bumped; skills/ only if WS07 was merged first)
```

**Commit message template:**

```
feat(cairn-pi): align package with .cairn/ state model (WS05)

Documents .cairn/ state layout and the AGENTS.md import line in
packages/cairn-pi/README.md so Pi users know how cairn memory/laws/context
reach the agent after installing the package. No writes to vendor paths —
the import line is shown for the user to add; Pi's ~/.pi/agent/npm/ mention
is a Pi-owns-its-own-path informational comment, not a cairn write target.

Sync check green; lockstep confirmed.
[If Phase 4 ran]: Re-synced skill copies after WS07 path edits.
[If Phase 4 deferred]: Phase 4 deferred — WS07 not yet merged; re-sync
  skill copies when WS07 lands.

[LAW own-your-namespace] — cairn writes only under <project>/.cairn/
[LAW handoff-stays-current]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Archive this spec after merge:**

```powershell
# PowerShell (run from repo root after the merge commit):
git mv docs/specs/SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT.md docs/specs/archive/SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT.md
# Then commit: git commit -m "chore: archive WS05 spec post-merge"
```

---

## Executor Handoff

**Read first — in this order:**

1. **Program master §4 (HARD CONTRACT)** in `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` — confirms which paths are forbidden write targets. The `~/.pi/agent/npm/` comment in the README is NOT a cairn write; it describes where Pi's own installer puts the package. This distinction is the most important thing to understand before editing.
2. **`packages/cairn-pi/README.md`** — the file this spec edits. Read it in full so STEP 1.1's anchor text lands correctly.
3. **WS07 status in the program master's §9.4 table** — determines whether Phase 4 runs now or is deferred.

**The one constraint most likely to cause a mistake:** confusing "cairn documenting where Pi stores packages" with "cairn writing to a vendor path." The `~/.pi/agent/npm/` reference in the README install comment is describing Pi's own package manager behavior — it is NOT a cairn write target. Do not remove it; it is helpful to users. Only strings that represent cairn process writes are forbidden by §4.

**Recovery for common failures:**

- *Sync check fails with "version mismatch" after Phase 1:* `VERSION` was bumped by another WS between your pre-flight and now. Run Phase 3 to update `package.json`, then re-check.
- *Phase 4 produces drift after sync runs:* the `sync-skills.mjs` script had an error (check its exit code). Re-run without `--check`. Never hand-edit copies under `packages/cairn-pi/skills/`.
- *STEP 1.1 anchor text is gone (e.g., another WS edited README):* locate the `## Install` heading and the `pi install npm:@winnorton/cairn-pi` command block; insert the new subsection immediately after the closing ` ``` ` of that code block. Intent (not exact anchor) governs placement.
- *Pre-flight fails because WS01 has not landed:* this spec depends on 01. Stop and wait for WS01 to merge; do not invent the `.cairn/` layout independently.

---

## Review Checklist

- [ ] `packages/cairn-pi/README.md` has the new `### Connect cairn state (one user step)` subsection with the `@./.cairn/CLAUDE.md` import line and the `.cairn/` directory layout.
- [ ] The `~/.pi/agent/npm/` install-path comment in the README install block is preserved (it describes Pi's own behavior, not a cairn write).
- [ ] No new `~/.pi/agent/memory` or `userMemory` strings introduced in `packages/cairn-pi/` (run `rg "~/.pi/agent/memory|userMemory" packages/cairn-pi/` — expect zero).
- [ ] `npm run check` (or `node packages/cairn-pi/scripts/sync-skills.mjs --check`) is green.
- [ ] Package version in `package.json` equals the `VERSION` file.
- [ ] If WS07 has landed: Phase 4 was executed and skill copies are byte-identical to sources (CHECKPOINT 4 command passes).
- [ ] If WS07 has NOT landed: commit body notes "Phase 4 DEFERRED — WS07 not yet merged."
- [ ] No edits to `manifest.json` (that is WS06 scope), `adopt.md` (WS08 scope), or `AGENTS.md` (WS10 scope).
- [ ] No writes outside `packages/cairn-pi/` (git diff --stat shows only that subtree).
- [ ] Commit message cites `[LAW own-your-namespace]` and `[LAW handoff-stays-current]`.
