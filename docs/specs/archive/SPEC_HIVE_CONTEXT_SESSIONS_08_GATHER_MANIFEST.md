# SPEC_HIVE_CONTEXT_SESSIONS_08_GATHER_MANIFEST

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01 (envelope), 02 (corpus), ≥1 adapter · **Repo:** `cairn-mcp-server` (gather/manifest gen) + `cairn-sessions` (output) · **Owns: Telemetry cross-cutting axis**

## Goal
Discover candidate sessions across the three harness locations and auto-generate the `MANIFEST` index — one row per session with coverage telemetry.

## Scope
- `gather`: sweep `~/.claude/projects/*/`, `~/.pi/agent/sessions/*/`, `~/.gemini/antigravity/brain/` for candidate sessions; list with harness + id + mtime; select for ingest.
- Run selected sessions through detect → adapter → redact → persist (uses WS 01/03/04/05/06).
- `MANIFEST.md` generation from `normalized/**`: one row per session per master §2.3 (`id | harness | project | model | started | events | tools | distilled? | findings | redaction_hits`).
- `manifest-row.schema.json`.
- Dedup + uniqueness: no two committed envelopes share an `id` (CI check, supports §6 federation-dedup risk).
- Telemetry: per-harness coverage counts surfaced in the manifest header.

## Telemetry hook
The manifest IS the telemetry surface — per-harness session counts, distilled-vs-raw ratio, total redaction hits. This workstream owns the telemetry cross-cutting axis.

## Diagnostics path
`gather --dry-run` lists discoverable sessions without ingesting; `manifest --check` verifies row-count == envelope-count and flags duplicate ids.

## Rollback story
Pre-production; rollback = `git revert` + regenerate manifest (idempotent from `normalized/**`).

## Gate
`MANIFEST.md` auto-generates; row count == committed envelope count (DoD #5); `gather --dry-run` lists sessions across all three harness locations; duplicate-id check passes.

## Files
`cairn-mcp-server/src/tools/gather.ts` (+ MCP tool registration), `src/tools/manifest.ts`, `cairn-sessions/schema/manifest-row.schema.json`, generated `cairn-sessions/MANIFEST.md`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_08_GATHER_MANIFEST.md`. The elaborating session reads the master at §2.3 (manifest schema), §2.2 (layout), §6 (dedup risk), §8 (counts-are-programmatic), and this workstream entry.
