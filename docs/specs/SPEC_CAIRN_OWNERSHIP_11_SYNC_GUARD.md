# SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 03, 05, 07 · **Parallel-safe-with:** 06

## Goal
Generalize cairn-pi's `sync-skills.mjs` into a shared guard so every distribution package stays byte-synced from the one source of truth, wired to CI/`prepublishOnly`.

## Scope
- One source of truth: `files/skills/<name>/SKILL.md` (Contract §2.4).
- Sync + `--check` covering BOTH `packages/cairn-pi/` and `packages/cairn-claude/` (WS03).
- Enforce: byte-identity, frontmatter `description` ≤ 1024, `name` == dir, version-lockstep with `VERSION`, no orphaned copies (the checks already in cairn-pi's guard).
- Wire `--check` to `prepublishOnly` (npm) + a repo CI step (covers the plugin + sources).

## Telemetry hook
N/A: dev tooling, not shipped runtime.

## Diagnostics path
`npm run check` per package; corrupting one copy makes it red; CI surfaces drift on PR.

## Rollback story
`git revert`; the guard is dev-time only, never in a published tarball.

## Gate
`--check` green across all packages, wired to prepublish + CI; a planted drift/over-cap/orphan each fails the check.

## Files
shared `scripts/sync-skills.mjs` (or per-package), CI config, `packages/*/package.json` scripts.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD.md`. Read master §2.4, §8 (operational policy); `packages/cairn-pi/scripts/sync-skills.mjs` is the working precedent to generalize.
