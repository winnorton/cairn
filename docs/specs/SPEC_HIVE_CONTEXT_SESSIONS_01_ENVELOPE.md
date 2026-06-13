# SPEC_HIVE_CONTEXT_SESSIONS_01_ENVELOPE

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Repo:** `cairn-mcp-server`

## Goal
Define and freeze the canonical, harness-agnostic session envelope schema that every adapter emits and every learning tool consumes.

## Scope
- Author `schema/envelope.schema.json` (JSON Schema) per master §2.1.
- Define the TypeScript `Envelope` type + the `normalize(rawPath) → Envelope` adapter interface (master §2.5) in `cairn-mcp-server/src`.
- Specify the `content_hash` idempotence key (sha256 of raw input) and the determinism invariants (master §4 sub-clause).
- Define the adapter registry + format-signature detection seam (JSONL envelope-shape sniff; `.pb` magic-byte/path detection).
- Provide a schema-validation helper the CI gate (WS 10) and the corpus (WS 02) reuse.
- `schema_version` policy for future evolution.

## Telemetry hook
N/A: a schema definition emits no runtime telemetry. Downstream `redaction.hits` and per-session counts are surfaced by WS 08.

## Diagnostics path
A standalone validator (`validate-envelope <file>`) that reports schema violations with JSON-pointer paths; reused by WS 10's CI gate.

## Rollback story
Pre-production; rollback = `git revert`. `schema_version` lets later breaking changes coexist (old envelopes re-normalized, never hand-edited).

## Gate
`schema/envelope.schema.json` validates as a JSON Schema; the `Envelope` type + adapter interface are exported; a round-trip test normalizes a trivial fixture and the result validates against the schema.

## Files
`cairn-mcp-server/schema/envelope.schema.json`, `cairn-mcp-server/src/adapters/types.ts` (Envelope, Adapter interface, registry), `cairn-mcp-server/src/adapters/detect.ts`, a validation helper under `src/helpers/`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_01_ENVELOPE.md`. The elaborating session reads the master at §2 (contract surfaces), §3 (resolved decisions), §4 (hard contract), §8 (parallel-execution protocol), and this workstream entry before drafting.
