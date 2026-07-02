# {{SUBJECT_NAME}} — Researcher Evolving Prompt

> Evolving prompt — edit this file at the end of every pass (Phase 6).
> **Operating rules** — boundaries, source integrity, merge contract, fan-out — live in `AGENTS.md` (read every pass). THIS file is the TASK.

**Version:** v1

**Your job is discovery: find new things, prioritizing the things no one has found yet.** You are **never "done"**; every pass should surface something new (an entity, a type, a connection, a fact). Success = what you DISCOVER, not coverage of a grid.

---

## SUBJECT

**{{SUBJECT_NAME}}** (id: `{{SUBJECT_ID}}`) — Seed: {{SUBJECT_SEED}}

---

## DATA MODEL (what you populate)

You write `research/`:
- `findings.jsonl` — atomic facts/events, one per line (`FindingSchema`): `{id, claim, evidence, source_ids:[...], retrieved_at, tags:[], event_at?, kind:"fact"|"event"}`. Append-only.
- `sources.jsonl` — every source cited (`SourceSchema`): `{id, url, title?, accessed_at, etag?, content_hash?}`. Append-only.
- `topology.json` — one object `{entities:[], relationships:[], gaps:[]}`. Read-modify-write; dedup by id / `from|kind|to` / description.
- `reports/<pass-id>.md` — OPTIONAL narrative.

## DATA RULES (research-specific — boundaries, source integrity, and ids are in AGENTS.md)

- Every `Finding` cites ≥1 `source_id` in `sources.jsonl`.
- **Events:** set `kind:"event"` + `event_at` for time-bound things (past or upcoming); else `kind:"fact"`.
- Reuse CANONICAL IDs below; mint a new kebab-case id only for a genuinely new entity.

## AUDIT-DERIVED RULES (fill-rate feedback — the audit→prompt loop)

> When an attribute is mostly EMPTY across the entities that should carry it, add a rule here naming it + mandating its extraction next pass (use a fallback source if the primary omits it). Seeded empty.

- (none yet)

## STOP CONDITION

Run-until-dry is **per-bounded-thread, never per-subject, never the live front.** A dry thread means caught up *now*, never that the subject is exhausted.
- **Live front:** never dries — sweep since `last_swept` and re-arm; closing it is a coverage hole, not completion.
- **Bounded thread:** re-run until a pass adds ~zero, then move to a kind you've surfaced none of — ties break to the newest-unswept slice — not "done." One that never dries is mis-scoped — split it.
- If everything you add fits the structure you hold, discovery has stopped → **find what doesn't fit** (often the live front).

## COVERAGE STRATEGY

- **Acquire first; let the partition emerge.** An organizing axis (or a few) *emerges* from the topology — a **lens for organizing, not the boundary** of what's worth collecting. Keep acquiring entities/facets/edges that don't fit it.
- **Coverage self-check (Phase 6):** every type/dimension surfaced needs representative (not token) instances. Zero/token coverage, or a `none` cell, = your next focus.
- **Converse check:** (a) the live front — what's been published / announced / scheduled / changed about the subject lately that your map omits (every subject has one)? (b) a type/dimension you never opened. Anything real = a researcher-shaped gap; mint a cell and pursue it.

## EXECUTION STRATEGIES

- Add subject-specific search hints — good sites/feeds (incl. where recent developments are published), query patterns, sources to avoid — as you find them.

## CANONICAL IDs / DEDUP MEMORY (fill after first passes)

```
# <id> = <label> (<type>)  — reuse on every write; update in Phase 6.
```

## COVERAGE LADDER (your forward inventory of pending targets — the partition)

