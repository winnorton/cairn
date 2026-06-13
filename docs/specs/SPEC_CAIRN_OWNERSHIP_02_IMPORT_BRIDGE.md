# SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 01, 12

## Goal
Specify the single user-written import line — the only edit cairn ever asks a user to make to a vendor-owned context file.

## Scope
- Claude Code: `@./.cairn/CLAUDE.md` appended to `<project>/CLAUDE.md`.
- Pi/agy: the `AGENTS.md` analog (auto-loaded), pointing at `./.cairn/CLAUDE.md`.
- The rule: the agent SHOWS the exact line; the USER adds it; cairn never `Write`/`Edit`s it (even where the sandbox would allow).
- Define the user-action Step text consumed by WS08 (adopt rewrite).
- Freeze as Contract §2.2.

## Telemetry hook
N/A: markdown framework.

## Diagnostics path
WS09's integrity check flags a *missing* import line (state present but unreferenced → silent habitat).

## Rollback story
N/A: the user owns the line; removing it is a one-line user edit.

## Gate
`adopt.md` presents the import line as a user-action Step; grep confirms the line never appears inside an agent write loop.

## Files
`adopt.md` (the user-action Step), `files/.cairn/CLAUDE.md` (header note referencing the import).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md`. Read master §2.2, §4 (hard contract) first.
