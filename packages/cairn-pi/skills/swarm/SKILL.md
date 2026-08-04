---
name: swarm
description: A living coordination surface for multi-workstream work that repeats
  over partitions and never finishes. Fan-out parallel stubs per wave, review results,
  self-improve the master, fan out the next wave. Use when work spans parallel
  workstreams AND iterates over partitions (modules, services, batches, quarters),
  the coordination contract should improve with each wave, and the effort has no
  natural archive point. Triggers on "swarm", "evolving program", "repeating
  fan-out", "living program". Do NOT use for single-execution parallel work (use
  /program), single-file iterative passes (use /prompt-evolve), one-shot plans
  (use /spec), or intent capture (use /note).
---

# Swarm

A living coordination surface — one evolving master plus waves of parallel
stubs — for work that fans out, learns, and fans out again. The master never
archives. It accumulates lessons, patterns, and contract refinements across
every wave of execution.

## Why this exists

`/program` coordinates parallel workstreams but archives when done — it's a
one-shot coordination artifact. `/prompt-evolve` evolves across partitions but
is single-threaded — no fan-out. The gap: **multi-workstream work that repeats
over partitions, where the coordination contract itself should improve with
each wave.**

The swarm fills the fourth quadrant:

|                        | Single execution | Multi-pass (iterative) |
|------------------------|------------------|------------------------|
| **Single workstream**  | `/spec`          | `/prompt-evolve`       |
| **Multi-workstream**   | `/program`       | **`/swarm`**           |

## When to use

All three conditions hold:

1. Work **fans out** — multiple stubs execute in parallel per wave.
2. Work **repeats over partitions** — modules, services, batches, quarters,
   capability layers. Not a one-shot.
3. Each wave produces **lessons that should feed back** into the master for
   the next wave.

Examples:
- Migrating 50 microservices in batches of 5, each batch needing parallel
  workstreams (schema, API, tests, deploy).
- Refactoring a pattern across 20 modules, each needing parallel sub-work
  (interface, implementation, tests, docs).
- Quarterly security sweeps across N subsystems, each needing parallel
  review tracks.
- Platform buildout in capability layers, each layer needing parallel
  workstreams.

## When NOT to use

- **One-shot parallel work** → `/program`. If you'll archive when done, it's
  a program.
- **Single-file iterative passes** → `/prompt-evolve`. If there's no fan-out,
  it's a prompt.
- **Single-execution plan** → `/spec`.
- **Intent capture** → `/note`.
- **Pre-action alignment** → `/plan`.

## The master — 6 sections

Create at `docs/swarm/SWARM_<NAME>.md`.

```markdown
# SWARM: <NAME>

> **Type:** swarm (living coordination surface — never archives).
> Edit this master after every wave per the self-improvement loop.

Version: v1
Partition: <what waves iterate over — module, service, batch, quarter>

---

## 1. GOAL

<One paragraph. What this swarm does, across all partitions, indefinitely.
Imperative voice. Not "we should consider" — "migrate every service to the
v3 schema, 5 per wave, until the fleet is done.">

## 2. CONTRACT

<The rules every wave stub must follow. Types, invariants, naming conventions,
the things that break if a stub ignores them. Starts sparse at v1. Grows as
waves surface new invariants. Each rule is one bullet — imperative, testable.>

## 3. WAVE REGISTRY

| Wave | Partition    | Stubs | Status   | Lessons (1-line) |
|------|------------- |-------|----------|------------------|
| W1   | <partition>  | N     | DONE     | <1-line>         |
| W2   | <partition>  | N     | ACTIVE   | —                |
| W3   | <partition>  | N     | PLANNED  | —                |

## 4. PATTERNS (grows after every wave)

### What works
<empty at v1 — append after each wave>

### What breaks
<empty at v1 — anti-patterns, edge cases, tool failures>

### Fallback matrix
  {failure mode}  →  {workaround}
  (none yet — append as discovered)

## 5. CHANGELOG

- **v1 (initial):** Swarm seeded. No waves executed.

<!--
v2+ entry template (copy, fill, append above this comment):
- **v{N} (W{M} complete, YYYY-MM-DD):** {one-line headline}.
  {2-4 sentences of what was done, discovered, or corrected}.
  **counts**: +{Nf} files changed / +{Ns} stubs completed / +{Nc} contract rules / +{Np} patterns
  **contract delta**: {new rules added — or "(none)"}
  **expansion**: {waves planned — or "(none)"}
-->

## 6. EXPANSION PROTOCOL

> **This section is mandatory.** It tells the executor how to keep the
> swarm alive without waiting for human re-prompting.

When the executor completes a wave and runs the self-improvement step
(§5), it MUST check the WAVE REGISTRY for remaining PLANNED rows.
**If fewer than 3 PLANNED waves remain**, the executor generates the
next horizon of waves before proceeding:

1. **Audit the product.** Compare current state against the target
   (reference product, spec, or goal). Identify the largest gaps.
2. **Prioritize by dependency order.** Capabilities that unblock
   other capabilities come first.
3. **Write PLANNED rows.** Add 4–8 new rows to §3 WAVE REGISTRY
   with partition names, estimated stub counts, and PLANNED status.
4. **Generate stubs for the next ACTIVE wave only.** Write stub
   files following the naming convention. Each stub has three
   sections: Do this, Gate, Files.
5. **Update §1 GOAL** if the new waves expand scope beyond the
   current goal description.
6. **Append to §5 CHANGELOG** with a note like
   `Expansion: W<N>–W<M> planned (<summary>).`

### Feature horizon (optional, recommended)

A backlog of future capabilities ordered by priority. The executor
draws from this list when expanding. Features already covered by
DONE waves are skipped. The list itself grows as waves complete and
new gaps surface. Not exhaustive — it's a seed, not a ceiling.
```

