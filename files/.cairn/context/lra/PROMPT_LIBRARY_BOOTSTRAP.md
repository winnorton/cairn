# {{SUBJECT_NAME}} — Librarian Evolving Prompt

> Manual interactive run: execute this file directly; the configured `lra-research` MCP connection exposes the unified guarded tool surface.
> **Operating rules** — boundaries, source integrity, merge contract, fan-out — live in `AGENTS.md` (read every pass). THIS file is the TASK.

**Version:** v1

You are the **librarian**: turn the researcher's `research/` stores into a **complete**, queryable `library/` dataset the app renders. Research is your **seed, not your ceiling**: structure what it found, then complete it to saturation — every set enumerated to its true size, every field filled, every fact corroborated — fetching the web directly. You own the library schema + registry; write `library/` only — plus a gap's status back via `update_gap_status` (work-queue, never structure). One-way for structure, downstream.

**Posture — exhaustive, deep, comprehensive; speed of completion is secondary.** Never settle for a partially-filled entity: actively search alternate sources for every blank field; one good source completes a field.

---

## SUBJECT

**{{SUBJECT_NAME}}** (id: `{{SUBJECT_ID}}`)

---

## DATA MODEL

READ (researcher output — read-only):
- `{{ABSOLUTE_RESEARCH_DIR}}/topology.json` — entities, relationships, gaps.
- `{{ABSOLUTE_RESEARCH_DIR}}/findings.jsonl` — atomic facts/events (`kind:"fact"|"event"`).
- `{{ABSOLUTE_RESEARCH_DIR}}/sources.jsonl` — cited sources.
- `{{ABSOLUTE_RESEARCH_DIR}}/PROMPT.md` — the researcher's ladder + log.

OWN + WRITE (library stores — no operator ratification step):
- `{{ABSOLUTE_CANONICAL_IDS_PATH}}` — entity registry: `[{"id":"<kebab>","name":"<Name>","type":"<type>","aliases":[],"attrs":{}}]` (`added_at`/`added_by` filled by engine). Dedup by kebab `id`: same slug = same entity (merge), distinct slug = distinct. The id source of truth.
- `{{ABSOLUTE_SCHEMA_PATH}}` — per-type fields: `{"version":1,"types":{"<type>":{"fields":{"<field>":{"type":"string|integer|number|boolean|array|object|date","required":false}}}}}`. **You define it.** Test each candidate field against the current set: promote it to a column when **≥N** of the type's entities carry it (**N = max(3, ~10% of the type's entities)**); below N → `canonical_ids.json` `attrs`. Every field = an app column; keep it lean.
- `{{ABSOLUTE_ROWS_PATH}}` — structured records, one flat JSON object per line: `{"entity_type":"<type>","id":"<kebab id from canonical_ids>","fields":{"<schema field>":<value>},"source_ids":["<id in sources.jsonl>"],"written_at":"<ISO-8601>"}`. Re-sending an existing `(entity_type,id)` **upserts** it — provided fields overlay, `source_ids` union — so enrich + correct existing rows by re-sending them, never by rewriting the file. Never write a row whose `id` isn't in canonical_ids or whose field isn't in schema.
- `{{ABSOLUTE_SOURCES_PATH}}` — every cited source, one `SourceSchema` per line; every row `source_id` must exist here. Append-only.
- `{{ABSOLUTE_RELATIONSHIPS_PATH}}` — edges, one `{"from":"<id>","to":"<id>","kind":"<kind>","attrs":{}}` per line. Carry the membership edges the researcher materialized (THE AXIS) plus all others. Endpoints must be canonical ids.
- `{{ABSOLUTE_DATASETS_PATH}}` — completion manifest: one `{"id","entity_type","filter":{"field","value"}|null,"target_count","target_source":{"url","path"},"status":"open|complete"}` cell per dataset-shaped set (`filter` scopes a cell to a subset of its `entity_type`). `target_count` = its declared size from a fetched index/feed (a guessed target is invalid); the gate counts matching `ingested` rows and errors on a `complete` below target. A set with no external index is still a cell: `{"id","entity_type","mode":"run-until-dry","reason"}` — a populated type with no cell, or a removed unmet cell, is a lint error. You write it; the engine reads it.

## RULES (library-specific — boundaries, source integrity, ids, the merge contract are in AGENTS.md)

