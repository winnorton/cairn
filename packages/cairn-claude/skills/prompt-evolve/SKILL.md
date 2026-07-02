---
name: prompt-evolve
description: Author a self-improving, version-controlled prompt for tough tasks done in many iterative passes over partitions. Use when work doesn't fit one execution, partitions are obvious (year, batch, module), each pass produces work AND insight, and insight would otherwise be lost. Triggers on "evolving prompt", "mining prompt", "self-improving prompt", "process in batches and learn as we go". Primary mode `--from <SPEC>` promotes an evolving-prompt deliverable from `/spec` into a standalone artifact at `<project>/.cairn/prompt-evolve/<NAME>_PROMPT.md`. Enforces a 7-phase scaffold (Pre-flight → Inventory → Extract → Write → Verify → Report → Self-Improvement) with Phase 6 self-edit mandate, CHANGELOG, idempotence, and absolute-path-inline rules. Do NOT use for single-execution work (`/spec`), single-paragraph capture (`/note`), parallel-workstream decomposition (`/program`), round verification (`/round-review`), or subject research over passes (`/lra`).
---

# Prompt-Evolve

Author a self-improving prompt for tough tasks done in many iterative passes. The
artifact this produces is unlike `/spec` (author-once, execute-once, archive),
`/program` (master + parallel children), or `/note` (single paragraph). It's a
**single durable file that the executor reads AND edits** at the end of every
pass — accumulating lessons, canonical IDs, narrative anchors, and bug
workarounds so the next pass is cheaper than the previous one.

## Why this skill exists

Two real instances surfaced the pattern:

1. **fishing-agent's `data-pop-prompt`** (2026 — Gmail → SQLite, partitioned by
   year). 7 CHANGELOG versions (v1 → v3.6), each authored after processing one
   year of mail. Each version captured new canonical contact IDs, year-by-year
   narrative anchors, and tool-failure workarounds (FTS5 path-split, PB
   collision rule). The prompt's CHANGELOG section IS the project's
   institutional memory.

2. **purduebb's `MINING_PROMPT.md`** (2026 — web → JSON, partitioned by season
   or topic). Same 7-phase shape, same Phase 6 self-edit mandate, two-axis
   partition (season XOR topic), schema-relaxed for sparse historical data.

Both projects independently converged on:
- A 7-phase scaffold (Pre-flight → Inventory → Extract → Write → Verify →
  Report → **Self-Improvement**)
- A partition variable (`{{YEAR}}` / `{{SEASON}}` / `{{TOPIC}}`) so one pass =
  one partition
- Accumulating-state sections that grow over time (canonical IDs, narrative
  anchors, fallback matrix)
- Idempotent re-runs (Phase 1 inventory + Phase 5 dedup catch already-written
  data)
- A self-edit Phase 6 with the file's own path inline as the explicit edit
  target

The pattern generalizes far beyond corpus mining. See **When to use** below.

## When to use

This skill is the recognition cue for a class of "tough tasks" — work where ALL
four conditions hold:

1. The work **doesn't fit in one execution.** Days, weeks, or months of
   accumulated state.
2. **Partitions are obvious.** Year, season, module, subsystem, batch of N
   items, sprint, region, customer cohort, etc.
3. Each pass produces **both output AND insight.** Not just rows written but
   also lessons about how to write them better next time.
4. Without a place to put the insight, **it gets lost** between passes —
   forcing every subsequent pass to re-discover.

When all four hold, the answer is a prompt-evolve artifact. The eight task
classes below all qualify; this list is illustrative, not exhaustive:

