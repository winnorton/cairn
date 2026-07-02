---
name: program
description: Author a program-of-specs — one master coordination doc plus N workstream child stubs in `docs/specs/` — for substantial work that exceeds a single spec's scope. Use when work spans multiple parallel-team workstreams, has load-bearing cross-cutting concerns (telemetry, diagnostics, CI gates), or a single `/spec` grew large enough that peer-review surfaces cross-section consistency bugs. Cold-start via `/program <NAME>` or promote a too-large spec via `/program --from docs/specs/SPEC_X.md`. Bakes in no-deferral discipline, cross-cutting axes coverage, and peer-review at the master-commit gate. Stubs are elaborated by `/spec --from <stub>`. Do NOT use for single-phase work (use `/spec`) or intent capture (use `/note`).
---

# Program

A coordinated set of specs — one master + N workstream children — for work that exceeds a
single spec's scope. The master is the contract surface every child cites; each child is
one parallel-executor target. `/program` produces the structure and the stubs;
`/spec --from <stub>` elaborates each child into a full executable spec.

## Why this skill exists

Substantial work has three recurring failure modes that a single `/spec` cannot defend
against:

1. **Silent gaps** — telemetry, diagnostics, rollback, docs/handoff get omitted as
   "not the feature." The feature ships; the observability around it never does.
   Future debugging pays the bill.
2. **Drift via deferral** — "out of scope, future work" rows accumulate. The work never
   comes back. The deferred item dies in the section heading.
3. **Cross-section consistency bugs** — a single ~25k-word spec develops contradictions
   between §3 and §7 that the author can't see and the reviewer catches only after
   multiple passes. Splitting into a master + children breaks the long-doc-consistency
   trap.

`/program` is the structural antidote. The shape of the artifact is the discipline:
required sections force gap-prevention; a `§3 Resolved Design Decisions (no deferrals)`
header forces resolution; a `§9 status table` IS the orchestration state file; a
`§11 Architectural rationale` section forces the author to justify why this needed to
be a program rather than a single spec.

## When to use

- Work spans 5+ phases that can be executed by parallel teams (one phase = one worktree
  = one executor agent).
- The work has load-bearing cross-cutting concerns (telemetry, diagnostics, baselines,
  CI gates, determinism, security) that need to be claimed by named children, not left
  to "we'll get to it."
- A single `/spec` has grown so large that peer-review surfaces cross-section
  consistency bugs — promote it to a program via `/program --from`.
- You want one contract surface that all parallel executors cite, with a status table
  that survives session boundaries.

## When NOT to use

- Single-phase or single-file work. `/spec` is the right verb.
- Intent capture, "I want to remember this." `/note` is the right verb.
- Pre-action alignment with the user. `/plan` is the right verb.
- A change small enough that two children would feel like over-decomposition.
- Open exploration without a concrete deliverable shape — discuss until shape exists,
  then `/program`.

## Distinction from /spec

| | `/spec` | `/program` |
|---|---|---|
| Output | One markdown file: `docs/specs/SPEC_<NAME>.md` | One master + N child files: `SPEC_<NAME>_00_PROGRAM.md` + `SPEC_<NAME>_<NN>_<TOPIC>.md` |
| Use when | Single executable plan, one executor | Multi-workstream, parallel executor teams, cross-cutting concerns |
| Decomposition | Phases within one file | Workstreams as separate child files, coordinated by the master |
| Deferral discipline | Implicit | Explicit: `§3` resolves everything; overflow only as scheduled deferrals |
| Cross-cutting coverage | Implicit | Project-tailored axes pass at Gate A |
| State tracking | None | §9 status table embedded in the master |

`/spec` elaborates one plan. `/program` orchestrates many. `/program` produces *stubs*
that `/spec --from <stub>` then elaborates into full plans.

## Invocation modes

- `/program <NAME> [description]` — **cold-start.** Author from intent. Use when the
  user knows up front this is multi-workstream work.
- `/program --from <SPEC_FILE>` — **promote-from-spec.** Read an existing spec, decompose
  into master + children, preserve every resolved decision, fold any prior peer-review
  findings into `§3 Resolved Design Decisions` as resolution rows, move the original to
  `docs/specs/_promoted/` as a breadcrumb. Use when `/spec` outgrew one file.
