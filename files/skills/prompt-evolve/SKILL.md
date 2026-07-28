---
name: prompt-evolve
description: Author a version-controlled operational prompt for multi-pass work where each pass produces output and reusable insight. Use when work exceeds one execution and has known or discoverable repeatable slices of work, called coverage units, such as years, batches, or modules; triggers include "evolving prompt", "mining prompt", "self-improving prompt", and "process in batches and learn". Two modes: `/prompt-evolve NAME` cold-starts from a five-input brief; `--from SPEC_FILE` extracts a spec's deliverable. Both write `.cairn/prompt-evolve/NAME_PROMPT.md`. Require inventory-before-write, a coverage table, ACTIVE/HELD state, stop/re-run semantics, an absolute self-edit target, versioned CHANGELOG, and blocked-work capture. Do not use for single-run work (`/spec`), notes, parallel decomposition (`/program`), open-ended wave fan-out (`/swarm`), round review, or subject research (`/lra`).
---

# Prompt-Evolve

Create a durable procedure that every pass reads, executes, and improves. Keep changing
judgment in the prompt; move stable, mechanically checkable rules into schemas, validators,
or tools and reference them from the prompt.

## Invocation and lifecycle

Two entry modes produce the same artifact under the same kernel:

- `/prompt-evolve <NAME>` — cold start. Author from the brief below. A spec is not a
  prerequisite; the brief is.
- `/prompt-evolve --from <SPEC_FILE>` — extract a deliverable a spec already names.

When a spec names an evolving-prompt deliverable, offer `/prompt-evolve --from <that-spec>`;
do not extract until the user approves.

### Cold-start brief

Resolve five inputs before writing. Take each from the conversation where it is already
settled, and ask for the remainder in one batched question.

| Input | Resolves |
|---|---|
| Source | where units come from |
| Target | what a pass writes, and where |
| Data model | records, keys, and the invariants that protect existing data |
| Tools | the preflight set |
| Coverage unit | the repeatable slice, or how pass 1 discovers it |

Echo the resolved five with the target path, then author on approval. When the answers
describe work that runs once, route to `/spec` and stop.

### Extract mode

Read the full spec. Continue only when it contains or names an evolving-prompt deliverable.
Extract an inline draft without changing its intent, or derive the prompt from the spec's
source, target, data model, tools, and coverage unit (repeatable slice of work). It may be known up front
or discovered during early passes; require the prompt to record how it selects the next one.

### Placement — both modes

Write `<NAME>_PROMPT.md` under `<project>/.cairn/prompt-evolve/` when `.cairn/` exists;
otherwise use `docs/prompt-evolve/`. Where a project already keeps evolving prompts in one of
these directories, put the new one beside them. Create the parent directory if absent. The
prompt gets its own evolving lifecycle.
If the target exists, read it fully and preserve its version, CHANGELOG, coverage, and other
accumulated state. Preview a merge or stop for direction; never replace an evolved artifact
with a new v1 scaffold.
A new loop gets its own file. Every other prompt in the directory keeps whatever state its own
header declares — `ACTIVE` and `HELD` prompts alike stay untouched by this authoring run, and
a quiet file means held or unswept rather than finished.

Extract mode also leaves the source spec in place: append an idempotent breadcrumb before
its first `##` heading, and let the spec retain its execution or contract lifecycle.

Before writing, preview the target path, create-or-merge decision, kernel behaviors added,
preserved content, and the breadcrumb where extract mode applies. For an inline draft,
distinguish required fixes. Obtain approval.

## Kernel contract

The generated prompt must:

1. Identify itself as an evolving prompt, name its purpose, source, target, required tools,
   version, and lifecycle state — `ACTIVE`, or `HELD (<date>, <why>)` for a loop paused with
   work still open. A held prompt keeps its coverage table current as of the hold, so a later
   pass reads state from the file rather than from mtimes. A prompt spawned from a narrowed
   predecessor names its parents as a read-only inheritance boundary: cite a parent for
   provenance, record new evidence under this prompt's own id prefix, and leave every parent
   unexecuted and unedited.
2. State the data model and invariants that protect existing data.
3. Define an execution loop that performs: tool preflight; inventory of existing state;
   acquisition and classification; dependency-ordered mutation; validation and deduplication;
   self-improvement; final reporting. Phase names and numbering are defaults, not identity:
   specialize, split, or add phases without dropping these behaviors.
4. Carry a coverage table and a next-unit selection rule: one row per unit with kind, status,
   the pass that last touched it, and a one-line result. Projects name it locally — scoreboard,
   coverage ladder, partition anchors, calibration table. Seed it when the unit space
   enumerates up front; where the axis emerges from the work, leave it empty and let it form
   rather than forcing a partition before the data shows one. Status vocabulary follows the
   unit kind in item 5. Allow sequential, bootstrapped, emergent, or parallel work; if work
   fans out, make prompt-state edits serialized or explicitly merge-safe.
