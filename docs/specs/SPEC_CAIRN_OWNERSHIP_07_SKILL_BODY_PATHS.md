# SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 05, 06

## Goal
Update every skill body that probes a vendor memory path so it probes `<project>/.cairn/memory/` instead.

## Scope
- **Programmatic enumeration** (not a frozen list): `rg -l "~/.claude/memory|~/.pi/agent/memory|\.claude/projects/.*memory|<slug>" files/skills/` → the affected set.
- Known candidates: `resume`, `reflect`, `note`, `session-distill`, `audit` (probe/cite memory locations).
- Rewrite probes to `.cairn/memory/`; preserve each skill's logic — only the *path* changes.
- Update the `/note`-vs-cross-session-memory framing where it asserts user-space vs repo (now both are repo-local under `.cairn/`).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`rg -c "~/.claude/memory" files/skills/` → 0 after the sweep (except deliberate migration-instruction text).

## Rollback story
`git revert`; skill bodies are independent files.

## Gate
Zero vendor-memory-path probes remain in `files/skills/`; affected skills reference `.cairn/memory/`; `rg` count proves it.

## Files
`files/skills/**/SKILL.md` (the `rg`-determined set).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS.md`. Read master §2.1; use programmatic counts per §9.3 rule 5 — do not hand-freeze the skill list.
