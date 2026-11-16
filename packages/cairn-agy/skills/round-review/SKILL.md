---
name: round-review
description: Review one round of executor output against a program master and draft R+1 follow-up stubs plus a self-contained R+1 round master for gaps. Invoke after an executor (Flash, `/goal`, teammate) finishes a round on a `/program` master. Trust-but-verify — executor status files (`task.md`, "all done" claims) are NOT authoritative; disk diff plus the master's `DEFINITION OF DONE` section are. Produces (1) a review report, (2) N R+1 stubs per `/program`'s schema (`SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md`), and (3) an R+1 round master (`SPEC_<NAME>_R<N>_00_MASTER.md`) with execution order, round DoD, and checklist. Elaborate R+1 stubs via `/spec --from <stub>`, then dispatch `/goal execute <round-master-path>`. Exits when zero R+1 stubs remain. Do NOT use on your own implementation or single-spec work (`/peer-review`).
---

# Round Review

When an executor finishes a round of work on a `/program`-produced master, `/round-review`
reads the diff, walks the master's Definition of Done, surfaces gaps, and drafts the next
round of stubs. The skill is the read-end of `/program`'s orchestration loop — `/program`
produces the master and child stubs; `/spec --from <stub>` elaborates; the executor
ships; `/round-review` decides what's left.

## Why this skill exists

Three failure modes recur when an autonomous executor (Flash, `/goal`, an assistant
agent) finishes a multi-phase program and the human checks back in:

1. **Status drift.** The executor's `task.md` checkboxes say "all done"; the working tree
   says "nothing committed." The status file isn't authoritative — it reflects the
   executor's claim, not the reality on disk.
2. **Silent omissions.** The master's §5 DoD names specific files by literal path
   (`tests/unit/mapTelemetry/determinism.test.ts`); the executor shipped 18 other tests
   under that directory but not the one named. Without programmatic DoD-walk, the
   omission hides under "tests pass."
3. **Zero-order findings outside the DoD.** Uncommitted work, broken headline metrics,
   leftover scratch files — things that block shipping but aren't enumerated in §5;
   §5 assumed the executor would land the work properly. `/round-review`
   surfaces these.

The skill encodes the "trust-but-verify" move into a procedure: read the rubric, probe
what exists, walk criterion-by-criterion, name what's missing as drafted R+1 stubs that
become the next dispatch.

## When to use

- An autonomous executor (Flash, `/goal`, a teammate session) has declared finished or
  paused on a round of work against a `/program`-produced master.
- You return to the planning session (typically Opus) and need to assess: ship? draft
  R+1? what got missed?
- Iteration: after each round of execution, until the skill writes zero R+1 stubs.

## When NOT to use

- You authored the executor's implementation — fresh perspective is the whole point;
  reviewing your own output recreates the blind spot. Hand to another agent or session.
- The work is a single `/spec` (not a program-of-specs). Use `/peer-review` directly.
- The executor is still actively working. Wait for a stable change set; mid-execution
  diffs aren't reviewable.
- You don't have access to the program master (`SPEC_<NAME>_00_PROGRAM.md`). Without
  the master, there's no DoD to walk; you'd be making up criteria.

## Distinction from `/peer-review`

| | `/peer-review` | `/round-review` |
|---|---|---|
| Input | One change set (diff/branch/PR) | One round of work against a program master |
| Rubric | Reviewer's judgment + general gap-classes | Program master's §5 DoD (named criteria) |
| Output | Structured review report | Review report + drafted R+1 stubs + R+1 round master |
| Loop role | One-shot pre-merge gate | Iterative — exits when zero R+1 stubs needed |
| Asks | "Did the author miss anything?" | "Did the executor ship what the master required?" |

`/round-review` invokes `/peer-review`-style discipline (fresh perspective, adjacent-file
reads) but layers programmatic DoD-walking on top.

## Steps

### 1. Trust-but-verify the executor's claim

The executor's status file is a CLAIM, not authoritative. Cross-reference:

- Executor's status file (e.g. `task.md`, `implementation_plan.md`, agent's transcript)
  — what the executor *says* it did.
- `git status -sb` against the branch base — what's actually in the working tree.
- `git log --oneline` against the branch base — what's actually committed.
- The program master's `§9` status table — the source of truth for what should exist.

If the executor's status conflicts with disk reality, **disk wins.** Common patterns:

- "All phases [x]" + uncommitted working tree = work happened, never landed in git
- "All phases [x]" + scratch files left behind = executor self-evaluated prematurely
- "Phase N in-progress" + Phase N+M artifacts present = status file drifted

Record the conflict, then proceed with disk-reality as the basis.

### 2. Establish the authoritative change set

