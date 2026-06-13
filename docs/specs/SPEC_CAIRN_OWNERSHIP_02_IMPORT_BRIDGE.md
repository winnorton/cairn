# SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** WS01 (for `files/.cairn/CLAUDE.md` — must run after WS01 moves/creates that file; foundational in all other respects) · **Parallel-safe-with:** 12 (NOT parallel-safe with WS01 on `files/.cairn/CLAUDE.md` — see §9.5 merge-map)

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

# Command 2: check whether files/.cairn/CLAUDE.md already exists (WS01 owns the body; WS02 prepends
# the header). WS02's Phase 2 requires WS01 to have created this file first (master §9.5).
Test-Path "files/.cairn/CLAUDE.md"
# Expected: True (WS01 has already run) OR False (WS01 has not yet run).
# If False: WS01 must land before you run Phase 2 — proceed with Phase 1 only and return for Phase 2
#   after WS01 completes.
# If True: read files/.cairn/CLAUDE.md before Phase 2 to understand WS01's body content.
#   Check whether the "cairn-managed" header is already present — if yes, Phase 2 Step 1 is idempotent
#   (skip the write). If no, proceed with the prepend in Phase 2 Step 1 Case A.

# Command 3: confirm adopt.md does NOT yet contain a user-action import-line Step for .cairn.
Select-String -Path "adopt.md" -Pattern "\.cairn/CLAUDE\.md" -SimpleMatch
# Expected: zero matches. If matches are present, WS08 has already incorporated the import Step —
# read those matches carefully; your Phase 1 Step 2 wording must be IDENTICAL so WS08 can copy
# it verbatim (or skip Phase 1 Step 2 if already done).
```

**Halting gate:** proceed only when these conditions hold: (1) status line present; (2) for Phase 2 — `files/.cairn/CLAUDE.md` EXISTS (WS01 must have run first); (3) no existing import Step in adopt.md. If `files/.cairn/CLAUDE.md` is absent, Phase 1 may run but Phase 2 must wait for WS01.

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

## Phase 2 — Prepend import-reference header note to files/.cairn/CLAUDE.md

WS01 creates the `files/.cairn/` template tree and owns the body of `files/.cairn/CLAUDE.md` (moved from wherever it previously lived). WS02 PREPENDS the `<!-- cairn-managed -->` import-note header to that file — it never replaces or overwrites WS01's body content. Per master §9.5 merge-map, WS02 is NOT parallel-safe with WS01 on this file: **WS01 must have completed its `files/.cairn/CLAUDE.md` work before WS02 runs Phase 2.**

**Hard prerequisite for Phase 2:** confirm WS01 has moved/created `files/.cairn/CLAUDE.md` before proceeding. If `files/.cairn/CLAUDE.md` does not yet exist, STOP — WS01 must land first (master §9.5: "WS01 (owns body via `git mv`) → WS02 (prepend import-note header, never overwrite)").

### Step 1 — Prepend the import-reference header note to files/.cairn/CLAUDE.md

**Case A — WS01 has run and `files/.cairn/CLAUDE.md` exists (the normal and expected case):**

Read the existing file, check whether the `<!-- cairn-managed -->` header is already present (e.g., if this step is being re-run). If it is already present, skip the write — the header is idempotent; do not duplicate it. If it is absent, prepend the header block to the top of the existing body, preserving every byte of WS01's content below it.

```powershell
# PowerShell — prepend header to WS01's existing file body
$existingBody = Get-Content "files/.cairn/CLAUDE.md" -Raw
if ($existingBody -match '<!-- cairn-managed') {
    Write-Host "Header already present — skipping prepend (idempotent)."
} else {
    $header = @'
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
    Set-Content -Path "files/.cairn/CLAUDE.md" -Value ($header + $existingBody) -NoNewline
    Write-Host "Header prepended. WS01 body preserved intact."
}
```

```bash
# POSIX bash alternative — prepend header to WS01's existing file body
if grep -q 'cairn-managed' files/.cairn/CLAUDE.md; then
  echo "Header already present — skipping prepend (idempotent)."
else
  header='<!-- cairn-managed: do not edit directly -->
<!--
  This file is the cairn-owned context block for this project.
  It is NOT auto-loaded by any harness — you must import it with a single line
  in your project'\''s CLAUDE.md (Claude Code) or AGENTS.md (Pi/agy):

      @./.cairn/CLAUDE.md

  The adopting agent shows you that line during install (adopt.md Step 6);
  you add it. Cairn never writes to CLAUDE.md or AGENTS.md on your behalf.
  See: https://github.com/winnorton/cairn -- §2.2 (import-line contract).
-->

'
  printf '%s' "$header" > /tmp/cairn_header.md
  cat /tmp/cairn_header.md files/.cairn/CLAUDE.md > /tmp/cairn_combined.md
  mv /tmp/cairn_combined.md files/.cairn/CLAUDE.md
  echo "Header prepended. WS01 body preserved intact."
