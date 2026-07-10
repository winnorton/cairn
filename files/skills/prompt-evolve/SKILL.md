---
name: prompt-evolve
description: Author a version-controlled operational prompt for multi-pass work where each pass produces output and reusable insight. Use when work exceeds one execution and has known or discoverable repeatable slices of work, called coverage units, such as years, batches, modules, or dataset cells; triggers include "evolving prompt", "mining prompt", "self-improving prompt", and "process in batches and learn". Primary mode `/prompt-evolve --from SPEC_FILE` extracts a named deliverable to the project's `.cairn/prompt-evolve/NAME_PROMPT.md` without moving the spec. Require inventory-before-write, explicit coverage/stop/re-run semantics, validation, an absolute self-edit target, versioned CHANGELOG, and blocked-work capture. Do not use for single-run work (`/spec`), notes, parallel program decomposition, round review, or subject research (`/lra`).
---

# Prompt-Evolve

Create a durable procedure that every pass reads, executes, and improves. Keep changing
judgment in the prompt; move stable, mechanically checkable rules into schemas, validators,
or tools and reference them from the prompt.

## Invocation and lifecycle

Support `/prompt-evolve --from <SPEC_FILE>`. Cold-start authoring is deferred: if no spec is
given, route the user to `/spec` first.

When a spec names an evolving-prompt deliverable, offer `/prompt-evolve --from <that-spec>`;
do not extract until the user approves.

Read the full spec. Continue only when it contains or names an evolving-prompt deliverable.
Extract an inline draft without changing its intent, or derive the prompt from the spec's
source, target, data model, tools, and coverage unit (repeatable slice of work). It may be known up front
or discovered during early passes; require the prompt to record how it selects the next one.

Write `<NAME>_PROMPT.md` under `<project>/.cairn/prompt-evolve/` when `.cairn/` exists;
otherwise use the legacy `docs/prompt-evolve/`. Create the parent directory if absent. The
prompt gets its own evolving lifecycle.
If the target exists, read it fully and preserve its version, CHANGELOG, coverage, and other
accumulated state. Preview a merge or stop for direction; never replace an evolved artifact
with a new v1 scaffold.
Do not move the source spec: append an idempotent breadcrumb before its first `##` heading,
and let the spec retain its execution or contract lifecycle.

Before writing, preview the target path, create-or-merge decision, kernel behaviors added,
preserved content, and breadcrumb. For an inline draft, distinguish required fixes. Obtain
approval.

## Kernel contract

The generated prompt must:

1. Identify itself as an evolving prompt, name its purpose, source, target, required tools,
   and version.
2. State the data model and invariants that protect existing data.
3. Define an execution loop that performs: tool preflight; inventory of existing state;
   acquisition and classification; dependency-ordered mutation; validation and deduplication;
   self-improvement; final reporting. Phase names and numbering are defaults, not identity:
   specialize, split, or add phases without dropping these behaviors.
4. Define its coverage state and next-unit selection. Allow sequential, bootstrapped,
   emergent, or parallel work; if work fans out, make prompt-state edits serialized or
   explicitly merge-safe.
5. Name its stop and re-run semantics. Bounded units normally become near-no-ops after
   completion; live units remain additive and track their last sweep. Budget, saturation,
   run-until-dry, or another spec-supported strategy may govern stopping.
6. Inventory before every write and verify afterward. State the write order, validator, dedup
   key, and representative source-to-target spot checks.
7. End execution with mandatory self-improvement. Embed this prompt's resolved absolute path
   literally; bump the version; append a CHANGELOG entry; update coverage, reusable rules,
   identifiers, ambiguities, failures, and newly discovered gaps. Never edit the bootstrap or
   master from which a per-project prompt was copied.
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
**Version:** v1

## PURPOSE / DATA MODEL / RULES
## COVERAGE, NEXT-UNIT, STOP, AND RE-RUN SEMANTICS
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
- `/program`: coordinate parallel workstreams; prompt-evolve may still permit merge-safe
  fan-out inside one evolving procedure.
- `/round-review`: verify program rounds and create follow-up artifacts.
- `/lra`: run the researcher/librarian specialization for subject research.
- `/reflect`: capture session-level process lessons; prompt self-improvement captures the
  artifact's domain and execution lessons.
