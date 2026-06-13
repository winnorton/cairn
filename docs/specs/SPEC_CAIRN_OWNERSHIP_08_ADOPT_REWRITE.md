# SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 02, 03, 06 · **Parallel-safe-with:** — (Wave 2)

## Goal
Rewrite `adopt.md` so the install path performs **zero agent writes to vendor-owned config/skill dirs** — package-install + `.cairn/` state + a user-added import line.

## Scope
- New flow per harness: Claude → install `cairn` plugin (WS03); Pi → `pi install npm:@winnorton/cairn-pi`; agy → `agy plugin import claude` (WS04).
- State: agent writes `.cairn/**` (the only writes), fetched/validated per the WS-era `curl -sfL` + content-check already in adopt.
- The user-action Step (WS02): show the import line; user adds it.
- Remove the curl-into-`~/.claude/skills` / `.claude/LAWS.md` / vendor-memory loop entirely.
- Preserve the ephemeral-sandbox + don't-clone + don't-adopt-into-cairn pre-flights.

## Telemetry hook
N/A: markdown.

## Diagnostics path
Walk Step 1→end; grep that no step writes a vendor path; the install-integrity check (WS09) confirms a real install.

## Rollback story
`git revert`; `adopt.md` is fetched fresh per adoption (not a user-maintained file).

## Gate
`adopt.md` has zero vendor-dir write targets; skills come via package install; the import line is a user Step; pre-flights intact.

## Files
`adopt.md`.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE.md`. Read master §4 (hard contract — the forbidden write targets), §2.2 (import line), §1 deliverable 4.
