# NOTE — HIVE ↔ OWNERSHIP coordination (shared-surface handoff)

**Date:** 2026-06-13 · **Status:** open · **For:** the agent driving [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](../specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)

The HIVE_CONTEXT_SESSIONS work (shipped 2026-06-13: `cairn-mcp-server` v0.5.0 +
the private `cairn-sessions` corpus + `cairn-ingest` CLI/distiller + the spark deploy
spec) and SPEC_CAIRN_OWNERSHIP overlap at **three shared cairn-repo files plus one path
convention**. HIVE's code is in separate repos OWNERSHIP doesn't touch, so this is
docs/coordination only — but OWNERSHIP's stubs don't mention the HIVE content, so flag
it to avoid clobbering:

- **WS07 (skill body paths)** — `files/skills/session-distill/SKILL.md` gained a "Session
  corpus and findings ledger" section + a Pi-parser reconciliation (HIVE WS10). **Preserve
  that section** while sweeping state paths; it documents the corpus integration, not a
  vendor-dir state path.
- **WS10 (docs)** — `AGENTS.md` + `HANDOFF.md` carry HIVE notes (the `cairn-sessions`
  corpus exists; `cairn-mcp-server` v0.5.0 session-ingestion tooling exists; the program +
  WS 11 ingest CLI). **Carry these forward** in the `.cairn/` rewrite — don't drop them.
- **WS12 (namespace audit)** — inventory the HIVE-introduced cairn-namespaced artifacts:
  repos `cairn-mcp-server` / `cairn-sessions`, the `cairn-ingest` CLI bin, and the MCP
  tool names (`gather`, `manifest`, `corpus_status`, `session_distill`, `distillate_dock`).
  All are cairn-scoped already; the generic verbs are namespaced under the `cairn` MCP
  server. Likely zero renames — just confirm against `[LAW own-your-namespace]`.

**Path realignment (already applied by HIVE, 2026-06-13):** HIVE's per-project federation
path was `<project>/agents/sessions/` (the old `agents/` umbrella). Since OWNERSHIP
supersedes that umbrella with `<project>/.cairn/`, the realigned per-project path is
**`<project>/.cairn/sessions/`**. Updated in `SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md`,
`…_02_CORPUS.md`, and `cairn-sessions/README.md`. The spark deploy spec's federation note
(`spark/specs/SPEC_CAIRN_SESSIONS_DEPLOY.md`) should pick up `.cairn/sessions/` if it ever
hardcodes the per-project path.

**Deliberately NOT in conflict:** OWNERSHIP §1 non-goal excludes cross-project shared
memory — which is exactly the `cairn-sessions` corpus. So `.cairn/memory/` (per-project,
OWNERSHIP) and the shared corpus (HIVE) are coherent, separate concerns. VERSION: OWNERSHIP
owns the cairn `0.14.0` bump; HIVE bumped `cairn-mcp-server` to `0.5.0` (separate repo). The
`HANDOFF.md` is the one place both efforts must both be represented at release.
