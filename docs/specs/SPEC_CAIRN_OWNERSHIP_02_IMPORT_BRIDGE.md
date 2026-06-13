# SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 01, 12

## Goal
Specify the single user-written import line — the only edit cairn ever asks a user to make to a vendor-owned context file.

## Scope
- Claude Code: `@./.cairn/CLAUDE.md` appended to `<project>/CLAUDE.md`.
- Pi/agy: the `AGENTS.md` analog (auto-loaded), pointing at `./.cairn/CLAUDE.md`.
- The rule: the agent SHOWS the exact line; the USER adds it; cairn never `Write`/`Edit`s it (even where the sandbox would allow).
- Define the user-action Step text consumed by WS08 (adopt rewrite).
- Freeze as Contract §2.2.

## Telemetry hook
N/A: markdown framework.

## Diagnostics path
WS09's integrity check flags a *missing* import line (state present but unreferenced → silent habitat).

## Rollback story
N/A: the user owns the line; removing it is a one-line user edit.

## Gate
`adopt.md` presents the import line as a user-action Step; grep confirms the line never appears inside an agent write loop.

## Files
`adopt.md` (the user-action Step), `files/.cairn/CLAUDE.md` (header note referencing the import).

---

## Pre-flight

Run all three commands before Phase 1. If any expectation fails, STOP and surface the mismatch — do not continue.

```powershell
# Shell dialect: PowerShell (Windows) or POSIX bash on Linux/macOS — use whichever matches your executor environment.
# Command 1: confirm the spec file exists and is the stub you are about to elaborate (not already done).
Get-Content "docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md" | Select-String "READY FOR EXECUTOR"
# Expected: one match on the status line. Zero matches means the file was not updated yet — check your working tree.

# Command 2: confirm files/.cairn/ does NOT yet exist (WS01 creates it; this workstream only
# touches adopt.md and the new files/.cairn/CLAUDE.md header note).
Test-Path "files/.cairn"
# Expected: False. If True, WS01 landed before you — read files/.cairn/CLAUDE.md before Phase 2
# to understand what header text is already present, then skip Phase 2 Step 1 if a header note
# already exists.

# Command 3: confirm adopt.md does NOT yet contain a user-action import-line Step for .cairn.
Select-String -Path "adopt.md" -Pattern "\.cairn/CLAUDE\.md" -SimpleMatch
# Expected: zero matches. If matches are present, WS08 has already incorporated the import Step —
# read those matches carefully; your Phase 1 Step 2 wording must be IDENTICAL so WS08 can copy
# it verbatim (or skip Phase 1 Step 2 if already done).
```

**Halting gate:** proceed only when all three expectations pass (status line present, `.cairn/` absent, no existing import Step in adopt.md).

---

## Phase 1 — Define the user-action import-line Step text

This phase produces the single canonical user-action Step that WS08 will copy verbatim into `adopt.md`. It is the only output WS02 owns in the final shipped content of `adopt.md` — WS08 controls the surrounding flow; WS02 controls this Step's exact wording.

### Step 1 — Read the current adopt.md Step 6 region to understand the insertion point

**Current state of `adopt.md` (lines 388–413):**

```markdown
### Step 6 — Write version marker, then report

**First, write the version marker.** After a successful install (or upgrade), write
`{projectClaude}/cairn-version` containing just the installed version string (e.g. `0.3.3`).
...

**Then report to the user:**

cairn v0.13.1 installed.

Created:
  <list of files actually written, absolute paths>

Skipped (already existed):
  <list>

Next: say `tour` and I'll walk you through what was installed and help you take
the first concrete action.
```

**Why this matters for WS02:** after the install, the user must add one import line before the habitat is functional. That Step must appear in the adopt flow AFTER the files are confirmed written (after the current Step 5 validation) and BEFORE the version marker is written and the final report is delivered. The ordering makes the import line a required checkpoint, not an afterthought.

**WS02 does NOT rewrite adopt.md** — that belongs to WS08. WS02 records the canonical Step wording here so WS08 can paste it in. No file write for this step — it is a reading and analysis action only.

### Step 2 — Record the canonical user-action Step wording

The text below is the exact wording WS08 must insert as a new numbered Step in `adopt.md`. Record it here as the authoritative source of truth; copy it verbatim (no paraphrase) when WS08 elaborates.