5. Name its stop and re-run semantics. Bounded units run to a completion rubric and normally
   become near-no-ops afterward; live units remain additive and track their last sweep. Budget,
   saturation, run-until-dry, narrowing aperture, or another spec-supported strategy may govern
   stopping. Narrowing aperture holds a loop that still works but whose passes now cover less
   ground than a fresh loop on untouched territory would: read it off the coverage table when
   headline rows are settled and only fine-grained ones remain, then set `HELD` rather than
   declaring completion. Treat an unexpectedly large bounded re-run write volume as a signal —
   the prior run was incomplete or the source changed — and investigate before committing.
6. Inventory before every write and verify afterward. State the write order, validator, dedup
   key, and representative source-to-target spot checks.
7. End execution with mandatory self-improvement. Embed this prompt's resolved absolute path
   literally; bump the version; append a CHANGELOG entry; settle the coverage-table row for the
   unit just run; update reusable rules, identifiers, ambiguities, failures, and newly
   discovered gaps. Never edit the bootstrap or master from which a per-project prompt was
   copied.
8. Include a `v1 (initial)` CHANGELOG entry plus a literal v2+ entry template. Record enough
   evidence to explain what changed and what the next pass inherits.
9. Stage blocked writes under `Pending Re-run` with enough data to retry. Name where tool
   workarounds accumulate when tool failures are plausible.

Reject a draft that cannot satisfy the kernel without contradicting its spec; return it to
`/spec` for correction.

## Compact artifact shape

Use only the sections the domain needs, but cover this shape:

```markdown
# <Project> — <Task> Evolving Prompt
> **Type:** evolving prompt. Edit this file after every pass.
**Version:** v1 · **State:** ACTIVE | HELD (<date>, <why>)
**Inherits (read-only):** <parent prompt(s), or "none">

## PURPOSE / DATA MODEL / RULES
## COVERAGE TABLE  <!-- name it locally: scoreboard, coverage ladder, partition anchors -->
| Unit | Kind | Status | Last pass | Result |
|---|---|---|---|---|
| <unit> | bounded / live | <per-kind vocabulary> | — | — |
## NEXT-UNIT, STOP, AND RE-RUN SEMANTICS
## ACCUMULATING STATE
## THE RUN
### PRE-FLIGHT
### INVENTORY EXISTING
### ACQUIRE / CLASSIFY
### WRITE (dependency order)
### VERIFY / DEDUP
### SELF-IMPROVEMENT
Edit target: <RESOLVED_ABSOLUTE_PATH>
### FINAL REPORT
**Pending Re-run:** <full retry data or "none">
## FAILURE MEMORY (when applicable)
## CHANGELOG
- **v1 (initial):** Scaffold seeded; no units processed.
- **v{N} (<unit>, YYYY-MM-DD):** <headline, evidence, lessons, next state>.
```

## Strategy boundary

Treat execution choices as project-local strategies, not universal scaffold:

- Stop: budget-gated, bounded run-until-dry, target-count saturation, or a live recurring sweep.
- Coverage: naive sequential, bootstrap-then-fill, emergent partition, or merge-safe fan-out.
- State: canonical IDs, anchors, coverage ladder, audit-derived rules, fallback matrix, or the
  domain's equivalent.

Record the chosen strategies in the artifact. Keep a new strategy project-local until three
projects independently surface it; then propose it for Cairn's shared catalog.

## Breadcrumb and report

Append once to the source spec:

```markdown
> **Evolving prompt extracted:** `<path>/<NAME>_PROMPT.md` on `<date>` via
> `/prompt-evolve --from <SPEC_FILE>`. It now has its own evolving lifecycle;
> this spec keeps its declared lifecycle.
```

Report in under 250 words: file written, source spec, kernel fixes applied, breadcrumb line,
and the next unit to run. Explain its re-run expectation; do not always promise a near-no-op.

## Boundaries

- `/spec`: author the upstream execution or contract artifact.
- `/program`: coordinate parallel workstreams that archive on completion; prompt-evolve may
  still permit merge-safe fan-out inside one evolving procedure.
- `/swarm`: run open-ended wave fan-out where the coordination master itself evolves. One
  file iterating over units is prompt-evolve; many stubs per wave that never archive is swarm.
- `/round-review`: verify program rounds and create follow-up artifacts.
- `/lra`: run the researcher/librarian specialization for subject research.
- `/reflect`: capture session-level process lessons; prompt self-improvement captures the
  artifact's domain and execution lessons.
