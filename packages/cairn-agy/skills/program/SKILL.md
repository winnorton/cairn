---
name: program
description: Author a program of specs — one master plus parallel workstream stubs in
  docs/specs/. Use for multi-workstream work with shared contracts or cross-cutting
  concerns, or promote an oversized spec with /program --from <spec>. Stubs are
  elaborated by /spec --from <stub>. Do not use for one-executor work, simple changes,
  exploration without a deliverable, or intent capture.
---

# Program

Create one coordination contract and one child stub per independently executable
workstream. The master owns shared decisions and state; `/spec --from <stub>` turns a
child into an executable plan.

## Modes

| Invocation | Action |
|---|---|
| `/program <NAME> [description]` | Author from established intent. |
| `/program --from docs/specs/SPEC_X.md` | Promote an oversized active execution spec; preserve its decisions and review findings. |
| `/program` | Revise the current draft, when one exists. |

Reject sources under `docs/specs/archive/` or `docs/specs/_promoted/`. Also reject a
contract spec: one declaring the contract lifecycle or a Pass 1/2/3 or `RECONCILED`
status. Contract specs remain live; create a new program that links to one instead of
moving it.

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
decision and unresolved finding forward. After the program is written, move the source
to `docs/specs/_promoted/` and prepend a dated link to the program master.

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
2. a stub written now in `docs/specs/`;
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
Dependencies, not wave-wide barriers, control readiness.

The parallel-execution protocol must state:

1. isolate concurrent work in separate worktrees;
2. freeze shared contracts before dependent work fans out;
3. run spec → implementation → fresh adversarial verification → repair until no
   ship-blocking finding remains; reconcile spec drift and date subtle findings in
   `OPEN QUESTIONS`; name cosmetic exemptions in the commit;
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
| 5 | DEFINITION OF DONE | Numbered program-level checks, including docs, memory/handoff, CI, agent surfaces, and fresh verification. |
| 6 | RISKS | Each risk names its mitigating child. |
| 7 | WHY THIS SHAPE | Technical placement and seam rationale. |
| 8 | OPERATIONAL POLICY | Project-tailored CI, baseline, security, or migration policy. |
| 9 | PARALLELIZATION GRAPH + STATUS TABLE | Titled subsections `Workstream registry`, `Dependency DAG`, `Parallel-execution protocol`, and `Status table`. |
| 10 | FIRST-ACTION CHECKLIST | Read master/evidence, claim child, read child, execute, update state. |
| 11 | ARCHITECTURAL RATIONALE FOR THE PROGRAM SHAPE | Evidence that one spec is insufficient. |
| 12 | OPEN QUESTIONS | Dated non-blocking items only. |

Drop or replace `HARD CONTRACT` or `OPERATIONAL POLICY` only when the axes matrix shows
that no such concern applies.

Status rows contain Phase, linked Spec, Status, Owner, and Depends on.

For each registry row, write
`docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md` with:

- `# SPEC_<NAME>_<NN>_<TOPIC>`;
- `**Status:** STUB` plus sibling-relative program link and dependencies;
- `Goal`, `Scope`, `Telemetry hook`, `Diagnostics path`, `Rollback story`, `Gate`, and
  `Files` sections copied from the registry;
- a final instruction to elaborate in place with `/spec --from <this-path>`.

The elaboration instruction tells the next agent to read the master sections titled
`CONTRACT SURFACES`, `RESOLVED DESIGN DECISIONS (no deferrals)`, and the
`Parallel-execution protocol` subsection. Match titles, not section numbers.

### 6. Review and absorb

Gate B begins after the master and stubs form one committed change set. Direct a fresh
agent that did not author them to run `/peer-review` on that diff or branch.

For every finding:

1. assign the next lifetime-sequential `N<N>` label;
2. repair the owning master section or workstream;
3. record pass, summary, and fix location in the revision-history line;
4. commit the absorption separately;
5. offer another review pass or approval.

Repeat until approved.

## Operating rules

- The master status table is authoritative. Executors claim a row with owner and
  `in-progress`, then mark it `COMPLETE` after merge.
- After Gate A approval, when the environment permits parallel agents and ready
  workstreams exist, dispatch them without re-asking; approval authorizes the declared
  parallel plan.
- Link every spec mention to its current path, including conversation status reports.
- Group status reports as shipped, partially shipped, executable, and blocked; include
  verified gates, newly unblocked work, and recommended next dispatches.
- End each completed orchestration step with an exact paste-ready next command. Say
  `no next action — program complete` when the loop has ended.
- At handoff-shaped moments, include available session ID and transcript path.
- After context compaction, reload the master status table and these operating rules
  before reporting or dispatching.

## Output

Confirm in at most 200 words:

- linked master path and linked stub paths;
- promoted-source breadcrumb, when applicable;
- resolved-decision and scheduled-deferral counts;
- `OPEN` workstream count;
- exact next command.

## Companion skills

`/spec` elaborates stubs. `/peer-review` supplies Gate B. `/note` captures unrelated
follow-up work. `/plan` handles conversational alignment before program authoring.