**Canonical user-action Step — "Add the import line" (to be inserted by WS08):**

```
### Step 6 — Add the import line (user action — not automated)

Cairn's state now lives at `<project>/.cairn/CLAUDE.md`. For the agent to read it every
session, your context file must reference it. Cairn never writes this line — you add it.

**Claude Code** — append the following to your project's `CLAUDE.md`:

    @./.cairn/CLAUDE.md

Open `<project>/CLAUDE.md` in your editor and add that line at the very bottom.

**Pi / agy** — append the following to your project's `AGENTS.md`:

    @./.cairn/CLAUDE.md

(Pi auto-loads `AGENTS.md` on session start; the `@path` directive pulls in the referenced
file. If you use a different context file, point the directive at `.cairn/CLAUDE.md` from
wherever that file lives.)

Once you have added the line, tell me — I will run a quick integrity check to confirm the
import is present and the habitat is functional.
```

**Why this exact wording:**
- "Cairn never writes this line — you add it" directly upholds master §4 contract #3 and §2.2.
- The Step asks the user to confirm after adding, triggering WS09's integrity check (master §2.2: "WS09's integrity check flags a missing import line").
- `@./.cairn/CLAUDE.md` is the literal token Claude Code and Pi resolve when they load CLAUDE.md/AGENTS.md. No smart-quoting, no path variables — the raw string as the user must type it.
- Pi/agy share the same token because Pi's `@` directive and Claude Code's `@` directive use the same syntax for relative path includes (validated in master §2.2 contract freeze).
- The Step is numbered after the file-write and validation steps (Step 5) but before the version-marker write (Step 7 in the new scheme) so that a missing import halts before cairn declares the install "done."

**CHECKPOINT A — verify wording is recorded here:** read back this spec file and confirm the canonical Step text appears verbatim above. If the text is missing or truncated, re-write this Step before proceeding to Phase 2.

```powershell
# PowerShell
Select-String -Path "docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md" `
  -Pattern "Cairn never writes this line" -SimpleMatch
# Expected: one match. Zero = Step 2 content is missing; stop and re-check the edit.
```

---

## Phase 2 — Create files/.cairn/CLAUDE.md with the import-reference header note

WS01 creates the `files/.cairn/` template tree. WS02 owns the header note in `files/.cairn/CLAUDE.md` that tells the agent (and the user reading the file) how the import line connects this file to the project's CLAUDE.md. These steps are safe to execute even if WS01 is running in parallel — WS02 only adds the header comment; WS01 handles the rest of the file body.

**Dependency note:** if WS01 has already created `files/.cairn/CLAUDE.md`, read the existing file first. Only add the header note if one is absent — never overwrite WS01's content.

### Step 1 — Create files/.cairn/CLAUDE.md (if WS01 has not done so)

**Current state:** `files/.cairn/` does not exist (confirmed in Pre-flight command 2).

**Action:** create the directory and file with the import-reference header note.

```powershell
# PowerShell
New-Item -ItemType Directory -Path "files/.cairn" -Force
```

**New content for `files/.cairn/CLAUDE.md`:**

```markdown
<!-- cairn-managed: do not edit directly -->
<!--
  This file is the cairn-owned context block for this project.
  It is NOT auto-loaded by any harness — you must import it with a single line
  in your project's CLAUDE.md (Claude Code) or AGENTS.md (Pi/agy):

      @./.cairn/CLAUDE.md

  The adopting agent shows you that line during install (adopt.md Step 6);
  you add it. Cairn never writes to CLAUDE.md or AGENTS.md on your behalf.
  See: https://github.com/winnorton/cairn — §2.2 (import-line contract).
-->

```

**Why:** the header note makes the import convention self-documenting for any adopter who opens the file. The `<!-- cairn-managed -->` sentinel is consistent with the pattern used in WS01's other template files; it signals that content below is maintained by cairn, not customized by the adopter. The import-line instruction is reproduced verbatim so an adopter who adds this file to a new project without running the full adopt flow knows exactly what to do.

**Write it now:**

```powershell
# PowerShell — write files/.cairn/CLAUDE.md
$content = @'
<!-- cairn-managed: do not edit directly -->
<!--
  This file is the cairn-owned context block for this project.
  It is NOT auto-loaded by any harness — you must import it with a single line
  in your project's CLAUDE.md (Claude Code) or AGENTS.md (Pi/agy):

      @./.cairn/CLAUDE.md

  The adopting agent shows you that line during install (adopt.md Step 6);
  you add it. Cairn never writes to CLAUDE.md or AGENTS.md on your behalf.
  See: https://github.com/winnorton/cairn — §2.2 (import-line contract).
