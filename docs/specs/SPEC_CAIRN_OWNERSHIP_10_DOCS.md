# SPEC_CAIRN_OWNERSHIP_10_DOCS

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01–09 · **Parallel-safe-with:** 09 (Wave 2)

## Goal
Bring all human-facing docs into line with the `.cairn/` + package-distribution model and correct stale claims.

## Scope
- `README.md`: "What you get" → `.cairn/` + package install per harness; tiers/roles language.
- `AGENTS.md`: Layout, Current state, Design DNA → `.cairn/`; **fix env-roles** (Antigravity primary coding, Claude specs/reviews; Pi supported-not-primary); **remove the false `.agents/` alignment** lines.
- `HANDOFF.md`: v0.14.0 state, related paths.
- `docs/research/**`: update the four-layer-habitat descriptions that name vendor paths (`~/.claude/...`) to `.cairn/`.
- Keep the supersede breadcrumb to the old umbrella spec.

## Telemetry hook
N/A: markdown.

## Diagnostics path
`rg` for stale `~/.claude`/`.agents`-alignment/"Pi … primary executor" across docs → 0.

## Rollback story
`git revert`; docs are non-load-bearing for install.

## Gate
README/AGENTS/HANDOFF/research reflect `.cairn/` + packages + corrected env-roles; no false alignment text; grep clean.

## Files
`README.md`, `AGENTS.md`, `HANDOFF.md`, `docs/research/**`, root `CLAUDE.md` (skill count / pointers).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_10_DOCS.md`. Read master §1, §3, §5 DoD #8; the 2026-06-13 revalidation listed the specific stale AGENTS.md/manifest claims.