The "change set" is whatever ground truth the diff represents — committed or not.

- If committed on a branch: `git diff <base>...HEAD`
- If uncommitted: `git diff HEAD` plus `git status --porcelain` for untracked files
  (untracked files are part of the round's output; they need to land or get cleaned up)
- If split across both: combine. Don't assume the executor committed all the work.

`Glob` and `find` may filter untracked files depending on tooling. Use
`git status --porcelain | grep '^??'` to enumerate untracked explicitly.

### 3. Load the rubric — the master's DEFINITION OF DONE

**Match master sections by TITLE, not §-number.** Real programs insert sections and
the numbers shift (lra's masters carry the DoD at §6, contracts at §3). Everywhere
this skill says "§5" it means *the master's section titled DEFINITION OF DONE,
wherever it's numbered* — same rule for the other shorthands below.

The master's DEFINITION OF DONE section is the criterion list. Read
it line-by-line. Each numbered criterion is one verification target.

Also load (by title):
- PROGRAM GOAL — what the headline metric / primary deliverable is
- CONTRACT SURFACES — what shared APIs must exist
- The status table (in the parallelization section) — which `OPEN` / `in-progress`
  children should have shipped this round (untriggered `DEFERRED (<trigger>)` rows do not
  count as round gaps)
- Child spec §Gate sections — per-workstream success criteria that roll up

Do not improvise criteria. The master is the contract; the executor was bound to it;
review against it.

### 4. Probe what exists on disk

For each load-bearing path named in §5 / child specs, probe:

- `Glob` / `find` / `ls` for file existence
- `grep` for content references (e.g. "is `MapTelemetry` referenced in `tests/runAll.ts`
  per §5.10?")
- Direct `Read` of small load-bearing artifacts (baselines, key new source files,
  documentation files)

This is the **most time-intensive step** for large programs. Use parallel reads where
the artifacts are independent. Delegate to a sub-agent when the file count
exceeds your context budget — give the sub-agent the DoD + the file list + the question
"for each, does it exist with the required content?"

### 5. Walk the DoD criterion-by-criterion

For each numbered criterion in §5, produce a verdict:

| Verdict | Meaning |
|---|---|
| **PASS** | Criterion met; cite file:line evidence |
| **PARTIAL** | Some sub-clauses met, others not; cite which |
| **FAIL** | Criterion not met; cite what's absent |
| **UNVERIFIED** | Can't determine from static analysis (e.g. "tests pass" requires running them) |

Build a table. The table is the spine of the review report.

If a criterion is UNVERIFIED, name what command would verify it. Don't run heavy
verification commands inline unless the user asks — surface them in the report as
"verification commands to run."

### 6. Surface zero-order findings

Things outside §5 that still block shipping:

- All work uncommitted, no branch / PR
- Broken headline metric (the program's reason for existing didn't actually work)
- Catastrophic regression in a base measurement
- Executor scratch files, debug logs, leftover build artifacts in the tree
- `.gitignore` violations
- Master itself drifted (the executor implemented one thing; the master says another;
  one of them is wrong)

These are findings the DoD didn't anticipate — it assumed competent landing.
List them with severity. Zero-order findings often have higher severity than PARTIAL
DoD criteria.

**Triage every finding (DoD and zero-order) three ways:**

| Triage | Action |
|---|---|
| **Ship-blocking** | Becomes an R+1 stub (or blocks the round) — fix before ship |
| **Spec-drift** | The master or child spec is wrong, not the code — reconcile the spec now, with rationale |
| **Subtle** | Real but non-blocking — park one dated line in the master's OPEN QUESTIONS section; do NOT let it evaporate into conversation |

### 7. Draft R+1 stub specs per `/program`'s stub schema

Each FAIL, PARTIAL, or zero-order finding that needs follow-up becomes an R+1 stub.
Write the stub to `docs/specs/SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md` (or wherever the
program's specs live — match the existing folder pattern).

Per `/program`'s stub schema, each stub contains:

```markdown
# SPEC_<NAME>_R<N>_<NN>_<TOPIC>

**Status:** STUB · **Program:** [SPEC_<NAME>_00_PROGRAM](SPEC_<NAME>_00_PROGRAM.md) · **Round master:** [SPEC_<NAME>_R<N>_00_MASTER](SPEC_<NAME>_R<N>_00_MASTER.md) · **Round:** R<N> · **Depends on:** <other R+1 stubs or "none"> · **Parallel-safe with:** <IDs or "all"> · **Severity:** <CRITICAL | HIGH | MEDIUM | LOW>

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

Naming: `R2_01_<TOPIC>`, `R2_02_<TOPIC>`, … sequential within the round. The round
number (R2, R3) increments per `/round-review` invocation, not per stub.

If multiple gaps map to the same workstream, one stub suffices. If a single gap touches
multiple workstreams, one stub still suffices (`Depends on:` and `Files:` fields capture
the spread).

### 8. Draft the R+1 round master — the single dispatch target

**Required for one-line dispatch.** The stubs alone are not enough — the executor
needs a single file to point `/goal` (or equivalent) at, with execution order and
dependencies encoded IN THE FILE rather than in the dispatch prompt's prose. The user
shouldn't have to type "(R2_01 first — X depends on it)" — that knowledge belongs in the file.

Write `docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md` containing:

```markdown
# SPEC_<NAME>_R<N>_00_MASTER — Round <N> Coordination Doc

**Round:** R<N> · **Program:** [SPEC_<NAME>_00_PROGRAM](SPEC_<NAME>_00_PROGRAM.md)
**Status:** Drafted <date> by /round-review · **Severity:** <CRITICAL | HIGH | ...>
**Type:** Round master — elaborate §2 stubs via `/spec --from`, then dispatch this single file with `/goal`.

## 0. Why this round exists
<one paragraph summarizing the Round N-1 outcome + the DoD walk verdict that produced
these stubs. Cite the §5 rows that FAILed or were PARTIAL. This is the executor's
context — without it, R+1 has no purpose-statement.>

## 1. Execution order
<ASCII or markdown dependency graph showing which stub runs first, what fans out, what
serializes. If R<N>_01 must precede the rest (common when prior round was uncommitted),
make this load-bearing.>

## 2. R+1 stubs (the children)
<table: # | spec link | status (OPEN / in-progress / COMPLETE) | severity | one-line goal — one row per stub>

## 3. Round-level Definition of Done
<numbered list — what makes Round <N> shippable. Always include: "Round-review Pass <N+1>
returns zero new R+1 stubs OR a clean ship recommendation." That's the loop exit.>

## 4. First-action checklist
<concrete numbered steps for the executor: read this master, read the program master
sections titled CONTRACT SURFACES, RESOLVED DESIGN DECISIONS (no deferrals), HARD CONTRACT
(when present), and DEFINITION OF DONE (match titles, not §-numbers), open each §2 child
file and confirm its **Status:** header reads READY FOR EXECUTOR (halt if any child file
still reads STUB — elaborate via /spec --from first), inventory the working tree, claim
rows as in-progress and run elaborated specs in §1's order, mark COMPLETE in §2's table
(and in any matching row of the program master's status table)>

## 5. Master amendments (record any here as R<N> lands)
<empty table at draft time; the executor populates if any R<N> stub amends the
program master's contracts. Provides traceability for "the master changed because of
R2_02 finding NN".>

## 6. Exit signal
<one paragraph — when does the executor know this round is done? Typically: §3 DoD all
hold; signal to planning session "R<N> done — ready for round-review".>
```

Elaborate the R+1 stubs via `/spec --from <stub>` (`STUB` → `READY FOR EXECUTOR`), then
dispatch the round master:

```
/goal execute docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md
```

Once stubs are elaborated, one file dispatches the round with no ordering caveats in the
prompt. The execution order, dependencies, DoD, and exit signal all live inside the file.

### 9. Produce the review report

For the user (typically: the planning-session agent invoking this skill, or the user
themselves). Structure:

```
## Round Review — <PROGRAM_NAME> Round <N>

### Executive verdict
<one paragraph — what shipped, what didn't, the headline finding>

### Trust-but-verify cross-check
- Executor claim: <quote>
- Reality on disk: <git status summary>
- Conflict: <yes/no, and what>

### DoD walk (master §5)
| § | Criterion | Verdict | Evidence |
| 5.1 | <criterion> | PASS / PARTIAL / FAIL / UNVERIFIED | <file:line or gap> |
| ... | ... | ... | ... |

### Zero-order findings (outside §5)
<numbered list, severity-ordered>

### R+1 artifacts written
**Round master (the dispatch target):**
- `SPEC_<NAME>_R<N>_00_MASTER.md` — execution order, round DoD, first-action checklist

**Stubs (the children):**
- `SPEC_<NAME>_R<N>_01_<TOPIC>.md` — <one line>
- `SPEC_<NAME>_R<N>_02_<TOPIC>.md` — <one line>
- ...

### Verification commands to run
<commands the user should run to settle UNVERIFIED rows>

### Dispatch line
1. Elaborate stubs: `/spec --from docs/specs/SPEC_<NAME>_R<N>_01_<TOPIC>.md` (repeat per R+1 stub)
2. Execute round: `/goal execute docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md`
(or `no next action — program complete` when zero R+1 stubs remain)

### Next action
"Elaborate the R+1 stubs via `/spec --from`, then dispatch the round master to your executor."
OR
"No follow-up specs needed — program complete. Ship and archive the master, completed children, and round artifacts (leave unbuilt scheduled-deferral specs live in `docs/specs/`)."
```

End with a clear next action.

## R+1 stub naming convention

- `SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md` — `<NN>` zero-padded within the round
- `<N>` is the round number (R2, R3, R4, ...) incremented per `/round-review` invocation
- Stubs from different rounds can coexist in the same folder; the round number prevents
  collision and preserves history
- Naming follows the program master's pattern — if the existing program uses
  `SPEC_<NAME>_R2_<NN>_<TOPIC>.md` (zero-padded `<NN>`), match it; if it uses
  `SPEC_<NAME>_R2_<NN>_<TOPIC>.md` without padding, match that

## Standing instructions (defaults baked in)

These are operating defaults; the user does not re-prompt per session:

- **Trust the disk, not the executor's status file.** Cross-reference always.
- **Probe untracked files explicitly.** `git status --porcelain | grep '^??'` — many
  glob tools filter untracked by default.
- **Walk the DoD criterion-by-criterion.** Don't summarize. The master is the contract;
  every criterion gets a verdict.
- **Zero-order findings get equal weight to DoD criteria.** "Work uncommitted" and
  "headline metric broken" may not be in §5, but they block shipping.
- **R+1 stubs use `/program`'s stub schema exactly.** `Parallel-safe with` in the header,
  Telemetry hook / Diagnostics path / Rollback story sections (with `N/A: <justification>`
  allowed), and the title-matched `/spec --from` elaboration footer are all required. The
  schema is what `/spec --from` reads downstream.
- **Loop exit is when this skill writes zero stubs.** If everything passes, the report
  says so explicitly; the program is done.
- **Surface session metadata at handoff-shaped moments.** Round-review reports are
  themselves a handoff moment — the user takes the report to another session, an
  external executor, or back to their planning agent. The report MUST include the
  current session ID and transcript path (typically alongside the next-dispatch line
  at the bottom). Same reasoning as `/program`'s `Operating rules`;
  3+ instances of "session id and path?"-class queries across two cwar sessions
  (601821ab, 817c311b).
- **Close every report with the next dispatch line.** The Output section already
  promises this; the standing instruction here is reinforcement — never end a
  `/round-review` invocation without the exact paste-shaped prompt for the user's
  next move (typically `/spec --from` on the R+1 stubs followed by
  `/goal execute docs/specs/SPEC_X_R<N>_00_MASTER.md`, or
  `no next action — program complete` if the loop exited cleanly). The signal this
  rule is leaking: the user typing "next step?" or "what's next?" after a report.
  Each occurrence is an agent-side close failure. Reason: cwar session `601821ab`
  produced 4+ instances of "next step?"-class prompts; same pattern as
  `/program`'s `Operating rules`.

## Output

Three artifacts:

1. **Structured review report** (typically 300-700 words) in conversation — the verbal
   verdict for the user.
2. **N R+1 stub files** at `docs/specs/SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md` — per
   `/program`'s stub schema, one per substantive gap.
3. **One R+1 round master** at `docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md` — the single
   round dispatch target. Self-contained: execution order, round DoD, first-action
   checklist all inside. Elaborate the R+1 stubs via `/spec --from <stub>`, then dispatch
   with `/goal execute <round-master-path>` (or the executor environment's equivalent) —
   no ordering caveats in the prompt; the file carries them.

If N == 0: the program is done. Report says so; no stubs or round master are written;
recommends archiving the program master, completed child specs, and any prior round
masters/stubs together (`mkdir -p docs/specs/archive/` + `git mv`, leaving unbuilt
scheduled-deferral specs live in `docs/specs/` and updating relative links on both sides
— `archive/` in each live deferred spec, `../` in the archived master) and completing any
doc/memory-update rows the master's `DEFINITION OF DONE` section carries.

## Companion skills

- `/program` — produces the master + initial stubs `/round-review` reads as input.
  Round-review's output (R+1 stubs) is consumed by `/spec --from` for elaboration in
  the next dispatch.
- `/spec --from <stub>` — elaborates each R+1 stub into a full executable spec when
  the next executor round dispatches.
- `/peer-review` — `/round-review` invokes peer-review-style discipline (fresh
  perspective, adjacent-file reads) but is broader: peer-review checks one change set;
  round-review checks a change set against a named contract (the program master).
  Both can fire on the same round.
- `/note` — when zero-order findings include items that genuinely don't belong in this
  program, file them as notes (different folder, different lifecycle) so they don't
  evaporate or accidentally become R+1 stubs.
