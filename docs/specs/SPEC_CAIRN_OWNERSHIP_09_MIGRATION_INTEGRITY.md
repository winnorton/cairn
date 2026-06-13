# SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 06, 08 · **Parallel-safe-with:** 10 (Wave 2)

## Goal
Give v0.13.x adopters a user-driven migration to the `.cairn/` model plus a cleanup of stale vendor-folder skill residue, and a lightweight install-integrity check.

## Scope
- Migration steps (user runs, agent shows): move `~/.claude/memory/<slug>/*` + `<project>/.claude/LAWS.md` + `cairn-version` → `<project>/.cairn/...`.
- Residue cleanup: remove the Pi `404: Not Found` skill bodies (`~/.pi/agent/skills/{program,round-review}`) and agy flat-format + legacy `review/` in `~/.gemini/config/skills/` (both found 2026-06-13).
- Install-integrity check (defines WS01's diagnostic): `.cairn/` exists + required files present + import line present in the context file → report health.
- A fixture v0.13.x install to smoke-test the migration text against.
- All user-driven (ownership boundary): agent displays, user executes.

## Telemetry hook
N/A: markdown.

## Diagnostics path
This workstream IS the diagnostics surface — the integrity check.

## Rollback story
Migration is copy-then-verify, dry-run-first; originals stay until the user confirms; no destructive default.

## Gate
Migration section covers all v0.13.x paths + residue cleanup, is user-driven, and passes a fixture smoke test; integrity check runs.

## Files
`adopt.md` (migration section), optional `scripts/` (dry-run helper / integrity check).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md`. Read master §3 (migration = user-driven), §5 DoD #5, and the residue evidence in the agy + Pi notes.
