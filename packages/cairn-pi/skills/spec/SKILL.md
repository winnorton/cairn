---
name: spec
description: Create or revise an execution or contract spec in docs/specs/ for
  multi-step changes, Flash or subagent handoffs, and permanent system contracts. Use
  /spec --from <note> to promote intent or /spec --from <program-stub> to elaborate a
  workstream stub in place. Do not use for parallel multi-workstream plans (/program),
  single-file multi-pass loops (/prompt-evolve), repeating wave fan-out (/swarm),
  lightweight notes (/note), conversational alignment (/plan), simple edits, or Q&A.
---

# Spec

Produce one research-backed implementation contract for one executor. `/program` is
the multi-workstream form; `/note` is lightweight capture; `/plan` is conversational
alignment.

## Modes

| Input | Action |
|---|---|
| Task description | Write `docs/specs/SPEC_<NAME>.md`. |
| `--from docs/notes/NOTE_*.md` | Promote the note to a new spec. |
| `--from docs/specs/SPEC_*.md` with `**Status:** STUB` | Elaborate the program stub in place. |
| Existing elaborated spec or no arguments with a current draft | Review and revise. |

Reject shipped specs under `docs/specs/archive/`, sources under
`docs/specs/_promoted/`, `docs/notes/_promoted/`, or `docs/notes/_done/`, and program
or round masters (`SPEC_*_00_PROGRAM.md`, `SPEC_*_R*_00_MASTER.md`).

## Workflow

### 1. Route the source

Read a `--from` source in full and route by content, not path alone.

**Note:** derive the spec name from its topic. After the spec is written, ensure
`docs/notes/_promoted/` exists (`mkdir -p`), move the note there (`git mv` when tracked,
plain `mv` when untracked), prepend a dated link to `../../specs/SPEC_<NAME>.md`, and
adjust any relative links inside the moved file.

**Program stub:** require a case-insensitive `**Status:** STUB` (or `Status: STUB`)
header and a program-master link (reject `**Status:** DEFERRED` until its trigger is met
and flipped to `STUB`). Read the stub, any linked round master, and the program
master sections titled `CONTRACT SURFACES`, `RESOLVED DESIGN DECISIONS (no deferrals)`,
`HARD CONTRACT` (when present), and `Parallel-execution protocol`; titles, not section
numbers, are identities. Preserve the stub's Goal, Scope, dependencies, `Parallel-safe
with`, Files, Gate, Telemetry hook, Diagnostics path, and Rollback story. Elaborate the
same file, replace its placeholder, and set its `**Status:**` header to `READY FOR
EXECUTOR` (stripping any `STUB` elaboration note). Keep its path; write no breadcrumb.

Treat any other active single-executor spec as revision input and warn that it is
already elaborated.

### 2. Establish intent and evidence

Proceed when current context supplies at least two of:

1. symptom or goal;
2. file or system reference;
3. success criterion.

Otherwise ask for the missing goal, location, and observable success condition before
research.

Read applicable project rules, every expected change target, related active and archived
specs, and current tests or gates. Record source-of-truth drift. Make no implementation
changes.

### 3. Choose the lifecycle

Default to an **execution spec**. Use a **contract spec** only when project rules or the
user designate the spec as permanent source of truth.

| Lifecycle | State contract |
|---|---|
| Execution | Standalone specs carry no status field and move to `docs/specs/archive/` (`mkdir -p` + `git mv`, adjusting relative links across directory depth) after verified ship. Program child specs carry `**Status:** READY FOR EXECUTOR` while active; while their parent program remains active in `docs/specs/`, keep them in `docs/specs/` (marking their governing program/round master row `COMPLETE` on merge) until program-complete archival. When a scheduled-deferral child ships after its parent master is already in `docs/specs/archive/`, move the child to `docs/specs/archive/` with `git mv`, mark its archived master row `COMPLETE`, and restore sibling-relative links (`archive/` overrides child status headers). |
| Contract Pass 1 | `**Status:** DRAFT (Pass 1 — design)` before implementation. |
| Contract Pass 2 | `**Status:** SHIPPED (Pass 2 — synced with <files> on <date>; <gate>)` after implementation and fast gate. |
| Contract Pass 3 | `**Status:** SHIPPED (Pass 3 — adversarial verification; <findings closed>)` after a fresh non-author pass — a `/peer-review`, or parallel skeptics on distinct axes (security, spec-impl drift, error paths, defensive access) plus one completeness critic — with every ship-blocking finding closed. |
| Contract audit | `**Status:** RECONCILED (<date> — <drift repaired>)` on periodic audit. |

Update a contract spec before its implementation. A fresh agent given only the contract
spec set must be able to reproduce the system's shape and behavior. Name any cosmetic
Pass 3 exemption in the commit message.

### 4. Write the artifact

Include:

1. **Header** — date, model, requester, lifecycle, and promoted-source link when present
   (for elaborated stubs, keep the stub metadata line and append authoring metadata).
2. **Human Intent** — verbatim request, extracted goal, scope, and success criterion.
3. **Pre-flight** — baseline commands with expected results. Make this a halting gate:
   stop and surface any path, VCS, tool, or baseline mismatch before Phase 1.
4. **Numbered phases and steps** — each step changes one file and shows CURRENT code,
   REPLACEMENT code, and WHY the change is required. For a new file, write
   `CURRENT: file absent`.
5. **Checkpoint after every phase** — verification command, expected result, and
   recovery action.
6. **Post-flight** — final gates, commit-message template with applicable law/memory slug
   citations, and the lifecycle transition (`mkdir -p` + `git mv` to `archive/` with
   adjusted relative links for standalone execution specs or deferred children whose
   parent master is already archived, plus marking the archived master row `COMPLETE`;
   governing program/round master status-table `COMPLETE` update in place for children
   of an active program; status-line advance for contract specs).
7. **Executor Handoff** — first 2–3 files to read, the highest-risk constraint, and
   recovery for likely failures.
8. **Review Checklist** — observable checks for a reviewer.
9. **OPEN QUESTIONS** — dated non-blocking findings for contract specs and any spec
   that accumulates them.

Write imperatively and use exact code rather than descriptive placeholders. Keep one
file per step. Declare each command block's shell dialect or make it portable. Estimate
files, systems, and tests, not elapsed time. Embed any applicable repository hard rule
at the step where an executor could violate it.

### 5. Finish the lifecycle action

- Note promotion: write the spec, then move and annotate the source note.
- Stub elaboration: preserve the path and fields; update only its `**Status:**` header
  and elaborated content.
- Execution-spec ship: after verification, ensure `docs/specs/archive/` exists (`mkdir
  -p`) and move a standalone spec (or a deferred child whose parent master is already in
  `docs/specs/archive/`, marking its archived master row `COMPLETE` and restoring
  sibling-relative links) to `docs/specs/archive/` with `git mv`, adjusting any relative
  links across directory depth; while a parent program remains active in `docs/specs/`,
  keep completed children in `docs/specs/` with their governing program/round master row
  marked `COMPLETE` until program-complete archival (unbuilt scheduled-deferral specs
  remain live in `docs/specs/`).
- Contract-spec ship: advance the evidence-bearing status in place; never archive a
  current contract spec.

## Output

Confirm in at most 150 words:

- linked spec path and phase count;
- lifecycle;
- open questions;
- note breadcrumb or stub status transition, when applicable;
- exact executor handoff command.

## Companion skills

`/note` supplies promotable intent. `/program` supplies stubs. `/peer-review` verifies
the implemented change set. `/plan` supplies pre-authoring alignment.
