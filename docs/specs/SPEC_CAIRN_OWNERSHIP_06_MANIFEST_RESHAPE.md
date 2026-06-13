# SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 04, 05, 07, 11

## Goal
Reshape `manifest.json` so it describes `.cairn/` state dests and references packages for skills, retiring vendor-path variables.

## Scope
- State file dests → `{projectRoot}/.cairn/...` (CLAUDE.md, LAWS.md, memory tree).
- Drop the `userMemory` pathVariable entirely (incl. its later-added Pi sub-block).
- Skills: reference the distribution packages (cairn-claude plugin / cairn-pi npm) rather than per-skill curl dests — OR mark skills as package-delivered.
- Update `description`, `version` (target 0.14.0), and the `.agents`/`agents` notes (remove the false alignment text).
- Keep JSON valid; `{projectRoot}` resolves per-harness.

## Telemetry hook
N/A: markdown/JSON.

## Diagnostics path
`node -e "JSON.parse(...)"` validates; a grep confirms zero `userMemory`/vendor-dir dests remain.

## Rollback story
`git revert`; manifest is read at adopt-time only.

## Gate
`manifest.json` validates; no `userMemory`; state dests under `.cairn/`; skill entries reference packages; version bumped; the false `.agents/` alignment text is gone — `rg -n "v0.14-note|v0.14.0-aligned|\.agents/skills" manifest.json` returns zero (master §5 DoD#8).

## Files
`manifest.json`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE.md`. Read master §2.5 (path-variable semantics), §2.1; the 2026-06-13 revalidation flagged the stale `userMemory` line-span + the false `.agents/` alignment.
