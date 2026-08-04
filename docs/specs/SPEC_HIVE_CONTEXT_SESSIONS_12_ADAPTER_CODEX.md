# SPEC_HIVE_CONTEXT_SESSIONS_12_ADAPTER_CODEX

**Status:** READY FOR EXECUTOR · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](archive/SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope contract) · **Repo:** `cairn-mcp-server`

## Goal
Normalize **Codex / OpenGPT** session transcripts into Cairn's canonical `Envelope` format so that `/session-distill` can ingest, quantify, and analyze Codex sessions alongside Claude Code, Pi, and Antigravity.

## Human Intent
- **Symptom/Goal**: Users who use OpenAI Codex / OpenGPT want to run `/session-distill` on their sessions to extract patterns, memory candidates, and law recommendations into Cairn.
- **System/Files**: `cairn-mcp-server/src/adapters/codex.ts`, `cairn-mcp-server/src/adapters/detect.ts`, `cairn-mcp-server/src/adapters/types.ts`, `cairn-mcp-server/src/tools/session_distill.ts`, `skills/session-distill/SKILL.md`.
- **Success Criterion**: A raw Codex session (`~/.codex/session_index.jsonl`, `history.jsonl`, or SQLite log) normalizes into a schema-valid `Envelope` with full tool call, message, and token usage events.

## Pre-flight
Run in `cairn-mcp-server`:
1. `npm run build` — must succeed cleanly before making edits.
2. `npm test` — verify existing unit tests pass.

## Numbered Phases

### Phase 1: Type Extensions & Harness Registration

#### Step 1: Extend `EnvelopeSession` and `adapterRegistry`
- File: [types.ts](file:///c:/Users/winno/projects/cairn/cairn-mcp-server/src/adapters/types.ts)
- Add `'codex'` to the `EnvelopeSession['harness']` union type.
- Add `'codex': null` entry to `adapterRegistry`.

### Phase 2: Format Detection

#### Step 2: Implement Codex format detection heuristics
- File: [detect.ts](file:///c:/Users/winno/projects/cairn/cairn-mcp-server/src/adapters/detect.ts)
- Sniff `.codex` path components, `session_index.jsonl`, `history.jsonl`, and SQLite database signatures (`logs_2.sqlite`, `state_5.sqlite`).
- Return `'codex'` when detected.

### Phase 3: Codex Adapter Implementation

#### Step 3: Implement `adapters/codex.ts`
- File: [codex.ts](file:///c:/Users/winno/projects/cairn/cairn-mcp-server/src/adapters/codex.ts)
- Read Codex JSONL history / SQLite session logs.
- Map user prompts, assistant outputs, tool executions, and token metrics into canonical `EnvelopeEvent` items.
- Run `scrubEnvelope()` on text payloads before returning.
- Call `registerAdapter()` to register the adapter instance.

#### Step 4: Export and Wire Adapter
- File: [index.ts](file:///c:/Users/winno/projects/cairn/cairn-mcp-server/src/adapters/index.ts)
- Export `codex.ts` module to auto-register on startup.

### Phase 5: Skill & Tool Integration

#### Step 5: Update `session_distill.ts` search paths
- File: [session_distill.ts](file:///c:/Users/winno/projects/cairn/cairn-mcp-server/src/tools/session_distill.ts)
- Add `~/.codex` directory to default session lookup paths.

#### Step 6: Update `session-distill/SKILL.md`
- File: [SKILL.md](file:///C:/Users/winno/.gemini/config/plugins/cairn/skills/session-distill/SKILL.md)
- Update environment location table and detection heuristics to include Codex.

## Checkpoints

- **Checkpoint 1**: `npm run build` in `cairn-mcp-server` passes with zero TypeScript errors.
- **Checkpoint 2**: Run `detect()` against a sample Codex session file and verify it returns `'codex'`.
- **Checkpoint 3**: Run `normalize()` on a sample Codex transcript and verify `validateEnvelope()` succeeds.

## Post-flight
- Run `npm run build` and `npm test` across `cairn-mcp-server`.
- Commit changes or hand off to executor agent for implementation.