| Task class | Partition variable | Source | Target | What evolves |
|---|---|---|---|---|
| **Corpus mining** | year / season / topic | Gmail, web, files, archive | structured DB or JSON | canonical IDs, narrative anchors, source quirks |
| **Codebase refactor sweep** | module / file group | the codebase | the codebase (in-place) | edge-case catalog, anti-pattern list, exception rules |
| **Bug triage backlog** | batch of N bugs by date | issue tracker | labels + assignments | recurring root-cause taxonomy, severity heuristics |
| **Doc generation backfill** | module / package | the codebase | docs/ tree | project voice, convention map, do-not-document list |
| **Test suite hardening** | module / test group | the codebase | the test suite | untested-pattern catalog, project-specific fixtures |
| **Security audit sweep** | subsystem | code + logs | findings ledger | threat patterns, false-positive sources |
| **Research synthesis** | month of papers / batch | arXiv / library / Slack threads | claims-and-methods graph | sub-field map, canonical authors, definition glossary |
| **API/integration backfill** | time window / shard | external API | local store | rate-limit patterns, schema drift, retry recipes |

User-invoked phrases that trigger this skill:
- *"Build me an evolving prompt for X."*
- *"This is a multi-pass thing — set up a mining prompt."*
- *"We'll back-fill this corpus over time; need a self-improving template."*
- *"Promote the evolving-prompt section of `<SPEC>` into a standalone file."*

Agent-proactive trigger (propose, don't auto-fire): when you read a `/spec`
that includes phrases like "evolving prompt", "self-improving prompt",
"mining prompt", or "Phase 6 self-improvement", offer:

> *"This spec ships an evolving prompt as a deliverable. Want me to extract it
> via `/prompt-evolve --from <this-spec>` so it lives at the canonical path
> with the enforcement items baked in?"*

## When NOT to use

- **Single-execution work.** Use `/spec` — its lifecycle is author → execute →
  `git mv` to archive. Prompt-evolve artifacts never naturally archive; they
  keep evolving.
- **Single-paragraph intent capture.** Use `/note` — too small for this
  pattern.
- **Parallel-workstream decomposition.** Use `/program` — that's
  master + N stubs running in parallel. Prompt-evolve is sequential passes
  over partitions, one at a time.
- **Verifying an executor round against a master DoD.** Use `/round-review` —
  that's the trust-but-verify pass after a `/program` round, drafting R+1
  stubs. Prompt-evolve evolves the same file; round-review spawns new files.
- **Single tough decision.** Use `/plan` — pre-action alignment for a
  hard-to-reverse step.

## Distinction from `/spec`, `/program`, `/round-review`

| | `/spec` | `/program` | `/round-review` | **`/prompt-evolve`** |
|---|---|---|---|---|
| Output | One spec file | Master + N stub files | R+1 round master + stubs | **One evolving prompt file** |
| Execution count | Once | Once per workstream | Once per round | **Many, over partitions** |
| Artifact lifecycle | active → archive | active → ship → archive | active → next round | **active → keeps evolving** |
| Who edits after author | The executor follows | Per-workstream executors | The reviewer drafts R+1 | **Every executor pass edits the file** |
| The artifact IS the | Executor handoff | Coordination contract | Round dispatch target | **The institutional memory** |

`/prompt-evolve` is the only skill whose output artifact is meant to be edited
by every executor that runs it.

## Invocation modes

- **`/prompt-evolve --from <SPEC_FILE>`** — primary mode. Promote an
  evolving-prompt deliverable embedded in a spec into a standalone artifact at
  the canonical path with the enforcement items baked in. The spec **stays in
  place** (unlike `/spec --from <note>` and `/program --from <spec>`, which
  move their source — see "Promotion semantics" below).
- **`/prompt-evolve`** (no args) — cold-start mode, deferred to v1.x. From-scratch
  authoring requires too many project-specific decisions (partition variable,
  data model, tool roster, etc.) that a `/spec` is better positioned to make.
  When this mode is added, it will gate on a user-side intake that names the
  partition variable, the source, and the target up front.

## Promotion semantics — `/prompt-evolve` does NOT move the spec

This is a deliberate departure from cairn's other `--from` skills:

| Skill | Moves source? | Why or why not |
|---|---|---|
| `/spec --from <note>` | Yes — to `notes/_promoted/` | The spec REPLACES the note's intent capture |
| `/program --from <spec>` | Yes — to `specs/_promoted/` | The program REPLACES the single-spec scope |
| **`/prompt-evolve --from <spec>`** | **No** | The spec covers MORE than the prompt (schema, validator, API, surface, etc.). The evolving prompt is ONE deliverable of the spec — the spec keeps its own lifecycle |

What `/prompt-evolve --from` DOES do to the spec:
- Appends a single-line breadcrumb (idempotent — adds only if absent):

  > *"Evolving prompt extracted to `<docs|.cairn>/prompt-evolve/<NAME>_PROMPT.md` on `<date>`. See that file for the v1 template and self-improving CHANGELOG."*

The spec keeps its normal `git mv → archive/` ship signal when its other
deliverables (schema, API, etc.) land. The prompt-evolve artifact has its
own evolving lifecycle starting from v1.

## Steps

### 1. Read the source spec

Read the full spec at `<SPEC_FILE>`. Look specifically for:

- A section explicitly named "evolving prompt", "mining prompt", "MINING_PROMPT",
  "the prompt", or a fenced code block of substantial length (≥30 lines)
  containing the words "Phase 6", "self-improvement", "CHANGELOG", or the
  6-phase scaffold structure.
- The spec's data model (what's being populated)
- The spec's tool roster (what the executor will have)
- The spec's partition variable (year, season, topic, module, batch, etc.)
- Any "Pre-flight" or "Phase 0" instructions

