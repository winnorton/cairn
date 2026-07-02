# SPEC_HIVE_CONTEXT_SESSIONS_04_ADAPTER_CLAUDE_CODE

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope contract) · **Repo:** `cairn-mcp-server`

## Goal
Normalize Claude Code session transcripts into the canonical envelope by refactoring the existing `transcript.ts` parsing into a proper adapter.

## Scope
- Refactor `cairn-mcp-server/src/helpers/transcript.ts` Claude-Code parsing into `src/adapters/claude-code.ts` implementing the WS 01 `normalize` interface.
- Handle the CC envelope shapes: `{"type":"queue-operation","operation":"enqueue"}`, `{"type":"message",...}` (assistant), tool calls, tool results, `type:compaction`, error events, model/provider header.
- Map CC fields → envelope `events[]` (role, type, text, tool, stop_reason, tokens).
- Run redaction (WS 03) inside normalization; populate `redaction` block.
- Validate output against `envelope.schema.json` (WS 01).

## Telemetry hook
N/A directly: the emitted envelope carries `redaction.hits` + event/tool counts that WS 08 reads.

## Diagnostics path
`normalize --harness claude-code <file>` prints the envelope + a parse-coverage report (lines consumed vs skipped) so lossy parsing is visible.

## Rollback story
Pre-production; rollback = `git revert`. The existing `session_distill` raw-CC path stays until WS 09 cuts over, so no regression window.

## Gate
A real CC session (the `fable_first` or `cairn_origin` sample) normalizes to a schema-valid envelope; parse-coverage report shows no silent large gaps; redaction populated.

## Files
`cairn-mcp-server/src/adapters/claude-code.ts`, refactor of `src/helpers/transcript.ts`, adapter-registry registration, a CC normalization test.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_04_ADAPTER_CLAUDE_CODE.md`. The elaborating session reads the master at §2.1 (envelope), §2.5 (adapter interface), §2.6 (redaction), and this workstream entry. Note: the two committed CC corpus samples are the build-against fixtures.