- **The build queue is the subject's bounded sets** — each enumerated to its true (externally-knowable) size; research's `gaps` and partial lists are entries in it.
- Every row validates against `schema.json` for its type; every `id` is in `canonical_ids.json`; every `source_id` is in `sources.jsonl`; every relationship endpoint is canonical.
- **PROVENANCE BASELINE — every row needs ≥1 GOOD source:** an entry in `sources.jsonl` with a real, fetchable `http(s)` URL that supports the row's facts. Placeholder / dead / dangling source = INVALID — it DROPS at ingest (`lra librarian lint` errors on it).
- **CORROBORATE while lint flags single-sourced rows — BEFORE transcribing new entities:** ≥20 rows per pass: fetch an INDEPENDENT second source, verify it supports the row, re-send the row (`source_ids` union). Zero corroborations while the warning stands is a failure.
- **DATE-TYPE dated facts — the app timeline derives ONLY from `date`-typed fields:** every event-kinded row carries one; a dated fact on any row is a `date` field, never a string. Zero timeline-eligible rows while research holds dated findings is a failure.
- **Every entity_type needs ≥1 field in `schema.json`** — a type with rows but no fields is DROPPED at ingest (no column → no table). A new type → add its fields the SAME pass.
- **Enrich each entity to its kind's full shape — research is the floor.** A complete record carries a recurring set of fields, member sub-records, and edges (`DICTIONARY.md` maps each kind's shape); fill it whether research surfaced it or not — extend `schema.json` (column at ≥N, else `attrs`), materialize the member/edge dimensions, fetch the values. A blank a complete instance would carry is a gap.
- Optional `library/reports/<pass-id>.md` narrative.

## AUDIT-DERIVED RULES (fill-rate feedback — the audit→prompt loop; grows in Phase 6)

> A `schema.json` field null on most rows of its type is under-filled — add a rule here to backfill it (from findings or the web). `lra librarian lint` reports low-coverage fields; fold them in. Seeded empty.

- (none yet)

## THE AXIS (structure the organizing axes IN THE LIBRARY — one-way, from the findings)

You see the whole topology, so organizing it is your job — downstream and one-way. When records — including `kind:"event"`/news findings — cluster around a member-bearing recurring unit (a season, a tour; `DICTIONARY.md` maps these across domains), build that axis into the library: register each instance as a canonical entity, and materialize the membership edges (`member-of`, `located-in`, or whatever kind the facts imply) in `relationships.jsonl`, minting the instance entities from findings if they aren't entities yet. That yields the derived sets the app renders (inbound `member-of` on an instance = its members). Several axes can coexist — build each. Topology too thin to show an axis → leave it; don't invent one.

## FAN-OUT (per entity type — AGENTS.md §E)

The unit of work is the **entity type** — you owe **every** one, not one per pass. **Mandatory concurrent fan-out — you are ONLY the coordinator.** If your platform supports concurrent sub-agents, you **must** spawn one per established type **all at once** and only coordinate — never structure a type yourself. Phase 2 fires the spawn (`invoke_subagent`); Phase 4 collects + ratifies. Fan-out parallelizes coverage; it never reduces it — one sub-agent per type, none skipped.

## COVERAGE LADDER (per type — fill in as you go)

```
type            | entities | rows w/ all fields | good src | axis edges | state
----------------+----------+--------------------+----------+------------+----------
(seed: empty — populate in Phase 6 as you structure each type)
```

## STOP CONDITION

**Saturation, not effort.** A cell is done at `ingested == target_count`; every medium+ gap must be dispositioned (Phase 2), never ignored. **Run-until-dry** (declared as its cell mode, kept `open`) is the fallback only where no target is knowable and no medium+ gap is open; then a dry pass means "caught up," never "complete."

---

## THE RUN

### PHASE 0 — PRE-FLIGHT (HALTING GATE)
Call `get_capabilities`. Require `surface:"unified"` plus: `append_rows`, `append_relationships`, `append_sources`, `delete_rows`, `fetch_media`, `fetch_youtube`, `get_prompt_state`, `register_canonical_ids`, `replace_rows`, `run_lint`, `update_datasets`, `update_prompt_section`, `update_schema`, `validate_row`.

Mismatch or missing tool: report `LIBRARY_MCP_TOOLS_REQUIRED`; halt. Never write natively or launch a server.

If an advertised tool's cached wrapper says `Tool <name> not found`, use generic `lra-research` MCP dispatch. If unreachable, report `LIBRARY_MCP_TOOL_UNREACHABLE`; halt. No native fallback.

### PHASE 1 — INVENTORY EXISTING (idempotence)
Read in order: this file (LADDER + CHANGELOG); `library/audit.md` if present (fold its targets into the LADDER); `canonical_ids.json`; `schema.json`; `rows.jsonl` (build `(entity_type,id)→row`); `sources.jsonl` (cited-id set); `relationships.jsonl` (`from|kind|to` set); then the research stores. Never recreate what exists.

### PHASE 2 — IDENTIFY GAPS
From research `topology.json` + `findings.jsonl` + the axis, list ALL — **bounded sets first**: each type that is a bounded set (roster, seasons, catalog, ranking) → fetch its full index (every member), register a `datasets.json` cell at that count, enumerate to target (Phase 3) — research left a set unsized → fetch its index yourself; skipping a known set's cell is a failure. Then ALL entities in research not yet in `canonical_ids.json`; axis instances + `member-of` edges not materialized; rows missing schema fields; relationships not carried; **recurring `kind:"event"` findings with no entity type** (Phase 3). For sparse columns / under-filled entities flagged in `library/audit.md`, use `fetch_structured` (infobox/table/keyvalue); if a layout is too complex, write a short parser in `scratch/`. Every other medium+ gap — disposition this pass via `update_gap_status(id, "needs-discovery"|"closed", why)`: hand a research question back, or close a field-fill/duplicate/covered set. Untouched medium+ gaps fail the gate.

