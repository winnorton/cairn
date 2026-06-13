# SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 01, 02

## Goal
Sweep every cairn artifact name for collision with a target harness's built-ins and resolve, enforcing `[LAW own-your-namespace]`.

## Scope
- Enumerate cairn skill names vs Claude Code built-ins (`/review` precedent), agy built-ins/slash commands, Pi `/skill:` space.
- Check folder names (`.cairn/` vs `.agents/`, `.claude/`), package names (`@winnorton/cairn-pi`, `cairn`), command names.
- Produce a collision report: each name → owned / collides / resolved-by-rename.
- Resolve collisions by rename (never coexistence); record in the report.
- Optional: a mechanical check (greppable list) so future skills get audited at add-time.

## Telemetry hook
N/A: audit artifact.

## Diagnostics path
The report IS the surface; a re-run shows zero unresolved collisions.

## Rollback story
`git revert` any rename; the audit report is additive.

## Gate
Zero unresolved collisions; renames applied + cited; `[LAW own-your-namespace]` cited in the closing commit.

## Files
a report (`docs/notes/` or `docs/specs/`), any renamed skill dirs/manifest entries, optional check script.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md`. Read master §4 (hard contract gate 4), `[LAW own-your-namespace]`, and the `/review`→`/peer-review` precedent.