fi
```

**Case B — `files/.cairn/CLAUDE.md` does NOT exist (WS01 has not yet run):**

STOP. Do not create the file from scratch. WS01 owns the body; WS02 only prepends. Coordinate with the executor running WS01 and return to Phase 2 only after WS01 has delivered `files/.cairn/CLAUDE.md`.

**Why this design:** the header note makes the import convention self-documenting for any adopter who opens the file. The `<!-- cairn-managed -->` sentinel is consistent with WS01's other template files; it signals that the file is maintained by cairn. Prepending (not replacing) is the only shape that respects the §9.5 ownership boundary — WS01 owns the body; WS02 owns the header. `Set-Content` on the full content with the header prefix followed by the preserved body achieves a true prepend without clobbering.

**CHECKPOINT B — verify the prepend succeeded:**

```powershell
# PowerShell
Test-Path "files/.cairn/CLAUDE.md"
# Expected: True (file must already exist, created by WS01)

(Get-Content "files/.cairn/CLAUDE.md")[0] | Select-String "cairn-managed"
# Expected: one match — the header is the FIRST line of the file.

Get-Content "files/.cairn/CLAUDE.md" | Select-String "@./.cairn/CLAUDE.md"
# Expected: one match inside the comment block.

# Confirm WS01 body is still present (adjust this pattern to whatever WS01's body
# actually contains — the point is that WS01's content appears AFTER the header).
(Get-Content "files/.cairn/CLAUDE.md").Count
# Expected: MORE lines than the header alone (8 header lines + blank + WS01 body).
# If the count equals exactly the header-only line count, WS01's body was clobbered — stop.
```

If any check fails: do NOT re-run `Set-Content` blindly. Recover WS01's original content from git (`git show HEAD:files/.cairn/CLAUDE.md` or from WS01's worktree), then re-run Step 1 Case A.

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
3. `docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md` — **WS01 is a hard prerequisite for Phase 2.** WS01 must have moved/created `files/.cairn/CLAUDE.md` before WS02 runs Phase 2. Read WS01's output file before Phase 2 to confirm the body is present and understand its structure; WS02's prepend must leave every byte of WS01's body intact below the header.

**The one constraint most likely to cause a mistake:**

> The canonical user-action Step (Phase 1 Step 2) must describe the USER adding the line, not the AGENT writing it. If your phrasing accidentally says "I will append" or "the agent writes" instead of "you add it", you break master §4 contract #3. Read the wording carefully: "Cairn never writes this line — you add it."

**Recovery for common failures:**

| Failure | Recovery |
|---|---|
| CHECKPOINT B fails — header not on line 1 or body count too low | Do NOT delete the file (it may contain WS01's body). Recover WS01's original content from git; re-run Phase 2 Step 1 Case A (prepend, not replace). |
| Phase 3 Step 1 finds a vendor-path string in `files/.cairn/CLAUDE.md` | Edit the file to remove the offending string; re-run Phase 3 Step 1 |
| Phase 3 Step 2 finds an agent-write pattern in the canonical Step | Edit Phase 1 Step 2 wording to use user-imperative ("you add it"); re-run check |
| WS01 has NOT yet written `files/.cairn/CLAUDE.md` | STOP Phase 2. Phase 1 may complete independently. Return to Phase 2 only after WS01 lands. |
| Phase 2 CHECKPOINT B — WS01 body appears clobbered | Recover WS01's content via `git show HEAD:files/.cairn/CLAUDE.md` or from WS01's worktree; re-run Phase 2 Step 1 Case A (prepend, not replace). |
| adopt.md already has the import Step (WS08 ran first) | Skip Phase 1 Step 2 write action; verify the existing wording matches this spec's canonical text; note any discrepancy for WS08 |

---

## Review Checklist

A fresh-agent peer-reviewer (opus, not the WS02 author) confirms:

- [ ] Status header reads "READY FOR EXECUTOR" (not "STUB").
- [ ] `files/.cairn/CLAUDE.md` exists and contains the import-line explanation in a comment block.
- [ ] The canonical user-action Step wording (Phase 1 Step 2) says "you add it" / "Cairn never writes" — NOT "I will write" or any agent-write form.
- [ ] No step in this spec instructs cairn to write to `CLAUDE.md`, `AGENTS.md`, `~/.claude/**`, `~/.gemini/**`, or `~/.pi/**`.
- [ ] The `@./.cairn/CLAUDE.md` token appears verbatim in both the canonical Step (Phase 1 Step 2) and the `files/.cairn/CLAUDE.md` header note.
- [ ] The Pre-flight halting gate confirms that Phase 2 requires `files/.cairn/CLAUDE.md` to exist (WS01 must have run first); the spec does NOT claim to be parallel-safe with WS01 on that file.
- [ ] Phase 2 Step 1 uses a PREPEND pattern (read existing body, insert header at top, write combined result) — never a bare `Set-Content` / `cat >` that clobbers WS01's body.
- [ ] The Phase 3 hard-contract checks are executable commands, not prose promises.
- [ ] No frozen/hardcoded file lists appear — any "count of X files" uses a programmatic command form (this spec has no such counts; confirm there is nothing to ratchet).
- [ ] The commit message template includes the program reference line and the Wave 0 designation.
- [ ] The Executor Handoff names exactly which section of the program master to read first (§2.2 and §4), not just "read the master."
