# SPEC_HIVE_CONTEXT_SESSIONS_02_CORPUS

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** none (foundational, Wave 0) · **Repo:** `cairn-sessions`

## Goal
Turn the bare `cairn-sessions/` folder into a structured, git-tracked corpus with a defined layout, storage policy, and per-project↔shared federation model.

## Scope
- `git init` the `cairn-sessions` repo; first commit lays down the master §2.2 layout (`normalized/`, `findings/`, `schema/`, `MANIFEST.md` placeholder, `README.md`).
- `.gitignore` raw globs (`raw/`, `*.jsonl`, `*.pb`, `*.raw`) — raw stays OUT of git per locked storage model.
- Move the existing stray 9 MB `748aff00…jsonl` into a gitignored `raw/` (or out entirely) — it is NOT committed.
- Define the federation model: per-project `<project>/agents/sessions/` layout + the dedup-on-`id`+`content_hash` sync contract with the shared repo (v1 = scripted/manual; daemon deferred D2).
- Document the storage policy + visibility/privacy posture in `README.md`.

## Telemetry hook
N/A: corpus structure is static. Coverage counts are surfaced by WS 08's manifest.

## Diagnostics path
`git status` + a layout-presence check (all required dirs + schema files present). A dedup check (no two committed envelopes share an `id`) is contributed to CI by WS 08.

## Rollback story
Greenfield repo; rollback = `git revert` or re-init. No production consumers.

## Gate
`cairn-sessions` is a git repo; the §2.2 directory tree exists; `.gitignore` excludes raw globs; the stray raw session is not tracked; `README.md` documents layout + storage + federation.

## Files
`cairn-sessions/README.md`, `cairn-sessions/.gitignore`, the directory skeleton (`normalized/`, `findings/`, `schema/`), `MANIFEST.md` placeholder. Federation doc section in README. (Schema files themselves come from WS 01/08/09.)

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_02_CORPUS.md`. The elaborating session reads the master at §2.2 (layout), §3 (storage + federation decisions), §7 (why this shape), and this workstream entry before drafting.
