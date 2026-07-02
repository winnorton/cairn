# SPEC_HIVE_CONTEXT_SESSIONS_05_ADAPTER_PI

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope contract) · **Repo:** `cairn-mcp-server`

## Goal
Normalize Pi (pi.dev) session transcripts into the canonical envelope, and resolve the §0 discrepancy: does the existing MCP parser actually handle Pi, or only the markdown skill claim?

## Scope
- **First, verify empirically:** feed a real Pi session to the current MCP `session_distill`; record whether it parses or falls back. Reconcile the `/session-distill` skill's "Pi auto-detect" claim with reality.
- Build `src/adapters/pi.ts` for the Pi JSONL shape: first line `{"type":"session"}` + nested `model_change`, plus Pi's tool-call / message / token-usage events.
- Map Pi fields → envelope `events[]`; capture model/provider/thinking-level from header events.
- Run redaction (WS 03); validate against the schema.
- Source a real Pi session sample (coordinate with WS 07 fixtures) — Pi session locations: `~/.pi/agent/sessions/<slug>/<ts>_<id>.jsonl`.

## Telemetry hook
N/A directly: envelope carries counts WS 08 reads.

## Diagnostics path
`normalize --harness pi <file>` prints envelope + parse-coverage; the verification step's pass/fail note is recorded in the elaborated spec.

## Rollback story
Pre-production; rollback = `git revert`.

## Gate
A real Pi session normalizes to a schema-valid envelope; the MCP-parser discrepancy is resolved in writing (handles-Pi: yes/no, and what changed).

## Files
`cairn-mcp-server/src/adapters/pi.ts`, registry registration, a Pi normalization test, a note reconciling the markdown-skill claim (feeds WS 10 docs).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_05_ADAPTER_PI.md`. The elaborating session reads the master at §2.1/§2.5/§2.6, §3 (Pi-parser discrepancy resolution row), and this workstream entry. Capturing a real Pi sample is a pre-flight blocker.
