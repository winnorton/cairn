# SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Parallel-safe-with:** 02, 12

## Goal
Define and template the cairn-owned `<project>/.cairn/` state directory — the namespace that replaces every vendor-dir cairn write.

## Scope
- The §2.1 tree: `.cairn/{CLAUDE.md, LAWS.md, memory/{MEMORY.md, user/, feedback/, project/, reference/}, context/, cairn-version}`.
- Relocate the template tree from `files/{CLAUDE.md,LAWS.md,memory/}` → `files/.cairn/...` (mirrors the parked prototype's `files/agents/` move, but to `.cairn/`).
- Establish that ALL cairn state is git-tracked inside the adopter's repo; no `~/.*` or `.claude`/`.agents` write target.
- Freeze the layout as Contract §2.1 for Wave 1.

## Telemetry hook
N/A: markdown framework, no runtime telemetry.

## Diagnostics path
Defines (does not implement) the install-integrity check consumed by WS09: "does `.cairn/` exist with the required files?"

## Rollback story
Pre-production for the template itself → `git revert`. For adopters the dir is additive (`create-if-absent`), so no destructive change.

## Gate
A fresh `adopt` produces the §2.1 tree exactly; a CHECKPOINT grep confirms structure and that no file lands outside `<project>/.cairn/`.

## Files
`files/.cairn/**` (moved from `files/`), coordinate dests with WS06 (`manifest.json`).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md`. The elaborating session reads the master §2.1 (layout), §3 (resolved decisions), §9.3 (protocol) first.
