# SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 03 · **Parallel-safe-with:** 05, 06, 07

## Goal
Serve Antigravity (agy) cairn skills by `agy plugin import claude` of the WS03 plugin — build once, serve two harnesses — with state via `AGENTS.md` → `.cairn/`.

## Scope
- Empirically validate `agy plugin import claude` ingests the `cairn` Claude plugin (agy 1.0.7+); record evidence.
- Confirm GitHub-subpath install as the alternative (`agy plugin install` from repo subpath, branch-resolved).
- Reserve `cairn-agy` as a native-plugin fallback only if import-claude proves lossy.
- agy reads `.cairn/` state via the `AGENTS.md` import line (WS02).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`agy plugin list` shows the imported cairn plugin; `/skill:` namespace lists cairn skills.

## Rollback story
`agy plugin uninstall`; clean per the 2026-06-13 probe (verified clean round-trip).

## Gate
agy ingests the cairn plugin via `import claude`; cairn skills are listed/invocable in an agy session; the path is documented in `adopt.md`.

## Files
`adopt.md` (agy branch), validation note under `docs/notes/`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md`. Read `[MEM ...]`/the agy assessment note `docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md` (binary-verified facts) first.
