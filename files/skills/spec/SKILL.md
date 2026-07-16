---
name: spec
description: Create or revise an executable spec in docs/specs/ for multi-step changes
  and executor handoffs. Use /spec --from <note> to promote intent or /spec --from
  <program-stub> to elaborate it in place. Do not use for simple edits, lightweight
  notes, pure Q&A, or conversational planning.
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
| `--from docs/specs/SPEC_*.md` with `Status: STUB` | Elaborate the program stub in place. |
| Existing elaborated spec or no arguments with a current draft | Review and revise. |

Reject shipped specs under `docs/specs/archive/` and any source under
`docs/specs/_promoted/` or `docs/notes/_promoted/`.

## Workflow

### 1. Route the source

Read a `--from` source in full and route by content, not path alone.

**Note:** derive the spec name from its topic. After the spec is written, move the note
to `docs/notes/_promoted/` and prepend a dated link to the new spec.

**Program stub:** require a case-insensitive `Status: STUB` header and a program-master
link. Read the stub and the master sections titled `CONTRACT SURFACES`, `RESOLVED DESIGN
DECISIONS (no deferrals)`, and `Parallel-execution protocol`; titles, not section
numbers, are identities. Preserve the stub's Goal, Scope, dependencies, Files, Gate,
Telemetry hook, Diagnostics path, and Rollback story. Elaborate the same file, replace
its placeholder, and change `STUB` to `READY FOR EXECUTOR`. Keep its path; write no
breadcrumb.

Treat any other active spec as revision input and warn that it is already elaborated.

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
| Execution | No status field. Active in `docs/specs/`; move to `docs/specs/archive/` after verified ship. |
| Contract Pass 1 | `**Status:** DRAFT (Pass 1 — design)` before implementation. |
| Contract Pass 2 | `SHIPPED` with synced files, date, and fast-gate evidence. |
| Contract Pass 3 | `SHIPPED` after a fresh-perspective pass — a `/peer-review`, or parallel skeptics on distinct axes (security, spec-impl drift, error paths, defensive access) plus one completeness critic — with every ship-blocking finding closed. |
| Contract audit | `RECONCILED` with date and drift repaired. |

Update a contract spec before its implementation. A fresh agent given only the contract
spec set must be able to reproduce the system's shape and behavior. Name any cosmetic
Pass 3 exemption in the commit message.

### 4. Write the artifact

Include:

1. **Header** — date, model, requester, lifecycle, and promoted-source link when present.
2. **Human Intent** — verbatim request, extracted goal, scope, and success criterion.
3. **Pre-flight** — baseline commands with expected results. Make this a halting gate:
   stop and surface any path, VCS, tool, or baseline mismatch before Phase 1.
4. **Numbered phases and steps** — each step changes one file and shows CURRENT code,
   REPLACEMENT code, and WHY the change is required. For a new file, write
   `CURRENT: file absent`.
5. **Checkpoint after every phase** — verification command, expected result, and
   recovery action.
6. **Post-flight** — final gates, commit-message template, and the lifecycle transition.
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
- Stub elaboration: preserve the path and fields; flip only its status and content.
- Execution-spec ship: after verification, move the spec to `docs/specs/archive/`;
  folder location is status.
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
