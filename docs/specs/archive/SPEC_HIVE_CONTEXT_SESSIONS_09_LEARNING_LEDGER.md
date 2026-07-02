# SPEC_HIVE_CONTEXT_SESSIONS_09_LEARNING_LEDGER

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope), 02 (corpus), adapters · **Repo:** `cairn-mcp-server` (tools) + `cairn-sessions` (findings) · **Owns: Diagnostics cross-cutting axis + MCP backward-compat**

## Goal
Cut the existing learning tools over to the canonical envelope and build the findings ledger so distillation output accumulates and compounds — without breaking existing MCP tool signatures.

## Scope
- Point `session_distill` / `overclaim_check` / `lesson_replay` / `namespace_audit` at the envelope as a NEW input branch — existing `transcript_path`/`payload` signatures unchanged (additive, per §3).
- `distillate_dock`: write distillation output to `cairn-sessions/findings/<id>.findings.json` per master §2.4; update `LEDGER.md` rollup.
- Make distillation read prior `findings/*.json` before analyzing — match against the `/session-distill` seeded catalog so patterns are recognized, not re-derived (the compounding mechanism).
- `finding.schema.json`.
- Add a `corpus_status` diagnostic MCP tool (coverage, distilled ratio, last-distilled).
- Backward-compat smoke test: existing tool signatures + outputs for the raw-CC path unchanged (DoD #7).

## Telemetry hook
`corpus_status` exposes distilled-vs-undistilled counts + ledger size. Distillation writes `redaction`/pattern counts into findings.

## Diagnostics path
This workstream owns the diagnostics axis — `corpus_status` is the agent-readable corpus health surface; `lesson_replay` over the envelope corpus is the retrospective diagnostic.

## Rollback story
Additive; rollback = remove the envelope input branch + the ledger writes. The raw-CC path is untouched, so existing callers are unaffected throughout.

## Gate
`session_distill` consumes an envelope and writes a schema-valid `findings/<id>.findings.json`; `LEDGER.md` updates; distillation N+1 demonstrably reads prior findings; existing tool signatures unchanged (smoke test green).

## Files
`cairn-mcp-server/src/tools/session_distill.ts` (+ overclaim/lesson_replay/namespace_audit) envelope branch, `src/tools/distillate_dock.ts` ledger writes, `src/tools/corpus_status.ts`, `cairn-sessions/schema/finding.schema.json`, `cairn-sessions/findings/LEDGER.md`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_09_LEARNING_LEDGER.md`. The elaborating session reads the master at §2.4 (finding schema), §3 (MCP backward-compat decision), §5 (DoD #6/#7), §6 (signature-break risk), and this workstream entry. Read the current `cairn-mcp-server` tool implementations first.
