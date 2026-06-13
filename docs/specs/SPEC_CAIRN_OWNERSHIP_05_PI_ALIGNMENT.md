# SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01 · **Parallel-safe-with:** 03, 04, 06, 07

## Goal
Align the already-shipped `@winnorton/cairn-pi` npm package with the `.cairn/` state model so Pi reads cairn state from `<project>/.cairn/`, not a vendor memory path.

## Scope
- Update cairn-pi README + any skill-path references to point Pi at `<project>/.cairn/memory/` (was `~/.pi/agent/memory` / slug paths).
- Keep npm as Pi's distribution channel (different ecosystem from the Claude plugin).
- Version bump in lockstep with `VERSION` (per the sync guard, WS11).
- Confirm the six bundled skills still byte-match source after WS07's path edits.

## Telemetry hook
N/A: markdown.

## Diagnostics path
`npm run check` green; `pi install` + `/skill:` list smoke test.

## Rollback story
npm package is additive; prior version remains installable; `git revert` the repo changes.

## Gate
cairn-pi documents `.cairn/` state, `sync --check` green, lockstep version correct, smoke install passes.

## Files
`packages/cairn-pi/**` (README, skills copies via sync, package.json version).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT.md`. Read master §2.4, and [SPEC_CAIRN_PI_PACKAGE](archive/SPEC_CAIRN_PI_PACKAGE.md) (archived) for the package's shape.