-->

'@
Set-Content -Path "files/.cairn/CLAUDE.md" -Value $content -NoNewline
```

```bash
# POSIX bash alternative
mkdir -p files/.cairn
cat > files/.cairn/CLAUDE.md << 'ENDOFFILE'
<!-- cairn-managed: do not edit directly -->
<!--
  This file is the cairn-owned context block for this project.
  It is NOT auto-loaded by any harness — you must import it with a single line
  in your project's CLAUDE.md (Claude Code) or AGENTS.md (Pi/agy):

      @./.cairn/CLAUDE.md

  The adopting agent shows you that line during install (adopt.md Step 6);
  you add it. Cairn never writes to CLAUDE.md or AGENTS.md on your behalf.
  See: https://github.com/winnorton/cairn -- §2.2 (import-line contract).
-->

ENDOFFILE
```

**CHECKPOINT B — verify the file was written:**

```powershell
# PowerShell
Test-Path "files/.cairn/CLAUDE.md"
# Expected: True

Get-Content "files/.cairn/CLAUDE.md" | Select-String "cairn-managed"
# Expected: one match on the first line.

Get-Content "files/.cairn/CLAUDE.md" | Select-String "@./.cairn/CLAUDE.md"
# Expected: one match inside the comment block.
```

If any check fails: delete `files/.cairn/CLAUDE.md` and re-run Step 1.

---

## Phase 3 — Verify the hard-contract invariants for WS02's scope

This phase is a gate-check only — no file writes. It confirms that everything WS02 touched upholds master §4 before handing off to WS08.

### Step 1 — Confirm no cairn write target is a vendor path

```powershell
# PowerShell
# The only file WS02 writes is files/.cairn/CLAUDE.md.
# Confirm it does not reference any vendor path as a WRITE target.
Select-String -Path "files/.cairn/CLAUDE.md" `
  -Pattern "~/.claude|~/.gemini|~/.pi|\.claude/|\.agents/" -SimpleMatch
# Expected: zero matches. Any match is a hard-contract violation — remove it.
```

### Step 2 — Confirm the canonical Step wording does not contain an agent write instruction

```powershell
# PowerShell
# The canonical Step text in Phase 1 Step 2 must NOT contain any instruction
# for the AGENT to write CLAUDE.md or AGENTS.md. Grep this spec for the telltale patterns.
Select-String -Path "docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md" `
  -Pattern "Write.*CLAUDE\.md|Edit.*CLAUDE\.md|Write.*AGENTS\.md|Edit.*AGENTS\.md" -SimpleMatch
# Expected: zero matches. If a match appears, the canonical Step wording accidentally
# instructs the agent to write — fix it so the Step clearly says "you add it."
```

### Step 3 — Confirm `adopt.md` still does NOT contain the import Step (WS08 territory)

```powershell
# PowerShell
Select-String -Path "adopt.md" -Pattern "\.cairn/CLAUDE\.md" -SimpleMatch
# Expected: zero matches. If WS08 has already run, matches here are EXPECTED and correct —
# that means WS08 incorporated the canonical wording ahead of schedule. In that case,
# skip this check and mark it green.
```

**CHECKPOINT C — all three steps green:**

| Check | Command | Expected |
|---|---|---|
| No vendor-path write in files/.cairn/CLAUDE.md | Step 1 grep | 0 matches |
| No agent-write instruction in canonical Step wording | Step 2 grep | 0 matches |
| adopt.md unchanged by WS02 | Step 3 grep | 0 matches (or WS08 already ran) |

If any check is red (and WS08 has not already run): stop, identify the violation, fix in the correct file, re-run checks.

---

## Post-flight

**Final verification:**

```powershell
# PowerShell — run after all phases complete
# 1. Confirm the two files WS02 is responsible for are present and correct.
Test-Path "files/.cairn/CLAUDE.md"
# Expected: True

