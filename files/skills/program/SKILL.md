---
name: program
description: Author a program of specs — one master plus parallel workstream stubs in
  docs/specs/. Use for fixed-contract multi-workstream work with shared contracts or
  cross-cutting concerns, or promote an oversized spec with /program --from <spec>.
  Stubs elaborate via /spec --from <stub>; executor rounds verify via /round-review. Do
  not use for repeating partition waves (/swarm), single-executor work (/spec),
  single-file loops (/prompt-evolve), simple changes, or intent capture (/note).
---

# Program

Create one coordination contract and one child stub per independently executable
workstream. The master owns shared decisions and state; `/spec --from <stub>` turns a
child into an executable plan.

## Modes

| Invocation | Action |
|---|---|
| `/program <NAME> [description]` | Author from established intent. |
| `/program --from docs/specs/SPEC_X.md` | Promote an oversized active execution spec. `<NAME>` defaults to the source's. |
| `/program` | Before Gate B approval, revise the current draft. After approval, resume: reload the active master's status table and latest round master, report, and leave frozen sections unrevised. With no `Gate B:` line and dispatched rows, ask which applies. |

Reject sources under `docs/specs/archive/` or `docs/specs/_promoted/`, program and round
masters, and program children (a `STUB`, `DEFERRED`, or `READY FOR EXECUTOR` header).
Also reject a contract spec: one declaring the contract lifecycle or a Pass 1/2/3 or
`RECONCILED` status. Contract specs remain live; create a new program that links to one
instead of moving it.

## Workflow

### 1. Establish evidence and posture

Read the source, relevant project rules, related active and archived specs, and the
files or systems named by the work. Make no implementation changes.
Carry applicable law and memory citations into the durable master or child instruction
at each decision they shape.

Establish whether the target is production or pre-production. Ask once when current
context cannot answer; record `Production-status: <answer>` in the master. Production
requires migration, compatibility, and rollback coverage. Pre-production permits a
clean-slate design.

Require a `LEAD FINDING` containing:

- one sentence naming the gap;
- measurements, dated incidents, or named pain that demonstrates it;
- what the program replaces.

Stop and request evidence when none exists.

For `--from`, read the source and its review history in full. Carry every resolved
decision and unresolved finding forward. After the program is written, ensure
`docs/specs/_promoted/` exists (`mkdir -p`), move the source there (`git mv` when
tracked, plain `mv` when untracked), prepend a dated link to
`../SPEC_<NAME>_00_PROGRAM.md`, and repair relative links in the moved file and in files
linking to it.

### 2. Run the axes gate

Before writing files, propose an axes matrix and wait for user approval.

- **Domain axes:** 5–12 project-specific work areas derived from the evidence. Assign
  provisional `NN` workstream IDs in this matrix; preserve them in the registry.
- **Cross-cutting axes:** telemetry, diagnostics, performance, determinism, rollback /
  migration / compatibility, security, documentation / handoff, CI, tests / fixtures,
  cost / quota, and accessibility / i18n.

Mark every relevant axis `CLAIMED — workstream NN`; mark every other axis `EXCLUDED —
<justification>`. Silence is invalid. This conversational approval is Gate A.

### 3. Freeze program decisions

Define concrete deliverables, explicit non-goals, shared contract surfaces, and the
project-tailored hard contract (for example determinism, security, migration, or
privacy). Anchor the primary metric to user experience when the work has a user-facing
surface.

Resolve every blocking question in `RESOLVED DESIGN DECISIONS (no deferrals)` with
Decision, Resolution, and Rationale. Close with: `Executors do NOT need to revisit any
of these.`

A scheduled deferral is legal only when it has all three:

1. a named round, version, dependency, or trigger;
2. a stub written now in `docs/specs/` with `**Status:** DEFERRED (<trigger>)` and a
   `DEFERRED (<trigger>)` status-table row;
3. explicit user approval.

Cap scheduled deferrals at five; escalate before exceeding the cap. Put only dated,
non-blocking findings in `OPEN QUESTIONS`.

### 4. Define workstreams and execution

Assign every claimed axis to a workstream. Each registry entry contains:

| Field | Contract |
|---|---|
| Goal | One imperative sentence. |
| Scope | 3–6 bounded bullets. |
| Depends on | Workstream IDs or `none`. |
| Parallel-safe with | IDs or `all`. |
| Files | Paths or patterns. |
| Gate | Observable completion criterion. |
| Telemetry hook | Observable state, or `N/A: <reason>`. |
| Diagnostics path | How failures are inspected, or `N/A: <reason>`. |
| Rollback story | How the change is undone, or `N/A: <reason>`. |

Draw a dependency DAG and group work into foundation, parallel, and integration waves.
A workstream is ready when every `Depends on` row reads `COMPLETE`; dependencies, not
wave-wide barriers, control readiness.

The parallel-execution protocol must state:

1. isolate concurrent work in separate worktrees;
2. freeze shared contracts before dependent work fans out, and name one writer or a
   serialized order for every file two workstreams touch;
3. run spec → implementation → fresh non-author verification (a `/peer-review`, or
   parallel skeptics on security, spec-impl drift, error paths, and defensive access
   plus one completeness critic) → repair until no ship-blocking finding remains;
   reconcile spec drift and date subtle findings in `OPEN QUESTIONS`; name cosmetic
   exemptions in the commit;
4. serialize integration into the main context;
5. coordinate through the master status table;
6. derive changing counts programmatically.

Draft every workstream up front. Parallel execution is the default unless dependencies
or the user require sequential work.

### 5. Write the master and stubs

Write `docs/specs/SPEC_<NAME>_00_PROGRAM.md`. Section titles are identities; numbers are
display order. Record date, production status, and revision history in the header. Use
these sections in order:

| § | Required title | Contract |
|---|---|---|
| 0 | LEAD FINDING | Evidence and replacement. |
| 1 | PROGRAM GOAL | Numbered deliverables, non-goals, user-facing metric. |
| 2 | CONTRACT SURFACES | Shared APIs, types, schemas, and invariants. |
| 3 | RESOLVED DESIGN DECISIONS (no deferrals) | Committed answers and scheduled deferrals. |
| 4 | HARD CONTRACT | Load-bearing cross-cutting contract; project-tailored. |
| 5 | DEFINITION OF DONE | Numbered program-level checks, including docs, memory/handoff, CI, agent surfaces, and fresh non-author verification. |
| 6 | RISKS | Each risk names its mitigating child. |
| 7 | WHY THIS SHAPE | Technical placement and seam rationale. |
| 8 | OPERATIONAL POLICY | Project-tailored CI, baseline, security, or migration policy. |
| 9 | PARALLELIZATION GRAPH + STATUS TABLE | Titled subsections `Workstream registry`, `Dependency DAG`, `Parallel-execution protocol`, and `Status table`. |
| 10 | FIRST-ACTION CHECKLIST | Read master/evidence; read the target child and halt unless its header reads `READY FOR EXECUTOR` and every `Depends on` workstream finished in this run or reads `COMPLETE`; execute; report completion to the integrating context. |
| 11 | ARCHITECTURAL RATIONALE FOR THE PROGRAM SHAPE | Evidence that one spec is insufficient. |
| 12 | OPEN QUESTIONS | Dated non-blocking items only. |

Drop or replace `HARD CONTRACT` or `OPERATIONAL POLICY` only when the axes matrix shows
that no such concern applies.

Status rows contain Phase, linked Spec, Status (`OPEN`, `in-progress`, `COMPLETE`, or
`DEFERRED (<trigger>)`), Owner, and Depends on. Each `/round-review` round appends one
`in-progress` row linking its round master.

For each registry row, write
`docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md` with:

- `# SPEC_<NAME>_<NN>_<TOPIC>`;
- `**Status:** STUB`, or `**Status:** DEFERRED (<trigger>)` for a scheduled deferral
  (`/spec --from` flips it to `STUB` once the user confirms the trigger), plus
  sibling-relative program link, `Depends on`, and `Parallel-safe with`;
- `Goal`, `Scope`, `Telemetry hook`, `Diagnostics path`, `Rollback story`, `Gate`, and
  `Files` sections copied from the registry;
- a final instruction to elaborate in place with `/spec --from <this-path>`.

The elaboration instruction tells the next agent to read the master sections titled
`CONTRACT SURFACES`, `RESOLVED DESIGN DECISIONS (no deferrals)`, `HARD CONTRACT` (when
present), and the `Parallel-execution protocol` subsection, matched by title.

### 6. Review and absorb

Gate B begins after the master and stubs form one committed change set. Direct a fresh
agent that did not author them to run `/peer-review` on that diff or branch: an unforked
subagent, or a paste-ready `/peer-review <sha>` for the user to run in a new session.

For every finding:

1. assign the next lifetime-sequential `N<N>` label;
2. repair the owning master section or workstream;
3. record pass, summary, and fix location in the revision-history line;
4. commit the absorption separately;
5. offer another review pass or approval.

Repeat until approved, then record `Gate B: APPROVED <date>` in the master header;
`/spec --from` requires that line.

## Operating rules

- The master status table is authoritative, and only the integrating context (the main
  checkout) edits it: claim a row with owner and `in-progress` at dispatch; mark it
  `COMPLETE` on merge. A worktree executor reports and leaves the master unedited.
  Commit elaborations and status edits before cutting a worktree.
- After Gate B approval, run `/spec --from <stub>` on every `OPEN` row in dependency
  order (`STUB` → `READY FOR EXECUTOR`), skipping `DEFERRED` rows. Dispatch ready
  elaborated workstreams, in parallel where the environment allows, without re-asking;
  Gate B approval authorizes the declared parallel plan.
- Verify completed executor rounds with `/round-review` against `DEFINITION OF DONE`
  (`DEFERRED (<trigger>)` rows do not block completion). Keep child specs in
  `docs/specs/` while the program is active.
- Archive when the latest `/round-review` writes zero stubs, leaves nothing unverified,
  and no row reads `OPEN` or `in-progress`: `mkdir -p docs/specs/archive/`, then
  `git mv` the master, completed child specs, and round masters/stubs there together.
  Repair relative links in every moved file and every file linking to one. Leave
  unbuilt scheduled-deferral specs in `docs/specs/`.
- Work added after archive is a standalone `/spec` linking the archived master: no `NN`,
  no Status header, no master row.
- Link every spec mention to its current path, including conversation status reports.
- Group status reports as shipped, partially shipped, executable, and blocked; include
  verified gates, newly unblocked work, and recommended next dispatches.
- End each completed orchestration step with an exact paste-ready next command. Say
  `no next action — program complete` after the archive commit.
- At handoff-shaped moments, include available session ID and transcript path.
- After context compaction, reload the active master's status table, the latest round
  master, and these operating rules before reporting or dispatching.

## Output

Confirm in at most 200 words:

- linked master path and linked stub paths;
- promoted-source breadcrumb, when applicable;
- resolved-decision and scheduled-deferral counts;
- `OPEN` workstream count;
- exact next command.

## Companion skills

`/spec` elaborates stubs. `/peer-review` supplies Gate B. `/round-review` verifies
executor rounds and drafts follow-up rounds. `/swarm` handles open-ended repeating wave
fan-out. `/note` captures unrelated follow-up work. `/plan` handles conversational
alignment before program authoring.