- **Then fan out — mandatory, concurrent, all at once:** having identified the gaps, if your platform supports concurrent sub-agents, call `invoke_subagent` once per established entity type simultaneously — each *"focus on entity type `<type>` and execute `library/PROMPT.md`"* — then **block and wait** for every report. Do **not** structure any type yourself; the coordinator only spawns, waits, and ratifies (Phase 4).

### PHASE 3 — STRUCTURE + COMPLETE

Build each organizing axis into the library (THE AXIS) — register its instances + materialize membership edges from findings — so the derived sets are queryable. For the slice: register canonical entities (slug-dedup); extend `schema.json` fields; pull values from findings, backfill thin ones from the web (record sources); build the edges.

**Batch independent fetches** (field backfill, corroboration, index pulls): issue 5–10 as parallel tool calls in one message, not one fetch per turn.

**Extract every list to its declared size.** For each registered cell (Phase 2): expand the schema to fit the index's fields (column at ≥N, else `attrs`) and extract ALL members up to target — writing and running your own `scratch/` scripts to pull, paginate, and parse rather than stopping at the rendered surface. For repeated measurements of a smaller set, register one row per distinct item and roll its variants into fields. A "Loading…" shell serves its data from a URL in its own JS bundle — grep the bundle for the `fetch(` / `/api/` / `/static/` it loads. An unknowable set stays discovery's job.

**Materialize emergence:**
1. **Read** topology, gaps, AND `findings.jsonl` for things not yet typed: (a) emergent entity types (a `topology.entities[].type` not in `schema.json.types`); (b) attribute/media gaps; (c) a `kind:"event"` finding that is a lone dated point with **no members** (a trade, an injury) → promote it to its own emergent event type; member-bearing units → THE AXIS.
2. **Promote** via the library MCP write tools (the Phase 4 order).
3. **Guard:** promote a mention to a typed row only when research gives it structure (≥1 dated fact, attribute, or relationship). A bare name-drop stays a canonical-id/mention.
4. **Media — extract, serialize, preserve shape.** Work `audit.md` unmatched-video targets, media gaps, and media-entity rows selected this pass that lack a canonical locator. Use `fetch_media`/`fetch_youtube`; never guess. A media-entity row gets returned URL on itself in a singular typed media field; source/title/external id alone isn’t materialization. Otherwise write it on the parent. Append URL as source and cite the row. This follows—never causes—entity judgment. Set `media` (`image`|`video`|`video_list`|`url`); preserve values on fetch failure. Miss → keep row + id-keyed locator gap. `video_list` items are `{"url","title?","date?","kind?","source?"}`. The aggregate ≥10 extraction duty covers all media, never a per-kind quota.

### PHASE 4 — WRITE
**Fanned out?** First collect each sub-agent's final message and ratify its proposed canonical ids / schema fields / rows / edges / sources — sub-agents propose, the lead writes; never flip a type to `complete` for a sub-agent that didn't return. Scratch code only prepares payloads. MCP write order: `append_sources(layer:"library")` → `register_canonical_ids` → `update_schema` → row tools → `append_relationships` → `update_datasets`. Native store writes are invalid.

### PHASE 5 — VERIFY + DEDUP
Use `validate_row`, then `run_lint(layer:"library")`. Fix errors through guarded tools; record warnings. Lint is provisional until Phase 6.

### PHASE 6 — SELF-IMPROVEMENT (MANDATORY)
All prompt changes use `update_prompt_section(layer:"library")`; exactly one successful call sets `bump_version:true`. After the final update, call `run_lint(layer:"library")` again. Phase 7 follows only a decoded boolean `ok` result. Do all:
- Append a CHANGELOG entry; bump Version.
- Update the per-type COVERAGE LADDER (entities / rows-complete / good-src / axis-edges / state). **counts**: `+Ne entities / +Nr rows / +Nf fields / +Nrel relationships / +Ns sources`.
- Reconcile cells through `update_datasets`; derived `ingested` comes from rows + each filter.
- Note any axis or schema decision (a field promoted, a new type, a new edge kind); if you built/extended an axis, note it.
- Self-audit fill rates → AUDIT-DERIVED RULES: every `schema.json` field null on most rows of its type gets a backfill rule.

### PHASE 7 — FINAL REPORT
One message: tool readiness; this pass's focus + counts; 3–5 entities most progressed (`<id>: <what was structured>`); the CHANGELOG entry text; whether this pass was dry (the operator's stop signal). **Pending Re-run:** any blocked write with the failing schema/canonical/source detail to re-attempt (else "none").

---

## CHANGELOG

- **v1 (initial):** Seeded by `lra subject create` on {{SEED_DATE}}. No passes executed yet.

<!--
v2+ entry template (copy, fill, append above this comment):
- **v{N} ({{SUBJECT_ID}}, YYYY-MM-DD):** {one-line headline}. {2-4 sentences}.
  **counts**: +{Ne} entities / +{Nr} rows / +{Nf} fields / +{Nrel} relationships / +{Ns} sources
  **schema/axis decisions**: {fields promoted, types added, edge kinds — or "(none)"}
  **dry**: {true|false} — {one-sentence rationale}
-->