Get-Content "files/.cairn/CLAUDE.md" | Select-String "cairn never writes"
# Expected: one match (the ownership statement in the header comment).

# 2. Confirm this spec's status header reads READY FOR EXECUTOR (not STUB).
Get-Content "docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md" |
  Select-Object -First 3 | Select-String "READY FOR EXECUTOR"
# Expected: one match.

# 3. Program-level DoD#1 spot-check for WS02's scope (full sweep is WS09's job).
#    Confirm no new vendor-path strings crept into files/.cairn/.
rg -n "~/.claude|~/.gemini|~/.pi" files/.cairn/
# Expected: zero matches. (rg is available in most Unix and Windows environments;
# substitute Select-String if not available.)
```

**Commit message template:**

```
feat(ws02): import-bridge spec + files/.cairn/CLAUDE.md header note

- Elaborated SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md in place (STUB → READY FOR EXECUTOR)
- Recorded canonical user-action Step text for WS08 to paste into adopt.md
- Created files/.cairn/CLAUDE.md with import-line header note (cairn-managed sentinel)
- Zero vendor-path write targets in WS02 scope (master §4 hard-contract clear)

Program: SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md · Wave 0 · Parallel-safe-with: 01, 12

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Archive line (run after peer-review no-blocker pass, before merge):**

No archive action — spec files stay in `docs/specs/` as living references. WS10 (docs) will update the program status table when all workstreams complete.

---

## Executor Handoff

**Read first (in order):**

1. `docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` §2.2 (import-line contract, frozen), §4 (hard contract — the one invariant you cannot violate).
2. `adopt.md` — current Step 6 region (lines 388–413) so you understand where WS08 will insert the canonical Step.
3. `docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` — if WS01 has run first, `files/.cairn/CLAUDE.md` may already exist; read it before Phase 2 to avoid clobbering WS01 content.

**The one constraint most likely to cause a mistake:**

> The canonical user-action Step (Phase 1 Step 2) must describe the USER adding the line, not the AGENT writing it. If your phrasing accidentally says "I will append" or "the agent writes" instead of "you add it", you break master §4 contract #3. Read the wording carefully: "Cairn never writes this line — you add it."

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| CHECKPOINT B fails — file not written | Delete any partial `files/.cairn/CLAUDE.md`; re-run Phase 2 Step 1 |
| Phase 3 Step 1 finds a vendor-path string in `files/.cairn/CLAUDE.md` | Edit the file to remove the offending string; re-run Phase 3 Step 1 |
| Phase 3 Step 2 finds an agent-write pattern in the canonical Step | Edit Phase 1 Step 2 wording to use user-imperative ("you add it"); re-run check |
| WS01 has already written `files/.cairn/CLAUDE.md` | Read existing content; add only the import-reference header if absent; never overwrite |
| adopt.md already has the import Step (WS08 ran first) | Skip Phase 1 Step 2 write action; verify the existing wording matches this spec's canonical text; note any discrepancy for WS08 |

---

## Review Checklist

A fresh-agent peer-reviewer (opus, not the WS02 author) confirms:

- [ ] Status header reads "READY FOR EXECUTOR" (not "STUB").
- [ ] `files/.cairn/CLAUDE.md` exists and contains the import-line explanation in a comment block.
- [ ] The canonical user-action Step wording (Phase 1 Step 2) says "you add it" / "Cairn never writes" — NOT "I will write" or any agent-write form.
- [ ] No step in this spec instructs cairn to write to `CLAUDE.md`, `AGENTS.md`, `~/.claude/**`, `~/.gemini/**`, or `~/.pi/**`.
- [ ] The `@./.cairn/CLAUDE.md` token appears verbatim in both the canonical Step (Phase 1 Step 2) and the `files/.cairn/CLAUDE.md` header note.
- [ ] The Pre-flight halting gate includes a check confirming `files/.cairn/` does not yet exist, so this spec is safe to run before WS01.
- [ ] The Phase 3 hard-contract checks are executable commands, not prose promises.
- [ ] No frozen/hardcoded file lists appear — any "count of X files" uses a programmatic command form (this spec has no such counts; confirm there is nothing to ratchet).
- [ ] The commit message template includes the program reference line and the Wave 0 designation.
- [ ] The Executor Handoff names exactly which section of the program master to read first (§2.2 and §4), not just "read the master."