### 2. Detect or derive

**If the spec contains an inline draft prompt:** extract it verbatim and
prepare to apply canonical fixes (see step 3 below). Default behavior is
**preserve-and-canonicalize** — don't rewrite the author's intent; only ensure
the scaffold is canonical.

**If the spec references an evolving prompt as a deliverable but doesn't
include a draft:** derive a scaffold from spec context. Use the spec's data
model + tool roster + partition variable to populate the scaffold's
domain-specific sections (`DATA MODEL`, `SCHEMA/RULES`, `THE RUN` phases,
`CANONICAL IDs` table headers, etc.).

**If the spec neither contains nor references an evolving prompt:** refuse.
Tell the user:

> *"This spec doesn't appear to ship an evolving prompt. `/prompt-evolve` is
> for tough tasks done in iterative passes — if your spec is single-execution,
> stay with `/spec`. To use the evolving-prompt pattern, update the spec
> to name it as a deliverable, then re-invoke `/prompt-evolve --from <spec>`."*

### 3. Apply the canonical 7-phase scaffold + 5 enforcement items

Whether extracted-and-canonicalized or freshly-derived, every prompt this
skill produces MUST include all of these. They're non-negotiable.

#### The canonical 7-phase scaffold

```
PHASE 0 — PRE-FLIGHT (mandatory)
  Verify tool roster works. Emit a one-paragraph "tool readiness" report
  as the first paragraph of the final report.

PHASE 1 — INVENTORY EXISTING (mandatory, idempotence enabler)
  Read everything in the target store first. Build name→id maps. Cross-
  reference against the prompt's CANONICAL IDs section. NEVER recreate what
  already exists.

PHASE 2 — SEARCH / EXTRACT
  Source-side queries scoped to the partition variable. Accumulate good
  search hints per partition in this section over time.

PHASE 3 — CLASSIFY + PARSE
  Per-item parse + classification into the write typology.

PHASE 4 — WRITE PASS (dependency-ordered)
  Foreign-key dependencies determine write order. Document the order
  explicitly so the executor doesn't have to derive it.

PHASE 5 — VERIFY + DEDUP
  Run the target store's validator. Spot-check N random writes against
  source. Dedup against existing rows.

PHASE 6 — SELF-IMPROVEMENT (MANDATORY — this is what makes the prompt evolve)
  Edit THIS file at the absolute path below. Append CHANGELOG entry, update
  canonical IDs, update partition anchor, add any new fallback-matrix
  entries, file gaps for future work.

  Edit target (absolute path inline — REQUIRED):
    {{absolute_path_to_this_prompt_file}}

PHASE 7 — FINAL REPORT
  Single structured message. Counts, additions, updates, "Pending Re-run"
  staging area, and a list of CHANGELOG edits made in Phase 6.
```