- `/program` (no args) — review-and-revise the current conversation's draft program if
  one exists.

## Steps

### 1. Parse input and ask the production-status gate

**If `--from <SPEC_FILE>`:**
1. Read the source spec in full.
2. Read its peer-review history if recorded (the spec's revision history section, prior
   review comments).
3. Use AUTO naming to derive `SPEC_<NAME>_00_PROGRAM.md` from the source spec's name.
4. Treat the source's resolved decisions as already-locked input to `§3`.
5. After writing the program, move the source: `git mv docs/specs/SPEC_X.md docs/specs/_promoted/SPEC_X.md` and add a header line `> Promoted to docs/specs/SPEC_<NAME>_00_PROGRAM.md on <date>` to the moved file.

**Cold-start: ask the production-status gate once.**

> *"One question before drafting: is this work running against a production system, or
> is the codebase pre-production / no users yet? The answer changes scope discipline —
> pre-production allows clean-slate solutions; production forces migration and
> backward-compat thinking."*

Record the answer in the program master's header block as `Production-status: <answer>`
and let it gate every scope decision in subsequent sections.

### 2. Author §0 LEAD FINDING — with evidence

The first section of the master is `§0 LEAD FINDING`. It justifies the program's
existence with concrete evidence — measured data, prior incidents, named pain. NOT
speculation, NOT "it would be nice if."

Format:
- One-sentence headline: what's broken or absent.
- A short evidence table or numbered list — rounds of work that failed, measured numbers
  that prove the gap, prior incidents with dates.
- One paragraph closing: what the program replaces, in concrete terms.

If the user cannot supply evidence, surface this as a blocker:
> *"§0 needs concrete evidence (measurements, prior incidents, named pain) before I
> draft the rest. What's the strongest piece of evidence this work needs to exist?"*

A program without a real §0 is a program speculating about scope. Refuse to proceed
without it.

### 3. Axes pass — domain + cross-cutting menu (GATE A)

This is the gap-prevention gate. Pause here.

**Domain axes** — propose, from the §0 evidence and the user's intent, what work areas
this program covers. Examples vary per project: representation, persistence, generation,
query, rendering, persistence, authentication, billing migration, observability, etc.
Aim for 5–12 axes; each becomes a candidate workstream.

**Cross-cutting axes** — walk the menu below and, for each, propose either CLAIMED (a
workstream will own this) or EXCLUDED (with one-line justification). Silence is not
allowed.

Menu (project-tailored — adjust to what applies):

- Telemetry / observability
- Diagnostics tools (agent-readable surfaces, dump commands, MCP tools)
- Performance / hot path / benchmarks
- Determinism / reproducibility (if this project hashes state)
- Rollback / migration safety / backward compat (gated by production-status from step 1)
- Security / authn / authz
- Documentation / handoff artifacts (CLAUDE.md updates, NOTE files, runbooks)
- CI / lint / pre-commit hooks
- Test fixtures / data / coverage
- Cost / quota (if external services)
- Accessibility / i18n (if user-facing)

**GATE A — Informal user sign-off on the axes matrix.**

Present the table to the user in conversation (no file commit yet — the master doesn't
exist on disk at this stage):

```
## Axes (proposed)

### Domain
- <axis>: <one-line scope>
- ...

### Cross-cutting
- Telemetry: CLAIMED — workstream <NN>
- Diagnostics: CLAIMED — workstream <NN>
- Performance: EXCLUDED — pre-production, benchmarks deferred to v1.0 cycle
- Determinism: CLAIMED — workstream <NN>
- Security: N/A — engine-internal, no user-facing surface
- ...
```

Then say:
> *"Axes drafted. This is the gap-prevention gate — any axis silently absent here gets
> silently absent in the program. Review the table and either approve, request
> additions/removals, or ask me to justify a CLAIMED/EXCLUDED choice. Say 'proceed'
> when satisfied."*

This gate is **informal alignment**, not `/peer-review` — the artifact is conversational,
not yet a change set. `/peer-review` is built for diffs/branches/PRs; running it on an
unwritten matrix doesn't fit its shape. Iterate with the user until they sign off, then
advance to Step 4. The signed-off axes become §3's workstream list.

### 4. Workstreams + DAG + parallel execution protocol

