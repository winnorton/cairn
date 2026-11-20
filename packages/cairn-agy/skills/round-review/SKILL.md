---
name: round-review
description: Verify one finished executor round against a /program master and draft the
  next round. Walk the program's DEFINITION OF DONE criterion by criterion against disk
  and git state; executor status files and "all done" claims are claims, not evidence.
  Write R+1 stubs (SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md) plus one self-contained round master
  (SPEC_<NAME>_R<N>_00_MASTER.md) as the single dispatch target; elaborate the stubs via
  /spec --from <stub>. The loop exits when a review writes zero stubs, leaves nothing
  unverified, and every program row is complete. Do not use on your own implementation,
  while the executor is still working, or for single-spec work (/peer-review).
---

# Round Review

Close the `/program` loop: `/program` writes the master and stubs, `/spec --from <stub>`
elaborates, an executor ships, and `/round-review` decides what remains. Disk and git
state are evidence; the executor's status file is a claim.

## Eligibility

- An executor has declared a round finished or paused, and the change set is stable.
- The reviewer did not author the implementation; route your own work to a fresh agent
  or session.
- The program master (`SPEC_<NAME>_00_PROGRAM.md`) is readable; it holds the criteria.
- Run from the main checkout: this skill edits the program master.
- Single-spec work goes to `/peer-review`.

## Workflow

Match master sections by title; section numbers are display order. `docs/specs/` below
means the folder holding the program master.

### 1. Identify the round

