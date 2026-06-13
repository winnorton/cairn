# SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 02 · **Parallel-safe-with:** 05, 06, 07

## Goal
Package cairn's authoring/review/maintenance skills as a cairn-named **Claude Code plugin** the Claude installer places — no agent curl into `~/.claude/skills/`.

## Scope
- **Verify the Claude Code plugin format first** (`.claude-plugin/plugin.json`, marketplace.json, skills discovery) against a real install — do NOT assume.
- New `packages/cairn-claude/` with plugin manifest + `skills/` (byte-identical copies of `files/skills/`, synced per WS11).
- Decide which skills ship in the plugin vs stay source-only.
- Install path: `/plugin marketplace add` + `/plugin install` (confirm current Claude Code syntax).

## Telemetry hook
N/A: markdown.

## Diagnostics path
`/plugin` list shows the cairn plugin loaded; a smoke-invoke of one skill confirms.

## Rollback story
Pre-production package → `git revert`; uninstall via Claude's plugin manager.

## Gate
The `cairn` plugin installs in a real Claude Code session and its skills are invocable; tarball/contents are markdown-only.

## Files
`packages/cairn-claude/**` (manifest, README, synced `skills/`).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md`. Read master §2.3 (naming), §2.4 (single source of truth), and `packages/cairn-pi/` as the precedent.
