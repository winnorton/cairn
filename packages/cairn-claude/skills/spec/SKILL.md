---
name: spec
description: Create or revise an execution or contract spec in docs/specs/ for
  multi-step changes, executor or subagent handoffs, and permanent system contracts. Use
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
| `--from docs/specs/SPEC_*.md` with a `STUB` or `DEFERRED` Status header | Elaborate the program stub in place. |
| Existing elaborated spec or no arguments with a current draft | Review and revise. |

Reject shipped specs under `docs/specs/archive/`, sources under
`docs/specs/_promoted/`, `docs/notes/_promoted/`, or `docs/notes/_done/`, program
or round masters (`SPEC_*_00_PROGRAM.md`, `SPEC_*_R*_00_MASTER.md`), and program children
whose master row reads `COMPLETE`.

## Workflow

### 1. Route the source

Read a `--from` source in full and route by content, not path alone.

**Note:** derive the spec name from its topic. After the spec is written, ensure
`docs/notes/_promoted/` exists (`mkdir -p`), move the note there (`git mv` when tracked,
plain `mv` when untracked), prepend a dated link to `../../specs/SPEC_<NAME>.md`, and
repair relative links in the moved note and in files linking to it.

**Program stub:** require a `**Status:** STUB` or `DEFERRED (<trigger>)` header
(case-insensitive, bold optional) and a program-master link.

- On a `DEFERRED (<trigger>)` header, ask the user whether the trigger is met. On yes,
  set the header to `STUB` and the master row to `OPEN`, then continue; otherwise stop.
- For a stub with no round-master link, require the program master's header to record
  `Gate B: APPROVED`. When absent, ask the user; on yes, record
  `Gate B: APPROVED <date>` there and continue; otherwise stop.

Read the stub, any linked round master, and the program master sections titled
`CONTRACT SURFACES`, `RESOLVED DESIGN DECISIONS (no deferrals)`, `HARD CONTRACT` (when
present), and `Parallel-execution protocol`; titles, not section numbers, are
identities. Read the elaborated spec of every `Depends on` workstream, elaborating
dependencies first. Preserve the stub's Goal, Scope, dependencies, `Parallel-safe with`,
Files, Gate, Telemetry hook, Diagnostics path, and Rollback story. Elaborate the same
file, replace its placeholder, and set its header to `**Status:** READY FOR EXECUTOR`.
Keep its path; write no breadcrumb.

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
| Execution | A standalone spec carries no Status header. A program child carries `**Status:** READY FOR EXECUTOR` while active. A spec under `docs/specs/archive/` has shipped, whatever its header reads. Ship action: step 5. |
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
   stop and surface any path, VCS, tool, or baseline mismatch before Phase 1. A program
   child also halts unless every `Depends on` workstream finished in this run or its row
   reads `COMPLETE`.
4. **Numbered phases and steps** — each step changes one file and shows CURRENT code,
   REPLACEMENT code, and WHY the change is required. For a new file, write
   `CURRENT: file absent`. For a file a dependency changes first, take CURRENT from that
   dependency's REPLACEMENT and label it `CURRENT (after <NN>)`.
5. **Checkpoint after every phase** — verification command, expected result, and
   recovery action.
6. **Post-flight** — final gates, commit-message template with applicable law/memory slug
   citations, and the ship action workflow step 5 selects, written out.
7. **Executor Handoff** — first 2–3 files to read, the highest-risk constraint, and
   recovery for likely failures.
8. **Review Checklist** — observable checks for a reviewer.
9. **OPEN QUESTIONS** — dated non-blocking findings for contract specs and any spec
   that accumulates them.

Write imperatively and use exact code rather than descriptive placeholders. Declare each
command block's shell dialect or make it portable. Estimate files, systems, and tests,
not elapsed time. Embed any applicable repository hard rule at the step where an
executor could violate it.

### 5. Define the ship action

The ship action runs after verification and merge:

- **Standalone execution spec:** `mkdir -p docs/specs/archive/` and `git mv` the spec
  there.
- **Child of an active program:** keep it in `docs/specs/`. The integrating context
  marks its program or round master row `COMPLETE`; it archives with the program.
- **Scheduled-deferral child whose master is archived:** `git mv` it beside the master
  and mark the archived master row `COMPLETE`.
- **Unbuilt scheduled-deferral spec:** stays in `docs/specs/`.
- **Contract spec:** advance the evidence-bearing status in place; a current contract
  spec stays out of `archive/`.

After any move, repair relative links in the moved file and in every file linking to it.

## Output

Confirm in at most 150 words:

- linked spec path and phase count;
- lifecycle;
- open questions;
- note breadcrumb or stub status transition, when applicable;
- exact executor handoff command (`/goal execute <spec-path>`, or the harness's
  equivalent).

## Companion skills

`/note` supplies promotable intent. `/program` and `/round-review` supply stubs.
`/peer-review` verifies the implemented change set. `/plan` supplies pre-authoring
alignment.
