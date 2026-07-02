# SPEC_HIVE_CONTEXT_SESSIONS_07_FIXTURES

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 02 (corpus), 03 (redaction), 04 + 05 + 06 (adapters) · **Repo:** `cairn-sessions`

## Goal
Commit one real, redacted, schema-valid normalized envelope per harness — the cross-harness proof and the regression corpus. The forcing function that makes the adapters real.

## Scope
- Capture one real session per harness: Claude Code (have — `fable_first`/`cairn_origin`), Pi (from WS 05's sourced sample), Antigravity (from WS 06's `.pb` blob).
- Run each through its adapter → redaction → schema validation.
- Commit the resulting `<id>.envelope.json` under `normalized/<harness>/<project_slug>/` (raw stays out).
- These envelopes become the fixtures WS 08 (manifest) and WS 09 (distill/ledger) build and test against.
- Confirm DoD #2 (≥3 envelopes across ≥3 harness dirs).

## Telemetry hook
N/A: fixtures are static data. Their counts populate the first real MANIFEST rows (WS 08).

## Diagnostics path
Each committed fixture is itself the diagnostic baseline; a schema-validation run over `normalized/**` (WS 10 CI) gates them.

## Rollback story
Pre-production; rollback = delete the fixture envelopes. Raw never committed, so no secret-exposure rollback needed beyond redaction (WS 03).

## Gate
≥3 schema-valid, redacted envelopes committed — one each for claude-code, pi, antigravity; `normalized/` shows all three harness dirs populated.

## Files
`cairn-sessions/normalized/claude-code/<slug>/<id>.envelope.json`, `.../pi/<slug>/<id>.envelope.json`, `.../antigravity/<slug>/<id>.envelope.json`. (Raw sources captured locally, gitignored.)

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_07_FIXTURES.md`. The elaborating session reads the master at §5 (DoD #2), §2.2 (where envelopes land), §4 (redaction precondition), and this workstream entry. This workstream is the integration proof for Wave 1 — it cannot start until at least one adapter emits valid output.