#### The 5 enforcement items (each one a separate non-negotiable check)

1. **Phase 6 absolute path inline.** The skill MUST resolve `cwd + target
   location + filename` at write time and embed that absolute path literally
   in Phase 6's body. Heuristic check: if the prompt text mentions "edit THIS
   file" without an adjacent absolute path, the enforcement check fails.
2. **CHANGELOG entry format template literal.** The CHANGELOG section MUST
   include both a `v1 (initial)` entry AND a literal template for v2+:

   ```
   ## CHANGELOG
   - **v1 (initial):** {scaffold seeded; no partitions processed yet}.
   - **v{N} ({{PARTITION}} pass, YYYY-MM-DD):** {one-line headline}.
     {2-4 sentences of what was done, discovered, or corrected}.
     **LESSONS**: (1) ... (2) ...
   ```

3. **Empty `## TOOL-FAILURE FALLBACK MATRIX` section** ready to grow:

   ```
   ## TOOL-FAILURE FALLBACK MATRIX (grows as discovered)

     {failure mode}  → {workaround}
     (none yet — append in Phase 6 as you hit them)
   ```

4. **Pending Re-run section in the FINAL REPORT template.** Staging area for
   writes that couldn't land due to current bugs / rate limits / budget
   exhaustion. The structure:

   ```
   **Pending Re-run** (full data captured for future agent to apply):
   - {entity type}: {full row data per blocked write}
   - {entity type}: {full row data}
   ```

5. **Idempotence statement.** Near the bottom of the prompt, before the
   CHANGELOG:

   ```
   ## IDEMPOTENCE

   Re-running this prompt for the same `{{PARTITION}}` should produce
   ~zero new rows — PHASE 1 inventory + PHASE 5 dedup catch existing
   data. If a re-run generates many writes, that's a SIGNAL: either the
   prior run was incomplete (check its CHANGELOG entry), or the source
   data has changed. Investigate before committing the writes.
   ```

#### Additional scaffold sections (populate from spec context)

- **DATA MODEL** — what target paths/tables this prompt writes to
- **SCHEMA / RULES YOU MUST KNOW** — invariants that prevent destructive writes
- **STOP CONDITION** — pick a variant from the Execution strategies catalog
  (budget-gated, run-until-dry, or a new one the project surfaces). One paragraph
  naming the variant + what Phase 0 probes for it. NOT cost-discipline-by-default
  — that's only one variant.
- **COVERAGE STRATEGY** (optional, recommended when partition space > ~10) —
  pick a variant from the Execution strategies catalog (naive sequential,
  bootstrap-then-fill, or new). Drives Phase 1's target-selection logic.
- **CANONICAL IDs / DEDUP MEMORY** — empty template with one example row
- **PARTITION ANCHORS** — empty template with one example row
- **DO-NOT-CONFUSE** — empty template (different entities with similar names)
- **NAMING & CONSISTENCY** — canonical taxonomies (location IDs, species names,
  module conventions, voice rules)
- **EXECUTION STRATEGIES** (optional) — explicitly enumerate which strategy
  variants this prompt picked, and any new project-local strategies that don't
  yet exist in the cairn catalog. Future agents reading the prompt know what
  the design choices were.

### 4. Diff preview (when extracting from inline draft)

If the spec contained an inline draft prompt, show the user a compact diff:

```
Canonical fixes that will be applied to the extracted draft:

  + Phase 6 absolute path inline (the draft says "THIS file" without path)
  + CHANGELOG v2+ entry format template (was missing — only v1 present)
  + Empty TOOL-FAILURE FALLBACK MATRIX section (was missing)
  + Pending Re-run section in FINAL REPORT (was missing)
  + IDEMPOTENCE statement (was missing)

  No other changes to the draft's content.

Proceed? (y/n/individually)
```

Let the user accept all, reject all, or apply per-item. Default to all
accepted — these are the load-bearing fixes the skill exists to enforce.

### 5. Choose the location