That's the whole master. Six sections. Everything earns its place:

| Section | Why it exists |
|---------|---------------|
| GOAL | What we're doing. Stable across waves. |
| CONTRACT | What every stub must obey. Grows. |
| WAVE REGISTRY | Orchestration state. The status table. |
| PATTERNS | Accumulated intelligence. The evolving part. |
| CHANGELOG | Versioned institutional memory. |
| EXPANSION PROTOCOL | How the swarm self-perpetuates. The autonomy engine. |

## Wave stubs — the spec IS the code

For each workstream in a wave, write a stub at
`docs/swarm/SWARM_<NAME>_W<N>_<NN>_<TOPIC>.md`.

Stubs are **imperative execution instructions**, not descriptions. The
executor reads the stub and does what it says. Show exact code when the
change is code. Show exact commands when the task is operational.

```markdown
# SWARM_<NAME>_W<N>_<NN>_<TOPIC>

**Swarm:** [SWARM_<NAME>](SWARM_<NAME>.md) · **Wave:** W<N> · **Depends:** <deps or "none">

## Do this

<Imperative instructions. The spec IS the code. Numbered steps.
Each step targets one file or one action. Show current → replacement
when modifying code. No "update as needed.">

## Gate

<One sentence: how the executor knows this stub is done. A test passing,
a grep returning zero, a command succeeding.>

## Files

<Paths this stub touches.>
```

Three sections per stub. That's it.

## The loop

```
┌──────────────────────────────────────────┐
│  1. SEED or UPDATE the master            │
│  2. GENERATE wave stubs (parallel set)   │
│  3. FAN OUT — executors run in parallel  │
│  4. REVIEW — check results vs. gates     │
│  5. SELF-IMPROVE — edit the master:      │
│     • update §2 CONTRACT (new rules)     │
│     • update §3 WAVE REGISTRY (status)   │
│     • update §4 PATTERNS (lessons)       │
│     • append §5 CHANGELOG (version bump) │
│     • bump Version header                │
└────────────────┬─────────────────────────┘
                 │
                 └──→ back to step 2 for the next wave
```

### Step-by-step

**Step 1 — Seed.** `/swarm <NAME>` creates the master with v1 scaffold and
the first wave's stubs. Ask the user:

> *"What are we swarming over? Name the partition variable (module, service,
> batch, etc.) and the first partition to hit."*

**Step 2 — Generate stubs.** For the current wave's partition, identify the
parallel workstreams needed and write one stub per workstream. Each stub
cites the master's §2 CONTRACT. Fan-out count is typically 2–6 stubs per
wave — enough for parallelism, not so many that coordination breaks.