The reviewed round is `R<k>`: the highest-numbered `SPEC_<NAME>_R<k>_00_MASTER.md` in
`docs/specs/`, or R1 (the program's original children) when none exists. Its governing
master is that round master, or the program master for R1. New artifacts are `R<N>` with
`N = k + 1`.

### 2. Cross-check the claim against disk

Compare the executor's status file or transcript claim with `git status -sb`,
`git log --oneline <base>..HEAD`, and the governing master's status table, where
`<base>` is the commit that added the governing master
(`git log --diff-filter=A --format=%h -- <master-path> | tail -1`). When that prints
nothing, or the commit also holds round work, ask the user for the base. Disk wins every
conflict; record the conflict in the report.

The change set is committed work (`git diff <base>..HEAD`) plus uncommitted work
(`git diff HEAD`) plus untracked files (`git status --porcelain | grep '^??'`; glob
tools skip them). Untracked files are round output: they land or get removed.

When the change set and every unmerged executor branch hold no work on this round's
`Files`, the round has not run: stop and report it as undispatched.

### 3. Load the rubric

- From the program master: `DEFINITION OF DONE` (each numbered criterion is one
  verification target), `PROGRAM GOAL`, `CONTRACT SURFACES`, and the status table.
- From a governing round master: its round-level Definition of Done, stub table, and
  master amendments.
- From each child or stub dispatched this round, and each program row short of
  `COMPLETE` with work on disk: its `Gate`.

Two row kinds are outside this round's gaps: untriggered `DEFERRED (<trigger>)` rows,
and `OPEN` rows with no work on disk (report those as executable next). Review against
the written criteria only.

### 4. Probe disk

For every path the rubric names, check existence, grep the required references, and read
small load-bearing artifacts (baselines, new source files, docs) plus the unchanged
files adjacent to them. Parallelize independent reads. Past your context budget,
delegate to a sub-agent with the criteria, the file list, and the question "does each
exist with the required content?"

### 5. Walk every criterion

Give each program criterion, round criterion, and dispatched `Gate` one verdict:

| Verdict | Meaning |
|---|---|
| PASS | Met; cite `file:line`. |
| PARTIAL | Some sub-clauses met; cite which. |
| FAIL | Not met; cite what is absent. |
| UNVERIFIED | Static analysis cannot decide; name the command that would. |

Run heavy verification commands only at the user's request; otherwise list them in the
report.

Then reconcile the program master's status table with the verdicts. A row becomes
`COMPLETE` when its `Gate`, and the `Gate` of every stub that `Closes` it, reads PASS.
The reviewed round's row becomes `COMPLETE`; its remaining gaps live in `R<N>`.

### 6. Surface zero-order findings

List, with severity, the blockers the criteria did not anticipate: uncommitted work or
no branch/PR; a broken headline metric; a regression in a base measurement; scratch
files, debug logs, or build artifacts left in the tree; `.gitignore` violations; drift
between a master and what was implemented.

Triage every finding, criterion and zero-order alike. A FAIL or PARTIAL criterion is
ship-blocking unless the spec is reconciled or the criterion waits on an `OPEN` or
`DEFERRED` row:

| Triage | Action |
|---|---|
| Ship-blocking | Becomes an R+1 stub. |
| Spec-drift | The master or child spec is wrong, not the code: reconcile the spec now, with rationale. |
| Subtle | Real and non-blocking: add one dated line to the program master's `OPEN QUESTIONS`. |
| Out of program | File a `/note`. |

### 7. Draft R+1 stubs

Write one stub per ship-blocking finding to
`docs/specs/SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md`, `<NN>` sequential within the round and
padded as the program's children are; merge findings that share a workstream. Use
`/program`'s stub schema plus the round fields:

```markdown
# SPEC_<NAME>_R<N>_<NN>_<TOPIC>

**Status:** STUB · **Program:** [SPEC_<NAME>_00_PROGRAM](SPEC_<NAME>_00_PROGRAM.md) · **Round master:** [SPEC_<NAME>_R<N>_00_MASTER](SPEC_<NAME>_R<N>_00_MASTER.md) · **Round:** R<N> · **Closes:** <program status-table rows NN, or "none"> · **Depends on:** <other R<N> stubs or "none"> · **Parallel-safe with:** <IDs or "all"> · **Severity:** <CRITICAL | HIGH | MEDIUM | LOW>

## Goal
## Scope
## Telemetry hook
## Diagnostics path
## Rollback story
## Gate
## Files

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md`. Read the round master (`SPEC_<NAME>_R<N>_00_MASTER.md`) and program master sections titled `CONTRACT SURFACES`, `RESOLVED DESIGN DECISIONS (no deferrals)`, `HARD CONTRACT` (when present), and `Parallel-execution protocol` — match titles, not §-numbers.
```

`Closes` names the program status-table rows the stub finishes. `Telemetry hook`,
`Diagnostics path`, and `Rollback story` accept `N/A: <reason>`.

### 8. Draft the round master

With one or more stubs, write `docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md`: the single
dispatch target, carrying execution order and dependencies in the file so the dispatch
prompt carries none. With zero stubs, write no round master.

```markdown
# SPEC_<NAME>_R<N>_00_MASTER — Round <N> Coordination Doc

**Round:** R<N> · **Program:** [SPEC_<NAME>_00_PROGRAM](SPEC_<NAME>_00_PROGRAM.md)
**Status:** Drafted <date> by /round-review · **Severity:** <CRITICAL | HIGH | ...>
**Type:** Round master — elaborate the §2 stubs via `/spec --from`, then dispatch this single file.

## 0. Why this round exists
<one paragraph: the Round <N-1> outcome and the verdicts that produced these stubs. Cite
each FAIL or PARTIAL criterion by its DEFINITION OF DONE number and each zero-order
finding. This is the executor's purpose statement.>

## 1. Execution order
<dependency graph: which stub runs first, what fans out, what serializes>

## 2. R<N> stubs
<table: # | spec link | status (OPEN / in-progress / COMPLETE) | closes (program row) | severity | one-line goal>

## 3. Round-level Definition of Done
<numbered list of checks the executor can verify that make Round <N> shippable, plus
every criterion or Gate this review left UNVERIFIED, each with its command>

## 4. First-action checklist
<numbered steps: read this master; read the program master sections titled CONTRACT
SURFACES, RESOLVED DESIGN DECISIONS (no deferrals), HARD CONTRACT (when present), and
DEFINITION OF DONE (match titles, not §-numbers); open each §2 stub and halt if any
**Status:** header still reads STUB (elaborate via /spec --from first); inventory the
working tree; take OPEN rows in §1's order, skipping COMPLETE rows, and start a stub only
when each Depends-on stub finished in this run or reads COMPLETE; mark each row
in-progress, then COMPLETE, in §2 and in the program-master row its Closes field names.
The context that merges edits these tables; a worktree executor reports instead.>

## 5. Master amendments
<empty table at draft time; the executor adds one row per program-master contract an
R<N> stub amends, naming the stub and the finding>

## 6. Exit signal
<when the executor knows the round is done: §3 holds; signal the planning session
"R<N> done — ready for /round-review">
```

In the program master's status table, append one `in-progress` row linking the round
master and set each `Closes` row back to `in-progress`. Stage by path the round master,
stubs, and edited masters, and commit them as one change set, so worktrees and the next
review see them. The next action is `/spec --from <stub>` on each stub in dependency
order (`STUB` → `READY FOR EXECUTOR`), a commit of the elaborations, then dispatch of
the round master:

```
/goal execute docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md
```

Use the harness's equivalent where `/goal` is absent.

### 9. Report

```
## Round Review — <PROGRAM_NAME> Round <k>

### Executive verdict
<one paragraph: what shipped, what did not, the headline finding>

### Claim versus disk
- Executor claim: <quote>
- Disk: <git status / git log summary>
- Conflict: <none, or what>

### Criteria walk
| Source | Criterion | Verdict | Evidence |
| DEFINITION OF DONE 1 | <criterion> | PASS / PARTIAL / FAIL / UNVERIFIED | <file:line or gap> |
| Round DoD 1 | ... | ... | ... |
| Gate <NN> | ... | ... | ... |

### Zero-order findings
<numbered, severity-ordered, each with its triage>

### R<N> artifacts written
- Round master: [SPEC_<NAME>_R<N>_00_MASTER.md](docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md)
- Stubs: [SPEC_<NAME>_R<N>_01_<TOPIC>.md](docs/specs/SPEC_<NAME>_R<N>_01_<TOPIC>.md) — <one line> (one per stub)

### Verification commands to run
<commands that settle UNVERIFIED rows>

### Next action
1. `/spec --from docs/specs/SPEC_<NAME>_R<N>_01_<TOPIC>.md` (repeat per stub)
2. `/goal execute docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md`
— or, with zero stubs, the Exit section's next action —

Session: <session ID> · Transcript: <path>
```

## Exit

The program is complete when this review writes zero stubs, leaves no criterion or
`Gate` UNVERIFIED, and no program-master row reads `OPEN` or `in-progress`. Short of
that, withhold the archive recommendation:

- an UNVERIFIED verdict: report `pending verification`, list the commands, and offer to
  run them;
- an `OPEN` row: report it as the next dispatch;
- an `in-progress` row with no stub: report it as blocked and name what its `Gate`
  still lacks.

On completion, the next action is `/program`'s archive rule: `mkdir -p
docs/specs/archive/`, `git mv` the program master, completed children, and round
artifacts together, repair relative links in moved and linking files, and leave unbuilt
scheduled-deferral specs in `docs/specs/`. Say `no next action — program complete` after
that commit.

## Output

A 300–700 word report in conversation, the R+1 stubs, and the round master. Close with
the paste-ready next command plus the session ID and transcript path when available.

## Companion skills

`/program` writes the master and the stub schema this skill reads. `/spec --from <stub>`
elaborates R+1 stubs. `/peer-review` reviews one change set and can run on the same
round. `/note` holds findings outside the program.
