# {{SUBJECT_NAME}} — research workspace

These are the **operating rules** for every agent in this workspace — the researcher
(`research/PROMPT.md`), the librarian (`library/PROMPT.md`), and every sub-agent they spawn. They
are read on every invocation. Each `PROMPT.md` holds the **task** (its coverage ladder, stores,
phases); this file holds **how you operate**. If the two ever disagree, this file wins.

## A. The world (boundaries)

- You are in a **self-contained research workspace**. Everything you need is here; there is nothing
  useful above this directory.
- **Touch only your layer's stores.** The researcher writes `research/`; the librarian reads
  `research/` and writes `library/`. Never write the other layer's stores. The flow is **one-way**:
  the researcher discovers, the librarian structures downstream.
- DO NOT use a local path outside this workspace as a *source of facts*.
- **Never run engine commands** (build / validate / test / lint) and **never shell out to `pi`,
  `agy`, or `lra`.** Those belong to the engine that produced this workspace. For parallelism,
  **spawn your own sub-agents** (§E).
- Subject knowledge lives ONLY in the two `PROMPT.md` files, the stores, and `subject.json` — nowhere else.

## B. Source & id integrity

- You must **cite the source** for every fact you record. Never fabricate a source; spot-check that
  it's real and actually contains the cited content before you rely on it.
- **Never fabricate a media URL** (an image/video/`url` field value, or a media `source_id`) — the
  same rule as sources, for the same reason. Record only a URL you pulled from a page you actually
  fetched; never reconstruct one from memory (a `upload.wikimedia.org/.../<x>/<xy>/<File>` hash path
  is uncomputable in-head, so a guessed one 404s). Can't extract a real one? Leave the field unset
  and raise a gap — an unsourced media URL is a gap, not a fact.
- Entity `id`s are **kebab-case slugs, starting with a letter**. Reuse an entity's canonical id once
  it has one — never mint a local variant. Establish a consistent id convention per entity type, and keep it stable across passes.

## C. The merge contract (so parallel writers converge instead of colliding)

Dedup on **stable keys**, never on object identity:

- **entity** → its canonical **slug** (same slug = same entity: merge attrs, union sources).
- **relationship** → the triple **`from|kind|to`**.
- **source** → its **URL**.  **finding** → its id.  (library rows additionally dedup by `(entity_type, id)`.)

## D. Discover from the data

The subject's structure is **yours to discover from the data you acquire** — it lives in `topology` as ordinary entities and relationships (§C). If a grouping matters it shows up as edges clustering: record those edges as facts, and downstream derives whatever sets they support.

## E. Fan-out (your own sub-agents, per partition cell)

When you have parallelism, **spawn your own sub-agents** — the researcher one per axis cell, the
librarian one per entity type — each told *"focus on `<cell>` and execute `<your-layer>/PROMPT.md`"*.
They converge through the shared canonical ids (§C). **Sub-agents propose; the lead ratifies** — a
sub-agent reports new canonical ids / rules in its final message; the lead writes them in. Do not
shell out to other CLI agents — spawn within your own runtime.

## F. Loop discipline

- **Inventory first, never recreate.** Read the stores + this pass's prior writes before searching;
  skip what already exists.
- **Run-until-dry, operator-looped.** A pass ends when its claimed cell stops yielding new rows; the
  operator re-runs until passes go dry. There is no engine "done" — the loop is the operator's.
- **Idempotence is per-cell and kind-specific:** re-running a **bounded** cell / `--focus` should add
  ~zero rows; a **live** cell is non-idempotent — it sweeps the window since `last_swept` and is
  expected to add rows. Many writes on a bounded re-run signal the prior pass was incomplete — NOT
  that the subject is finished.

## G. Editing your PROMPT.md (the self-edit)

When your `PROMPT.md` tells you to update its ladder or changelog, replace the **whole block**
between its anchor headings, then **read it back and confirm your change landed**. Never rely on a
brittle exact-match find/replace that can silently no-op.

## H. MCP tools (structured store access)

If an `lra-research` MCP server is connected, use its tools for store reads AND writes:

- **Reads:** `list_entities`, `query_entities`, `query_findings`, `list_sources`, `check_source`,
  `get_coverage_stats`, `get_prompt_state`, `run_lint`, `validate_row`, `get_entity_detail`, `fetch_structured`, `get_capabilities`, `list_capability_requests`, `get_capability_request` — use these instead of reading raw JSON/JSONL
  files. **Use `get_prompt_state` to check version, ladder status, and changelog** instead of
  re-reading the full PROMPT.md. Pass `layer: "library"` for the librarian prompt. **Use `get_entity_detail` to get a joined view of one entity.** **Use `fetch_structured` to parse infoboxes, tables, keyvalues, or embedded page-state JSON from a URL.**
- **Writes:** `append_findings`, `append_sources`, `update_topology`, `update_prompt_section`,
  `register_canonical_ids`, `update_schema`, `append_rows`, `append_relationships`, `propose_capability`, `update_capability_status` — use
  these — they validate against the schema, deduplicate, and
  append atomically. **Use `update_prompt_section` for Phase 6 self-edits** — pass the section name
  and new content; the tool handles anchor-heading replacement.
- **Librarian writes:** the librarian's stores (rows/canonical_ids/schema/relationships) have write tools too. Pass `layer: "library"` to `append_sources` for librarian sources.

The write tools give id-reconciliation, dedup, and upsert for free. Compute in `scratch/`; `run_lint(layer:"library")` before a pass is done.

**Trust MCP tool output — do not re-read files to verify it.** `get_prompt_state`, `get_coverage_stats`,
`list_entities`, etc. read directly from disk every call. Their output IS the current state. If you
call `get_prompt_state` and it says `v31`, the file says `v31` — do not re-read PROMPT.md to
double-check. Re-reading wastes tokens and risks misinterpreting partial output.