Default conventions:

- **Pre-v0.14:** `docs/prompt-evolve/<NAME>_PROMPT.md`
- **v0.14+:** `<project>/.cairn/prompt-evolve/<NAME>_PROMPT.md`

Detect the cairn version (the existence of a `<project>/.cairn/` directory
signals v0.14+). Confirm path with user before writing.

`<NAME>` is derived from the spec's name or the user's intent (e.g.
`PURDUE_BASKETBALL_HISTORY_PROMPT.md`, `INVENTORY_BACKFILL_PROMPT.md`,
`LEGACY_REFACTOR_PROMPT.md`).

### 6. Write the file

Compose with this skeleton (substitute `<...>` for derived/spec-specific
content):

```markdown
# <Project> — <Task> Evolving Prompt

> **Type:** evolving prompt (managed by cairn's `/prompt-evolve` skill).
> Edit this file at the end of every pass per **Phase 6 — Self-Improvement**.

Version: v1

<one-paragraph purpose statement explaining what the prompt populates,
what the partition variable is, and what tools the executor needs>

---

## DATA MODEL (what you populate)
<from spec>

## SCHEMA / RULES YOU MUST KNOW
<from spec>

## STOP CONDITION
<from spec — pick a variant: budget-gated, run-until-dry, or other; name what
Phase 0 probes>

## COVERAGE STRATEGY (optional)
<from spec — pick a variant: naive sequential, bootstrap-then-fill, or other;
applies when partition space is large>

## EXECUTION STRATEGIES (record which variants were picked)
<single paragraph naming which catalog variants this prompt uses, plus any
project-local strategies that aren't yet in the cairn catalog>

## CANONICAL IDs / DEDUP MEMORY (fill after first passes)
```
# - <example>
```

## PARTITION ANCHORS (fill as you process partitions)
```
# - <example>
```

## DO-NOT-CONFUSE (different entities with similar names)
```
# - <example>
```

---

## THE RUN

### PHASE 0 — PRE-FLIGHT
<derived from spec's pre-flight section if present>

### PHASE 1 — INVENTORY EXISTING (mandatory, avoid duplicates)
<derived>

### PHASE 2 — SEARCH / EXTRACT
<derived; partition-scoped queries>

### PHASE 3 — CLASSIFY + PARSE
<derived>

### PHASE 4 — WRITE PASS (dependency order)
<derived; spec out the order>

### PHASE 5 — VERIFY + DEDUP
<derived>

### PHASE 6 — SELF-IMPROVEMENT (mandatory)

Before closing, edit THIS file at the absolute path:

    <ABSOLUTE_PATH_RESOLVED_AT_SKILL_WRITE_TIME>

(or your absolute equivalent — use `pwd` first if uncertain.) Append a
CHANGELOG entry (bump Version), update CANONICAL IDs / PARTITION ANCHORS /
DO-NOT-CONFUSE with what you confirmed, add any new TOOL-FAILURE FALLBACK
MATRIX entries, and file any gaps as future work.

This phase is what makes the prompt self-improving. Skipping it means the
next pass's agent has to rediscover what you found. Don't skip it.

### PHASE 7 — FINAL REPORT
<derived; counts table + additions + Pending Re-run staging>

---

## NAMING & CONSISTENCY
<derived: canonical taxonomies>

## TOOL-FAILURE FALLBACK MATRIX (grows as discovered)

  {failure mode}  → {workaround}
  (none yet — append in Phase 6 as you hit them)

## IDEMPOTENCE

Re-running this prompt for the same `{{PARTITION}}` should produce ~zero
new rows — PHASE 1 inventory + PHASE 5 dedup catch existing data. If a
re-run generates many writes, that's a SIGNAL: either the prior run was
incomplete (check its CHANGELOG entry), or the source data has changed.
Investigate before committing the writes.

## CHANGELOG

- **v1 (initial):** Scaffold seeded from <SPEC_FILE> via `/prompt-evolve`.
  No partitions processed yet.
- **v{N} ({{PARTITION}} pass, YYYY-MM-DD):** {one-line headline}.
  {2-4 sentences of what was done, discovered, or corrected}.
  **LESSONS**: (1) ... (2) ...
```