Forms as the graph grows; don't build it out the gate. When an organizing dimension emerges, spine the ladder to it (re-spine as it changes); several axes can coexist. An axis instance is an `entity`; membership is an edge (`member-of` or the apt kind) — ordinary facts the downstream sets derive from.
**Per-cell kind (neither is the default):** `live` — the recent-developments front (news, releases, schedule/status changes, fresh coverage): a standing axis EVERY subject has; open it and sweep it recent-first. `bounded` — a finite set, enumerated until dry.
**Status:** `live (last_swept: <iso>)` (a live cell's standing state) · `none` · `partial` · `stub` · `complete` (bounded: dry + RUBRIC).
```
# <cell-id> (<kind>) = <status> — <one-line>
# e.g.  <set> (bounded) = complete — a finite enumerated set   |   activity (live) = live (last_swept: ...) — current-activity front
# (empty — fills in as the axis emerges; don't force a partition before the data shows one)
```

## COMPLETION RUBRIC (when is a cell `complete`?)

A **coverage** judgment for bounded cells only — live cells never complete; no open live cell is itself an incomplete-coverage state. `complete` needs BOTH: (1) **ran dry** — a full pass added ~nothing (across passes; one pass ≠ dry); (2) **exhausted at the sources' grain** — if sources keep a record per a *finer* unit than your cell, those finer units are unbuilt cells: split and continue. A grouping that *summarizes* what the sources *enumerate* is `partial`/`stub`, never `complete`.

## PARTITION ANCHORS / COMPLETED-FOCUS LOG (fill as you process cells)

```
# <cell-id> = <one-line confirmed when it reached complete/stub>
```

## DO-NOT-CONFUSE (different entities with similar names)

```
# <id-a> ≠ <id-b> — <distinguisher>  (append when you hit ambiguity)
```

## NAMING & CONSISTENCY

- Entity `id`s are kebab-case slugs; keep a stable convention per type. Refine in Phase 6.

---

## THE RUN

### PHASE 0 — PRE-FLIGHT

Confirm tools: web search, web fetch, file read/write. Optional (absence is not a stop): `browser` MCP (headless Chrome for JS/403 — see FALLBACK MATRIX); `get_capabilities` MCP (live engine surface). If a tool fails, stop + report. Open Phase 7 with a readiness note.

### PHASE 1 — INVENTORY EXISTING (mandatory, idempotence enabler)

Read this file's sections (LADDER, CANONICAL IDs, ANCHORS, DO-NOT-CONFUSE, FALLBACK, CHANGELOG) and `audit.md` (if present, merge targets into ladder). Inventory using `get_coverage_stats` + `list_entities`; don't read full `topology.json` or `findings.jsonl`. No MCP → read the raw files. If ladder is empty, start Phase 2. Deduplicate: reuse IDs and append `source_id` to existing records; never recreate.

### PHASE 2 — SEARCH / EXTRACT — go WIDE and DEEP; write a lot

Gather across as much of the subject as you can reach **and** fully fill every entity you touch (Phase 3) — end each pass with **many entities, each fully populated**.
- `--focus "..."` (if passed) is your lens — still grab everything adjacent.
- The ladder is a *map of what's open*, not a per-pass quota: work as many threads as you can, leaning to thin/unopened. Claiming a *single* cell matters only when you fan out sub-agents (`AGENTS.md §E`); solo, never self-limit to one cell.

Note the finest unit your sources keep *one record per* (often where the richest detail is); carry into Phase 6.

### PHASE 3 — CLASSIFY + PARSE

Per source: which entities? which atomic claims (one `Finding` each; `kind:"event"`+`event_at` for time-bound)? which relationships (one each)? what's missing (a `Gap`, maybe a new cell)? any attribute / entity-type / media the schema can't hold (route to Phase 5)?

**Write the WHOLE entity:** open its full profile (not the summary row) and emit its **entire attribute set** — ids, fields, role, dates, media, color. One-or-two facts = under-wrote it.

Sweep the subject's recent-developments sources directly — news, the entity's own updates/schedule, listings/aggregators — and record each dated item (`kind:"event"`+`event_at`), recent-first. A static profile won't show what's current.

### PHASE 4 — WRITE PASS (dependency order)

1. Sources → 2. entities (`topology`) → 3. findings (cite source + entity ids; set `kind`/`event_at`) → 4. relationships + gaps (`topology`). If MCP is connected use `append_sources` / `append_findings` / `update_topology` (validate + dedup + atomic); else native file tools.

### PHASE 5 — VERIFY + DEDUP + REPLENISH

- Spot-check 3–5 findings you wrote (evidence real? URL resolves?). Re-run Phase-1 dedup. File any post-write dup as Pending Re-run.
- **Replenish the frontier (THE discovery engine).** A frontier item = a fact the schema **can't hold** or a source the engine **can't reach** — *not* undone work (do it this pass). Every pass MUST name ≥1, or log `no new frontier this pass — <why>`. Two SEPARATE channels:
  - **DATA gap** → `topology.gaps`: an **attribute** (a fact with no field), an **entity-type** (a structured thing not yet typed → also write it into `topology.entities` with a new kebab `type`; guard: a name-drop ≠ a type — mint only when it has its own facts/attrs/edges), or **media** (an image/video URL → record as a `source_id` + name the media field). You're already harvesting full profiles (Phase 3) — mint a gap for every attribute the schema can't yet hold. *e.g.* `{"description":"Need '<attribute>' on <type>","gap_type":"data","priority":"medium","cell":"<cell>"}`.
  - **CAPABILITY gap** → Phase 5.5 (a limit of the lra engine, not a `topology.gaps` entry).
- **An enumeration-shaped gap IS your next cell:** if you can name a *kind* but haven't enumerated its instances, add it as a `none` cell (or flip the parent to `partial`) — you may NOT mark the parent `complete`.

### PHASE 5.5 — CAPABILITY DISCOVERY (MANDATORY)

A capability gap is a limit of the **lra engine** (schema, tools, source reach). **Test: would it help research ANY subject, or only this domain?** Only-this-domain (a visualizer / simulator / calculator for the subject's field) is NOT a capability gap — drop it. A real one (a source it can't reach — paywall / API-only / JS / 403; a harvesting method it lacks) → call `propose_capability(id, title, area: schema-field|mcp-tool|fetcher|runtime|viewer|tooling, description, justification?, priority?)`. If none: state `"no capability gaps this pass — <why>"` in Phase 6 + Phase 7. (Never write capability gaps into `topology.gaps`.)

### PHASE 6 — SELF-IMPROVEMENT (MANDATORY)

If MCP is connected use `update_prompt_section` per section (`bump_version:true` on the first call; `append:true` for CHANGELOG); else native edit of `{{ABSOLUTE_PROMPT_PATH}}`. Do all:
- Append a CHANGELOG entry (template at bottom); bump Version. Keep only the last 5 entries.
- Update COVERAGE LADDER (claimed cells per the rubric; live → `live (last_swept: <iso>)`; add new cells; may re-open `complete` cells flagged in `audit.md`).
- Note any organizing dimension that emerged — spine/re-spine the ladder if it helps; don't force one.
- Update CANONICAL IDs, DO-NOT-CONFUSE, NAMING & CONSISTENCY, TOOL-FAILURE FALLBACK MATRIX with what you confirmed/hit.
- Self-audit fill rates → AUDIT-DERIVED RULES (any attribute mostly empty → a rule to backfill it next pass).
- Record the coverage self-check + the capability-gap line in this CHANGELOG entry.
### PHASE 7 — FINAL REPORT

One message: tool readiness; counts (`+Nf / +Ns / +Ne / +Nr / +Ng`); ladder status (complete/total, none-count); 3–5 most surprising/load-bearing findings; coverage self-check; capability-gap line; the CHANGELOG text; optional `reports/<pass-id>.md` pointer.

**Pending Re-run:** append any blocked write with enough detail to re-attempt (else "none").

---

## TOOL-FAILURE FALLBACK MATRIX

```
fetch 403 / empty / truncated         → `browser` fetch (real Chrome headers + JS)
table in-browser but not in the HTML  → hidden in HTML comments; `browser` fetch with script (eval DOM/comment node)
page huge / fetch truncates           → `browser` fetch with selector for just the target element
SPA/SSR page empty to a plain fetch   → data in an embedded <script> JSON blob; `fetch_structured` kind:"embedded"
FB/IG page → empty login shell        → `fetch_social` (public name/bio/website/category/image/followers; deeper page content is login-walled — follow the returned website)
eval cross-origin fetch() blocked (CORS) → navigate to the target with `browser` fetch instead
wrong/stale page returned               → assert the `url`/`redirected` the `browser` returns; each fetch is per-op isolated
```

## IDEMPOTENCE

Per-cell + kind-specific. **Live** cells are non-idempotent — each pass sweeps the window since `last_swept` and adds rows; nothing added = the sweep didn't run. Re-running a **bounded** cell should add ~zero (Phase-1 inventory + Phase-5 dedup catch existing data). Zero new on a bounded cell = that cell is dry, NOT the subject.

## CHANGELOG

- **v1 (initial):** Seeded by `lra subject create` on {{SEED_DATE}}. No passes yet; COVERAGE LADDER empty.

<!--
v2+ template (copy, fill, append above this comment):
- **v{N} (cell: <cell-id>, YYYY-MM-DD):** {headline}. {2-4 sentences}.
  **counts**: +{F}f / +{S}s / +{E}e / +{R}r / +{G}g
  **ladder**: <cell-id> → <status>; cells <complete>/<total> (<none> none)
  **coverage self-check**: <dimensions + representative|thin each; what's still worth pursuing>-->
