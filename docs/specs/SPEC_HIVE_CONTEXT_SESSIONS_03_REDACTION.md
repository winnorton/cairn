# SPEC_HIVE_CONTEXT_SESSIONS_03_REDACTION

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Repo:** `cairn-mcp-server` (scrubber) + `cairn-sessions` (hook) · **Owns the §4 HARD CONTRACT**

## Goal
Build the systematic secret-scrubber and wire it as a two-layer gate so no raw secret ever lands in a committed corpus artifact. Operationalizes `[LAW credentials-never-in-transcript]`.

## Scope
- `scrub(input) → { clean, hits, rules_version }` per master §2.6 — secret-shape patterns: GitHub PAT (`github_pat_…`, `ghp_…`), AWS (`AKIA…`), OpenAI (`sk-…`), bearer tokens, PEM private-key blocks, generic high-entropy `KEY=`/`TOKEN=`/`SECRET=` assignments.
- Layer 1: invoked inside normalization (WS 01 interface) — envelope persistence refused unless `redaction.scrubbed == true`.
- Layer 2: a `cairn-sessions` pre-commit hook that blocks any staged file containing a known secret shape (catches hand-added files bypassing normalization).
- A **planted-secret test fixture** proving 100 % catch on the known-shape set; misses are release-blocking.
- `rules_version` string stamped into each envelope's `redaction` block.

## Telemetry hook
`redaction.hits` per session (written into the envelope) — surfaced in the manifest by WS 08.

## Diagnostics path
`scrub --explain <file>` lists each hit with pattern name + offset (redacted preview). The planted-secret fixture doubles as the diagnostic regression corpus.

## Rollback story
Additive safety layer; rollback = remove the hook + scrub call. But rollback is discouraged — this is the load-bearing §4 contract.

## Gate
Planted-secret fixture caught 100 %; pre-commit hook demonstrably blocks an un-scrubbed staged file; normalization refuses to persist an un-scrubbed envelope.

## Files
`cairn-mcp-server/src/redaction/scrub.ts`, secret-shape pattern table, `cairn-mcp-server/test/redaction.planted.*`, `cairn-sessions/.githooks/pre-commit` (+ install note in WS 02's README), `rules_version` constant.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_03_REDACTION.md`. The elaborating session reads the master at §4 (hard contract — this workstream owns it), §2.6 (redaction interface), §6 (the critical-severity risk row), and this workstream entry before drafting.