### 7. Append breadcrumb to the spec

Idempotently append to the spec (do not add if already present):

```markdown
> **Evolving prompt extracted:** `<docs|.cairn>/prompt-evolve/<NAME>_PROMPT.md`
> (extracted on <date> via `/prompt-evolve --from <SPEC_FILE>`). The prompt
> has its own evolving lifecycle — Phase 6 self-edits accumulate lessons per
> pass. This spec keeps its normal `git mv → archive/` ship signal.
```

Insert at the end of the spec's frontmatter / before the first `##` section.

### 8. Report and exit

Tell the user, under ~250 words:

- File written: `<absolute_path>`
- v1 scaffold seeded from `<SPEC_FILE>`
- Canonical fixes applied: list the 5 enforcement items
- Breadcrumb appended to spec at line X
- Next action: *"Run the prompt for the first partition (e.g. `{{YEAR}}=2019`,
  `{{MODULE}}=src/legacy/utils`). The executor will read the prompt, do the
  pass, and edit Phase 6 to bump version → v2 with lessons. Re-running for
  the same partition should be near-no-op."*

## Reference shape — worked examples

Three real instances exist. All follow the canonical scaffold above; all have
running CHANGELOGs proving the self-improvement loop executes; all have surfaced
execution strategies (see next section) the scaffold itself doesn't mandate.
(The first two live in private repos; the descriptions below carry what an
authoring agent needs — their file paths resolve only on the maintainer's
machine and are omitted here.)

**Fishing agent (corpus mining: Gmail → SQLite, partition: year):** a
~1058-line live-evolved prompt at CHANGELOG v3.6. What maturity looks like at
many partitions: a CANONICAL IDs section grown to 50+ entries across merges,
per-partition narrative anchors (one per year, 2005–2025), and a rich
TOOL-FAILURE FALLBACK MATRIX (search-index path-splits, collision rules, API
token caps) accumulated from real failures.

**Purdue basketball (web → JSON, partition: season XOR topic):** a ~150-line
prompt at CHANGELOG v1 → v2, where the v2 entry was written by the *executor*
that ran the first demo pass — proof the Phase 6 self-edit loop fires under
real execution. All 5 enforcement items present from authoring.

**lra (subject research, partition: pass):** the researcher/librarian prompt
pair shipped with the `/lra` skill (masters installed at
`.cairn/context/lra/`) — the one instance whose files ARE resolvable in an
adopter project.

When in doubt about scaffold shape at multi-partition maturity, model on the
fishing description above. When in doubt about Phase 6 self-edit discipline at
the v1 → v2 transition, model on the purduebb description. For a readable
concrete instance, open the installed lra masters.

## Execution strategies (accumulating catalog)

The 7-phase scaffold + 5 enforcement items above are **invariant** — they fire on
every prompt this skill produces, regardless of project. But every prompt also
makes project-specific choices about *how* to execute the scaffold. Those choices
are **execution strategies**: variant, optional, named patterns that accumulate
in this catalog as new projects surface them.

The distinction matters: conflating them ossifies the skill. The scaffold
is small and stable; the strategy catalog is open-ended and grows.

Two strategies named so far. Each new project running `/prompt-evolve` may
surface more.

### Strategy: Stop condition

How does the prompt decide when to stop iterating on a partition?

| Variant | When to use | Surfaced by |
|---|---|---|
| **Budget-gated** | External-API cost is metered; hosted LLM inference has token budget; rate-limits matter. Phase 0 probes a budget; the run stops on exhaustion; pending writes go to "Pending Re-run." | fishing-agent |
| **Run-until-dry** | Compute is free (self-hosted inference, internal-only systems); completeness matters more than throughput. Re-run the same partition until a full pass surfaces no new data; only then mark complete. Naturally pairs with `coverage:"complete"` being earned, not assumed. | purduebb |