For each axis that's CLAIMED (domain or cross-cutting), draft a workstream entry. The
workstream table is the §3 workstream registry (numbering: 01, 02, …, NN).

**Workstream stub schema — every entry has these fields:**

- **Goal** — one sentence, imperative.
- **Scope** — what's in this workstream (3–6 bullets).
- **Depends-on** — list other workstreams that gate this one. Or "none."
- **Parallel-safe-with** — list workstreams this can fan out alongside. Or "all."
- **Files** — paths or path patterns touched.
- **Gate** — what makes this workstream reviewable as done (one sentence).
- **Telemetry hook** — what observable state this workstream produces. Or
  `N/A: <justification>`.
- **Diagnostics path** — how to debug failures in this workstream. Or
  `N/A: <justification>`.
- **Rollback story** — how to undo if it lands badly. Or
  `N/A: <justification>` (e.g. "pre-production, rollback = git revert").

Silent omission of telemetry / diagnostics / rollback is the most common gap. The
schema is the defense.

**Dependency DAG** — ASCII or markdown table. Group workstreams into waves:
- Wave 0: foundation / contract-freezing workstreams that gate the rest.
- Wave 1: parallel-safe workstreams that build on Wave 0 contracts.
- Wave 2: integration / breadth / closure workstreams.

Waves overlap, they don't barrier. A workstream in Wave 1 starts as soon as its specific
deps in Wave 0 are reviewable, not when all of Wave 0 is done.

**Parallel execution protocol** (§9.3 in the master) — project-tailored, but typically
includes:

1. One worktree per workstream (mechanical: `git worktree add ...`). Parallel agents
   editing a shared worktree corrupt the index.
2. Contracts freeze before fan-out — Wave 0 publishes the cross-child contracts that
   Wave 1 builds against.
3. Per-workstream loop: spec → code → **adversarial verification** → revise →
   re-verify until clean. The verification is a cold `/peer-review` or a
   parallel-verifier workflow (several skeptics on distinct concern axes — security,
   spec-impl drift, error paths, defensive access — plus one completeness critic),
   by agents that did NOT author the code. Findings triage three ways: ship-blocking →
   fix before ship; spec-drift → reconcile the spec; subtle → park in the master's
   OPEN QUESTIONS section. Empirical basis (lra): 7 of 7 application workstreams
   had a ship-blocking bug only this pass caught. Cosmetic-only workstreams may
   skip it — name the skip and why in the commit message.
4. Integration serialized through main context. Worktrees merge one at a time, not in
   parallel.
5. Coordination stays in main context. The master doc + the §9 status table are the
   single coordination surface.
6. Programmatic counts ("`rg <pattern> -c`"), not frozen numbers, when the spec cites
   "N consumers."

Project-tailor the protocol; cite the project's existing memories / rules / laws inline
(e.g. `[MEM feedback/<name>]`, `[RULE <slug>]`) so the protocol roots in lived
experience, not theory.

### 5. §3 Resolved Design Decisions (no deferrals)

This section's literal header — **`§3 Resolved Design Decisions (no deferrals)`** — is
non-negotiable. Every open question gets a resolution row:

| Decision | Resolution | Rationale |
|---|---|---|
| <question> | <committed answer> | <why this answer, not the alternatives> |

The section closes with: *"Executors do NOT need to revisit any of these."*

**Scheduled deferral — the ONLY legal deferral form (hard cap, default ≤ 5).** This
is the canonical definition; everywhere else in this skill "scheduled deferral" means
exactly this. If a decision genuinely must wait, it appears as a deferral row WITH:

