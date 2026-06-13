# SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope contract) · **Repo:** `cairn-mcp-server` · **Riskiest workstream — spike-first**

## Goal
Decode Antigravity's `.pb` protobuf session blobs into the canonical envelope. The hard, different-risk-class adapter (protobuf, not JSONL).

## Scope
- **Spike first:** obtain real `.pb` blobs from `~/.gemini/antigravity/brain/` (UUID-named); determine whether a `.proto` schema is available or the wire format must be reverse-engineered.
- Build `src/adapters/antigravity.ts`: structured decode if the schema is recoverable; otherwise best-effort field-walk / text extraction (the D1 fallback).
- Map decoded events → envelope `events[]`.
- Run redaction (WS 03); validate against the schema.
- If full fidelity is blocked, ship best-effort now and draft `SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md` per deferral D1 (named WHEN: after this spike).

## Telemetry hook
N/A directly: envelope carries counts WS 08 reads. The spike records a fidelity level (full / best-effort) in the elaborated spec.

## Diagnostics path
`normalize --harness antigravity <file>` prints envelope + a fidelity report (fields decoded vs skipped). A raw `.pb` field-dump helper aids reverse-engineering.

## Rollback story
Pre-production; rollback = `git revert`. Best-effort fallback means partial coverage is acceptable for v1; full decode is the deferred follow-up.

## Gate
A real Antigravity `.pb` blob normalizes to a schema-valid envelope (full or best-effort, explicitly labeled); fidelity level documented; D1 stub drafted iff fallback was taken.

## Files
`cairn-mcp-server/src/adapters/antigravity.ts`, a protobuf decode helper (or `protobufjs` dep), registry registration, an Antigravity normalization test, possibly `SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY.md`. The elaborating session reads the master at §2.1/§2.5/§2.6, §3 deferral D1, §6 (the high-severity protobuf risk row), and this workstream entry. The `.pb` spike is a pre-flight blocker — do not commit to full decode before it.