**Step 3 — Fan out.** Each stub is an independent executor target. Stubs in
the same wave can run in parallel (separate worktrees if touching the same
repo). Stubs across waves are sequential — W2 starts after W1's
self-improvement step completes.

**Step 4 — Review.** After all stubs in a wave complete, check each stub's
gate. Mark the wave DONE or flag incomplete stubs for a follow-up.

**Step 5 — Self-improve.** This is mandatory. Edit the master in place:

- §2: Add any new contract rules discovered during the wave.
- §3: Mark the wave DONE with a 1-line lesson. Add the next wave row.
- §4: Append patterns — what worked, what broke, any new fallback entries.
- §5: Append a CHANGELOG entry using the template comment. Include the
  structured **counts** line — every entry gets one. Bump version.
- §6: **Check the expansion trigger.** If fewer than 3 PLANNED waves remain
  in §3, run the expansion protocol — audit, prioritize, write PLANNED
  rows, generate stubs for the next ACTIVE wave, update §1 when scope changes.
- Version header: bump.

The evolved master is what Step 2 reads for the next wave. The expansion
protocol ensures the swarm never stalls waiting for a human to re-prompt.
This is the feedback loop that makes each wave cheaper than the last AND
keeps the swarm alive indefinitely.

## Parallel execution

- **One worktree per stub** when stubs touch the same repo. Parallel agents
  editing a shared worktree corrupt the index.
- **Stubs within a wave** are parallel-safe unless they declare dependencies
  on each other via the `Depends` field.
- **Waves are sequential.** W2 stubs are generated from the W1-evolved
  master. This is the learning channel.
- **Integration is serialized.** Worktrees merge one at a time after the
  wave is reviewed.

## Lifecycle — never done

A swarm master has no archive signal. It stays at `docs/swarm/SWARM_<NAME>.md`
for the life of the project (or until the user explicitly retires it).

Completed wave stubs CAN be cleaned up — move to
`docs/swarm/archive/SWARM_<NAME>_W<N>_*` if the directory gets noisy. The
master's §3 WAVE REGISTRY preserves the record.

## Invocation

- `/swarm <NAME> [description]` — cold-start. Create the master + first
  wave stubs.
- `/swarm` (no args) — resume. Read the active swarm master(s) in
  `docs/swarm/`, identify the current wave, generate next stubs or
  self-improve from completed stubs.
- `/swarm --status` — report. Show the wave registry and current state
  across all active swarms.

## Output — structured report with change metrics

Every wave completion produces a structured report. Under ~200 words,
with mandatory metrics:

```
## W{N} Complete — {partition name}

**Master:** docs/swarm/SWARM_<NAME>.md (v{X} → v{Y})
**Stubs:** {count} completed — {stub filenames}

### Counts
+{Nf} files changed / +{Ns} stubs completed / +{Nc} contract rules / +{Np} patterns

### Contract delta
{new rules added to §2, or "(none)"}

### Patterns learned
- works: {1-line}
- breaks: {1-line}

### Expansion
{waves planned via §6, or "(none)"}

### Wave registry
| Status   | Count |
|----------|-------|
| DONE     | {n}   |
| ACTIVE   | {n}   |
| PLANNED  | {n}   |

### Next action
Execute W{N+1} stubs in parallel. When all gates pass, self-improve
and generate W{N+2}.
```

The counts line echoes the CHANGELOG entry — same format, same numbers.
This makes every wave's impact scannable without reading prose.

## Companion skills

- **`/spec`** — for one-shot plans within a stub when the work is complex
  enough to warrant phases/checkpoints inside a single workstream.
- **`/prompt-evolve`** — for single-file iterative passes. A swarm stub
  could invoke a prompt-evolve artifact if one workstream is itself
  partition-iterative.
- **`/program`** — for one-shot parallel coordination. If the work will
  archive when done, use program, not swarm.
- **`/round-review`** — can review a wave's output against the master's
  contract, similar to reviewing a program round.
- **`/peer-review`** — for fresh-eyes review of a wave's change set before
  merge.
- **`/note`** — for incidental learnings during wave execution that don't
  belong in the master's patterns section.
- **`/reflect`** — at natural checkpoints (after a wave, after N waves) to
  take stock of the swarm's trajectory.