- WHEN it gets done — name a round (R2, R3) or version (v0.X) or trigger ("after
  workstream NN lands"). "Eventually" is not a value.
- A stub spec file drafted at this time, sitting in `docs/specs/` ready for the next
  fan-out. Deferral becomes scheduling, not vanishing.
- Approval from the user — "is this OK to defer, or should it be in this round?"

If the count would exceed the cap, escalate to the user before drafting.
Forcing prioritization beats accumulating debt.

### 6. Hard contract / Risks / DoD / Architectural rationale

Round out the master with the remaining required sections:

- **§4 HARD CONTRACT (project-tailored)** — the load-bearing cross-cutting contract
  this program must hold. The contract's identity depends on the project:
  *Determinism* (if state-hashing — typically: telemetry/observability/diagnostics are
  non-hashable derived state, never participate in the hash); *Security* (if
  auth-sensitive — what surfaces the program must not leak, what the auth seam is);
  *Migration* (if production — backward-compat invariants, rollback discipline);
  *Privacy* (if user-data-handling). Pick the one(s) that bind this program. Drop the
  section only if no hard contract applies (rare).
- **§5 Program-level Definition of Done** — numbered list. Each criterion is concrete
  and verifiable (a grep, a test name, a passing CI step). Include rows for: doc
  updates, memory updates, MCP tool / agent surface (if applicable), CI gate, **and
  a verification row: every substantive workstream passed adversarial verification
  (cold peer-review or parallel-verifier workflow) with ship-blocking findings
  closed — exemptions named per workstream.** The DoD
  is what makes the program reviewable as a whole, not just child-by-child.
- **§6 Risks** — table with a **Child column** assigning each risk to the workstream
  that owns its mitigation. No homeless risks.
- **§7 Why this shape** — short bulleted rationale for the technical design choices
  (where things live, why this seam, what one-fact justifies each).
- **§8 Operational policy** (if applicable) — ratchet/CI/baseline policy if the program
  produces measurable artifacts; security review policy if security-sensitive; etc.
- **§9 Parallelization graph + status table** — the DAG (ASCII or markdown) plus a
  status table:

| Phase | Spec | Status | Owner | Depends on |
|---|---|---|---|---|
| 01 | [`SPEC_<NAME>_01_<TOPIC>.md`](SPEC_<NAME>_01_<TOPIC>.md) | OPEN | — | (foundational) |
| 02 | [`SPEC_<NAME>_02_<TOPIC>.md`](SPEC_<NAME>_02_<TOPIC>.md) | OPEN | — | 01 |
| ... | ... | ... | ... | ... |

Spec entries are markdown links (sibling-relative inside the master). When this table —
or any subset of its rows — is rendered in a chat reply to the user, keep the links.
See the **Spec-link discipline** standing instruction below.

Executors claim rows by marking `Status: in-progress, Owner: <name/model>` and mark
`COMPLETE` when their workstream merges. The status table is the orchestration state
file — it lives in the master, not in a sidecar.

- **§10 First-action checklist** — concrete numbered steps the executor follows: read
  this master end-to-end, read §0's evidence source, claim a phase from §9, read that
  phase's child spec, execute, mark complete.
- **§11 Architectural rationale for the program shape** — meta-section. Required.
  Answers: *"Why is this a program rather than a single spec?"* The user explicitly
  asked this question, so the section is required. Acceptable answers cite: spec size
  (e.g. single-file v1 exceeded N k-words), peer-review surfacing cross-section
  consistency bugs, parallel teams ready to execute, precedent (another program in
  this project that took this shape).

### 7. Stub file generation

For each workstream entry in §9.1 (the workstream registry), write a stub child file at
`docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md`. The stub contains:

```markdown
# SPEC_<NAME>_<NN>_<TOPIC>

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_<NAME>_00_PROGRAM](SPEC_<NAME>_00_PROGRAM.md) · **Depends on:** <from workstream entry>

## Goal
<from workstream entry>

## Scope
<from workstream entry>

## Telemetry hook
<from workstream entry, or N/A with justification>

## Diagnostics path
<from workstream entry>

## Rollback story
<from workstream entry>

## Gate
<from workstream entry>

## Files
<from workstream entry>

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md`. The elaborating session reads the master's CONTRACT SURFACES, RESOLVED DESIGN DECISIONS, and Parallel-execution protocol sections plus this workstream's registry entry before drafting — **match sections by TITLE, not §-number** (programs insert sections; numbers shift).
```

Stubs are hand-off-ready: an executor can claim the row in §9, read the master + stub,
and either execute directly (if the work is mechanical) or invoke `/spec --from` to
expand the stub into a full plan first.

### 8. GATE B — commit, then `/peer-review` on the change set

The master + stub files are drafted on disk. Stage them and tell the user:

> *"Program drafted. Master at `docs/specs/SPEC_<NAME>_00_PROGRAM.md` + N stub files.
> Stage and commit these (or ask me to) before peer-review — `/peer-review` reads a
> change set, so the files need to be a coherent diff against the branch base. Once
> committed, run `/peer-review` (or hand the PR/branch to a fresh agent that did NOT
> author the draft)."*

`/peer-review`'s shape requires a change set (`git diff <base>...HEAD`, a PR ref, or
an equivalent). A draft in conversation isn't reviewable by that skill. Commit first;
the review then has a stable artifact to read.

### 9. Absorb peer-review findings (the iteration loop)

The reviewer returns a structured report — typically a numbered "Problems" list per
`/peer-review`'s output format. For each finding:

1. **Tag with an N-label.** `/program`'s own convention: re-tag the reviewer's
   numbered findings as `N1`, `N2`, `N3` in the master's revision-history line. The
   N-label is internal bookkeeping for traceability across passes; the reviewer does
   not emit it.
2. **Fold the resolution into the owning section.** Often `§2 Contract Surfaces` or
   `§3 Resolved Design Decisions`. Edit the section in place.
3. **Update the revision-history header line** in the master, e.g.:
   *"Revision history: Drafted <date>. Pass 2 surfaced N1 (<one-line>, fixed in §2.5),
   N2 (<one-line>, fixed in §3), N3 (<one-line>, fixed in workstream 04)."*
4. **Commit the absorption** as a follow-up commit (separate from the original draft
   commit). This keeps the review-iteration history readable.
5. **Re-present.** Ask: *"Run another review pass, or approve?"* Repeat until the user
   says "approve" or "satisfied."

### 10. Present and exit

Tell the user:
- Master saved to `docs/specs/SPEC_<NAME>_00_PROGRAM.md`.
- N stub files written: `SPEC_<NAME>_01_<TOPIC>.md` through `SPEC_<NAME>_<NN>_<TOPIC>.md`.
- (If `--from`) Source spec moved to `docs/specs/_promoted/<original>.md`.
- §3: decisions resolved + scheduled-deferral count (each has its WHEN and stub).
- §9 status table: K workstreams OPEN, ready for executor claims.
- Next move: *"Claim workstreams from §9. For each one, either execute directly (if
  mechanical) or `/spec --from docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md` to elaborate
  the stub into a full plan first."*

## Status reporting templates (post-authoring)

After the program is authored and execution begins, the most common output shape is a
**status report** to the user — "what shipped, what's executable, what's blocked, what's
next." These reports are not part of program authoring but ARE part of operating the
program. Three templates the skill explicitly endorses. All three obey the
**Spec-link discipline** standing instruction — every spec mention is a markdown link.

### A. Shipped report — single spec just landed

Use when one executor finishes one workstream:

```markdown
## [<Phase>.<NN> <Topic>](docs/specs/archive/SPEC_<NAME>_<NN>_<TOPIC>.md) SHIPPED ✅

| Commit | What |
|---|---|
| `<hash>` | <commit subject> |

### Files landed
| Path | Lines | Role |
|---|---|---|
| `<path>` | <count> | <one-line role> |

### Gates verified
| Gate | Result |
|---|---|
| `<command>` | ✅ <result> |

### Unblocks
- ✅ [<Phase>.<NN> <Topic>](docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md) — <what's now executable>

### Next bottleneck-unlocks
[<Phase>.<NN>](docs/specs/...) · [<Phase>.<NN>](docs/specs/...) — pick one or say which.
```

### B. Program state — current snapshot grouped by lifecycle

Use when the user asks "where are we" or "list status." Group by **lifecycle phase**
(shipped → partially shipped → executable → blocked), not by track:

```markdown
## <Program name> state

### Shipped (in `docs/specs/archive/`)
| Spec | What | Commit |
|---|---|---|
| [<Phase>.<NN> <Topic>](docs/specs/archive/SPEC_..._NN_TOPIC.md) | <one-line> | `<hash>` |

### Partially shipped (specs still live)
| Spec | Status |
|---|---|
| [<Phase>.<NN> <Topic>](docs/specs/SPEC_..._NN_TOPIC.md) | Phase 0 + Step A wired; Step B unblocked, Step C blocked on <NN> |

### Executable now (elaborated, awaiting executor)
| Spec | Track | Blocked-or-unblocked |
|---|---|---|
| [<Phase>.<NN> <Topic>](docs/specs/SPEC_..._NN_TOPIC.md) | <track> | <one-line dep state> |

### Coordination layer (still live)
[Top master](docs/specs/SPEC_<NAME>_00_PROGRAM.md) · [<Phase> master](docs/specs/...) · ...

### Recommended next moves
| Action | Spec links |
|---|---|
| Highest-leverage parallel pair | [<NN>](docs/specs/...) ‖ [<NN>](docs/specs/...) — independent tracks |
| Land follow-ups for X | [<NN> Steps B+C](docs/specs/...) — both now unblocked |
```

### C. Execute list — concise next-moves table

Use when the user asks specifically for execution recommendations:

```markdown
| Action | Spec links | Rationale |
|---|---|---|
| <action> | [<NN>](docs/specs/...) ‖ [<NN>](docs/specs/...) | <one-line> |
```

### Reference shape

The gold-standard shape: every spec is a link; lifecycle groupings are explicit; the
"Coordination layer" footer points back at all masters with one-line link list;
"Recommended next moves" closes with actionable spec links. Match that shape across all
three templates — consistency makes status reports skimmable across sessions.

If the executor model produces a status report without links — for instance ``"P1.04
SHIPPED, unblocks P5.01 Step C and P1.05"`` — that's the failure mode this section
exists to prevent. The user should be able to click any spec name and land in the right
file.

## Required sections in the program master (the spec)

The master MUST contain these sections in this order. **Section TITLES are the
identity; §-numbers are display-order only.** Real programs insert project-specific
sections (a conceptual model, a domain DDL) and every number after the insertion
shifts — lra's shipped masters have contracts at §3 and DoD at §6. Any skill, stub,
or review that references a master section does it by TITLE. Section names are
normative — agents and reviewers grep for them.

| § | Section | Purpose |
|---|---|---|
| 0 | LEAD FINDING | Evidence-based justification for the program's existence |
| 1 | PROGRAM GOAL | Numbered concrete deliverables + explicit non-goals |
| 2 | CONTRACT SURFACES | Load-bearing cross-child APIs, types, schemas, invariants |
| 3 | RESOLVED DESIGN DECISIONS (no deferrals) | Every open question with resolution + rationale |
| 4 | HARD CONTRACT (project-tailored) | The load-bearing cross-cutting contract — e.g. Determinism, Security, Migration, Privacy |
| 5 | DEFINITION OF DONE | Numbered, verifiable, program-level (not child-level) |
| 6 | RISKS | Table with child-attribution column |
| 7 | WHY THIS SHAPE | Bulleted technical-design rationale |
| 8 | OPERATIONAL POLICY | Project-tailored (CI, ratchet, baselines, etc.) |
| 9 | PARALLELIZATION GRAPH + STATUS TABLE | Container for all parallel-execution structure. Sub-sections — §9.1 Workstream registry (the workstream list, with Goal/Scope/Depends-on/Parallel-safe-with/Files/Gate/Telemetry-hook/Diagnostics-path/Rollback-story per entry); §9.2 Dependency DAG (ASCII or markdown graph + wave grouping); §9.3 Parallel-execution protocol (worktree isolation, contract freeze, per-workstream peer-review loop, serialized integration, programmatic counts); §9.4 Status table (the orchestration state file — claim / complete / blocked per row). |
| 10 | FIRST-ACTION CHECKLIST | Concrete numbered steps for the first executor |
| 11 | ARCHITECTURAL RATIONALE FOR THE PROGRAM SHAPE | Why this is a program, not a single spec |
| 12 | OPEN QUESTIONS | Parking spot for non-blocking items only — verifier findings triaged "subtle" and questions that surfaced post-decision. One dated line each. Anything that blocks a workstream is a §3 resolution row or a scheduled deferral (Step 5), never an open question. |

`§4` and `§8` are project-tailored — keep them when they apply, replace with another
hard-contract section if a different concern is load-bearing, drop only if neither
applies (rare).

## Cross-cutting axes menu (default — adjust per project)

- Telemetry / observability
- Diagnostics tools (agent-readable surfaces, dump commands, MCP tools)
- Performance / hot path / benchmarks
- Determinism / reproducibility
- Rollback / migration safety / backward compat
- Security / authn / authz
- Documentation / handoff artifacts
- CI / lint / pre-commit hooks
- Test fixtures / data / coverage
- Cost / quota (external services)
- Accessibility / i18n (user-facing)

Each item gets CLAIMED (by a workstream) or EXCLUDED (with justification). Silence is
not allowed.

## N-labeled review findings convention (program-internal)

This is `/program`'s **own absorption bookkeeping**, not something `/peer-review`
emits. `/peer-review` returns a structured "Problems" list with plain numbering (1, 2,
3...) per its documented format. When `/program` folds findings into the master, it
re-tags each as `N<N>` and records the trace in the master's revision-history line.
The N-prefix is a within-master convention so multiple review passes can be
distinguished without collision.

Per-finding fields after absorption:

- N-tag: `N1`, `N2`, ... — numbered sequentially across the master's lifetime, not
  restarted per pass
- One-line description: what the reviewer flagged
- Fix location: which section absorbed it (`fixed in §X.Y` or `fixed in workstream NN`)
- Pass: which review pass surfaced it (`Pass 2`)

The master's revision-history header preserves the trace:

> *Revision history: Drafted 2026-06-06 (single-file). Restructured into program
> 2026-06-06 after peer-review Pass 2 surfaced N1 (signature swap, fixed in workstream
> 05), N2 (premise refactor, fixed in §2.5 + workstream 01), N3 (stale risk row, fixed
> in §6).*

This lets a future reader (or executor) trace why §2.5 has the shape it does back to
N2 in Pass 2, even months after the program ships.

This is what makes the peer-review loop traceable — finding-by-finding visibility into
what the master absorbed and from which pass.

## Standing instructions (defaults baked in — do not re-prompt)

These are operating defaults for `/program`. The user does not need to re-type them per
session:

- **No deferrals** — every open question gets a `§3` resolution row or a scheduled
  deferral (Step 5). Silence is the only banned outcome.
- **User-experience anchoring** — When the work has a user-facing surface, the primary
  headline metric of `§1` is user-experience anchored ("time to stable frame rate",
  "p95 user-perceived latency", "successful onboarding completion"), not
  engine-internal ("tick time", "query throughput"). Engine-internal metrics live as
  supporting buckets, not the headline.
- **Production-status gates scope discipline** — The answer from Step 1 controls
  rollback/migration framing throughout. Pre-production unlocks clean-slate solutions;
  production forces compat thinking.
- **Complete enumeration** — All phases drafted up front. No "we'll see what comes up
  after Phase 1." A genuine unknown becomes a scheduled deferral, not silence.
- **Parallel-team default** — Assume executor teams will work in parallel unless the
  user says otherwise. §9.3 protocol assumes worktree isolation; §9.4 status table
  assumes multiple owners.
- **Spawn subagents proactively for executor-style work** — When child specs are
  elaborated and one or more workstreams are ready to execute (concrete Goal, Scope,
  Files, parallel-safe-with declared), invoke subagents directly rather than asking
  the user "should I spawn?" The user chose `/program` over `/spec` — that choice IS
  the standing consent for parallel execution. The signal this rule is leaking: the
  user typing "spawn sonnet agents", "address all issues and spawn the agents",
  or repeating "execute X" after the prior round didn't fan out. Each occurrence
  is an agent-side close failure, not a user request — you waited where the user
  had already authorized. Reason: cwar session `601821ab` produced 3+ instances of
  the user re-authorizing parallel execution mid-session (Jun 9 23:08, Jun 10 13:19,
  Jun 10 14:41); standing consent isn't standing if the agent asks every time.
  Exceptions — sequential-only work (one workstream blocks all others), or the user
  has explicitly asked for an in-session implementation.
- **Surface session metadata at handoff-shaped moments** — When the user signals a
  context-switch ("commit and push", "stand by for completion", external-executor
  dispatch, `/reflect` closing a major work unit, or any prompt that implies they're
  about to leave this session), the response MUST include the current session ID and
  transcript path in a clearly-visible location — typically a small block at the
  bottom alongside the next-dispatch line, OR a one-line header on the response. The
  signal this rule is leaking: the user typing "session id and path?", "what is the
  current sessionid and location?", or similar metadata queries. Each occurrence is
  the prior output failing to volunteer it. Reason: cwar session `601821ab` produced
  2 instances (Jun 9 23:50, Jun 10 00:55) and `817c311b` produced 1 more (Jun 11
  01:07) — 3+ instances across two distinct sessions, gate met.
- **Close every output with the next dispatch line** — When ending any response
  that completes a step in the orchestration loop (master drafted, peer-review
  absorbed, stubs written, executor round verified, gap identified, etc.), the
  bottom of the response MUST contain the exact paste-shaped prompt for the user's
  next move. Examples — `/peer-review docs/specs/SPEC_X_00_PROGRAM.md` after a
  master commit; `/goal execute docs/specs/SPEC_X_R<N>_00_MASTER.md` after
  `/round-review`; `/spec --from docs/specs/SPEC_X_NN_STUB.md` after stub
  generation. If there is genuinely no next dispatch (program shipped + archived,
  or the loop exited cleanly), say so explicitly — "no next action — program
  complete." The signal this rule is leaking: the user typing "next step?",
  "what's next?", or "list the next specs". Each occurrence is the prior output
  failing to close. Reason: cwar session `601821ab` produced 4+ instances of
  "next step?"-class prompts (Jun 9 14:32, Jun 9 16:47, Jun 10 11:25, Jun 10 11:48);
  recurring "what now?" is an agent-side gap, not a user question.
- **Two gates with distinct shapes** — Gate A (axes pass) is **informal user sign-off**
  in conversation; the artifact isn't a change set yet, so `/peer-review` doesn't fit.
  Gate B (full master + stubs) is **commit-then-`/peer-review`**: stage the files,
  commit, then run review on the change set. Findings get absorbed via Step 9's N-label
  bookkeeping. Iterate until the user says "approve."
- **Spec-link discipline** — every mention of a spec in any output (status tables,
  shipped reports, "what unblocks what" listings, execute lists, conversation replies)
  is a markdown link to the spec file's current path. No bare `P1.04` or
  `SPEC_X_NN_TOPIC` references. Use relative paths from repo root: `docs/specs/...`
  for live specs, the project's archive directory (e.g. `docs/specs/archive/...` or
  `docs/planning/archive/...`) for shipped specs after lifecycle move. Apply the same
  discipline to commit hashes when a remote URL is available. The user should never
  have to ask "where's that spec?" — the link IS the answer. This is load-bearing for
  multi-session orchestration where status reports are the primary output shape; see
  the **Status reporting templates** section below.

  **Compaction-survival sub-rule (post-reinjection requirement, added 2026-06-09):**
  When an auto-compaction summary fires during a session running this skill, the
  very next assistant turn after the compaction MUST re-state the Spec-link
  discipline in working state — either inline in a thinking block, or as an
  explicit *"Resuming `/program` with spec-link discipline active"* sentence at
  the top of the response — BEFORE producing any status output. Reason: cairn
  build session `601821ab` proved this rule isn't compaction-resistant on its
  own — the user gave the same feedback twice in one session (at L1096 and again
  at L1948), separated by an auto-compaction. The first instance produced this
  discipline; the second proved it didn't survive the context reset.

  **Generalization (applies to every Standing Instruction in this section):**
  Discipline that lives only in the skill's session-load needs explicit
  post-compaction reinforcement. When an auto-compaction fires mid-session,
  re-state every active standing instruction this skill enforces before
  resuming. The compaction summary contains *what's been done*; it doesn't
  reliably preserve *what discipline governs how future output is shaped*.
  Re-stating is the cheap defense.

## Output

A confirmation under ~200 words listing:
- Program master path
- Stub file count and paths
- (If `--from`) breadcrumb move confirmation
- §3 counts (resolved + scheduled deferrals, per Step 10's report line)
- §9 OPEN-row count, next-action prompt

## Companion skills

- `/spec` — elaborates each stub child into a full executable plan via
  `/spec --from docs/specs/SPEC_<NAME>_<NN>_<TOPIC>.md`. `/program` produces the stubs;
  `/spec` fills them in.
- `/peer-review` — the review verb Gate B and the absorption loop (Step 9) call.
  `/program` doesn't invoke it directly; it recommends the user run it after the
  master + stubs are committed.
- `/note` — when a peer-review surfaces items that genuinely don't belong in this
  program, file them as notes so they don't evaporate. Distinct from scheduled
  deferrals (owned by a future round of THIS program); notes are intent capture for
  unrelated work.
- `/plan` — pre-action behavioral alignment. Different verb, different output. `/plan`
  happens before user approval; `/program` happens after.
