# SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) · **Depends on:** 01, 04, 05, 06, 08 · **Parallel-safe-with:** 10 (Wave 2)

## Goal
Give v0.13.x adopters a user-driven, **non-destructive** migration to the `.cairn/` model plus a cleanup of stale vendor-folder skill residue, and a lightweight install-integrity check.

## Scope
- **Migration is copy-then-verify-then-optionally-delete — never `move` (N1 blocker).** Explicit ordered phases the agent SHOWS and the user RUNS:
  1. **Copy** `~/.claude/memory/<slug>/*` + `<project>/.claude/LAWS.md` + the `cairn-version` marker → `<project>/.cairn/...` (originals untouched).
  2. **Verify** each copy is present and non-empty (byte-count/hash).
  3. **Show** the user the verification result.
  4. **Optionally delete** originals as a *separate*, explicitly user-confirmed step. No destructive default; a half-finished migration leaves the v0.13.x state intact.
- **Every vendor-path string written into `adopt.md`'s migration text carries the `<!-- migration-ref -->` sentinel** (master §4) so DoD#1's grep excludes it. WS09 is the sole owner of that sentinel's application.
- **Residue cleanup is gated on the replacement being live (N2 blocker).** Remove the Pi `404: Not Found` bodies (`~/.pi/agent/skills/{program,round-review}`) and the agy flat-format + legacy `review/` ONLY after confirming the package-delivered replacement is installed and loadable, **gated per-harness**: `@winnorton/cairn-pi` for the Pi residue; the `cairn` Claude plugin for the Claude residue; the `cairn` plugin **imported + loadable in agy** via `agy plugin import claude` (WS04) before removing the `~/.gemini/config/skills/` residue. Hence the deps on WS05 (Pi model) and WS04 (agy import). Pre-flight each residue path: if absent, skip and report "not found" — never fail the migration.
- **agy residue paths are distinct and both stated** (avoids the wrong-dir no-op): agy *skills* live under `~/.gemini/config/skills/` (binary-verified 2026-06-13, see `docs/notes/NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md`); agy/Antigravity-IDE *memory* under `~/.gemini/antigravity/`. The skills-residue cleanup targets `config/skills/`.
- **Cowork adopters:** memory is file-tool-only and deletion is unsupported — use index tombstoning (remove from `MEMORY.md` index; mark orphaned-but-present), not file removal; laws migration uses the shell fallback per `adopt.md` Step 3. Mirror the existing `adopt.md` Cowork notes.
- **Import line is a mandatory migration step (not just fresh-install).** Migration concludes with the WS02 user-action: show `@./.cairn/CLAUDE.md` (or the AGENTS.md analog) and require the user to add it. The integrity check **fails** (not warns) if the import line is absent — without it the migrated habitat is silently non-functional.
- **cairn-version fast-path coordination:** the marker moves `<project>/.claude/cairn-version` → `<project>/.cairn/cairn-version`. WS08 must update `adopt.md`'s Step 2 fast-path to read `{projectRoot}/.cairn/cairn-version`; WS09's migration retires the old `<project>/.claude/cairn-version` so a stale marker can't trigger a false fresh-install on re-adoption.
- **Install-integrity check (implements the diagnostic WS01 defines, N5):** `.cairn/` exists + required files present + import line present in the context file → report health.

## Telemetry hook
N/A: markdown framework.

## Diagnostics path
This workstream IS the diagnostics surface — the install-integrity check above.

## Rollback story
Copy-then-verify, dry-run-first; originals retained until the user runs the separate delete step; no destructive default.

## Gate
Migration covers all v0.13.x paths (Claude Code + Cowork), is copy-then-verify (non-destructive), gates residue removal on replacement-installed, requires the import line, retires the old marker, and passes a smoke test against a **committed** fixture.

## Files
`adopt.md` (migration section, with `<!-- migration-ref -->` sentinels), `test/fixtures/v0.13.x/` (committed canonical fixture: `<project>/.claude/{LAWS.md,cairn-version}`, `~/.claude/memory/<slug>/MEMORY.md` + ≥1 typed entry, ≥1 `~/.claude/skills/<name>/SKILL.md`), optional `scripts/` (dry-run helper / integrity check).

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md`. Read master §3 (migration = user-driven), §4 (migration-ref sentinel), §5 DoD#5, §6 risk row 5, and WS01 (the integrity-check definition this WS implements). The fixture must be representative, not minimal, or the smoke test passes vacuously.