The generated prompt's scaffold has a `## STOP CONDITION` section near the top.
The project picks which variant applies and writes one paragraph naming it. Phase
0 then probes whatever signal that variant needs (budget remaining, server
health, etc.).

### Strategy: Partition walking

How does the prompt walk a partition space larger than ~10 partitions?

| Variant | When to use | Surfaced by |
|---|---|---|
| **Naive sequential** | Partitions are few (≤10) OR the prompt is already mature (canonical IDs / narrative anchors / fallback matrix are well-populated from a prior corpus). Simplest walk: oldest → newest, one per run. | fishing-agent (after a few years) |
| **Bootstrap-then-fill** | Partition space is large (decades, hundreds of modules, etc.) AND the prompt is starting from v1. Stage A: sparse strides (5-year, 20-year, every-10th-module) across the full range to mature the prompt's accumulating state before going deep. Stage B: sequential fill once strides are populated. Later partitions cost less — the prompt is already smart. | purduebb |

The generated prompt's scaffold has an optional `## COVERAGE STRATEGY` section.
When present, it picks the walking variant; Phase 1's target-selection logic
follows.

### Adding new strategies

When a new project running `/prompt-evolve` surfaces an execution strategy that
doesn't fit the named variants above:

1. Document the strategy in the generated prompt's `## EXECUTION STRATEGIES`
   section as `<NAME> strategy: <one-paragraph description>` so the project's
   future agents understand what was chosen.
2. If the strategy recurs in a second project, propose adding it to this catalog
   via `/feedback` or a PR to cairn. Cairn's 3-instance observation gate applies:
   name it here when it's surfaced in 3 projects.

The catalog grows; the scaffold doesn't. Strategies that don't recur stay
project-local.

## Standing instructions (defaults baked in — do not re-prompt)

- **The artifact name and folder convention are non-negotiable.** Every file
  this skill produces is `<NAME>_PROMPT.md` inside `<docs|.cairn>/prompt-evolve/`.
  The convention IS the pattern flag — `grep "_PROMPT.md"` across cairn-adopting
  projects finds them.
- **The `> **Type:** evolving prompt` header marker** goes at the top of every
  generated file. An agent that doesn't read the body should still know the
  type at a glance.
- **The 5 enforcement items fire on every write,** whether the input was an
  extracted inline draft or a derived-from-context scaffold. They prevent the
  drift the purduebb spec exhibited (missing Phase 6 absolute path; missing
  CHANGELOG v2+ template; missing fallback matrix).
- **Spec stays in place.** Promotion semantics differ from `/spec --from <note>`
  and `/program --from <spec>` — see "Promotion semantics" above.
- **Cold-start mode is deferred.** v1 only supports `--from <SPEC>`. If a user
  wants cold-start authoring, route them to write a `/spec` first that names
  the evolving prompt as a deliverable.

## Output

Under ~250 words:

- File written: `<absolute_path>`
- Canonical fixes applied (5-item list)
- Spec breadcrumb confirmation
- Next action: run the first partition

## Companion skills

- **`/spec`** — the upstream artifact. `/prompt-evolve --from <spec>` reads it,
  but doesn't replace it. Specs ship their non-prompt deliverables
  (schema, API, surface, validator) on their own lifecycle.
- **`/program`** — orthogonal. Programs decompose into parallel workstreams;
  prompt-evolve decomposes into sequential partitions. Both can exist in the
  same project for different work.
- **`/round-review`** — feedback-loop cousin. Round-review verifies executor
  rounds against a `/program` master and drafts R+1 stubs. Prompt-evolve's
  Phase 6 also feeds executor learnings forward, but into the same file
  rather than new stubs.
- **`/note`** — for incidental learnings during prompt-evolve execution that
  don't belong in the prompt's CHANGELOG (e.g. an idea for a future related
  prompt-evolve artifact).
- **`/reflect`** — at session-end, after running a partition; reflect on the
  meta-process (was the partition the right size? Was Phase 6 informative?)
  vs. the prompt's own Phase 6 which captures domain-specific learnings.
