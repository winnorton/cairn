# SPEC_HIVE_CONTEXT_SESSIONS_10_DOCS_HANDOFF

**Status:** STUB — `/spec --from` me to elaborate · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md) · **Depends on:** 01–09 settling · **Repo:** `cairn` (docs/skill) + `cairn-sessions` (schema docs) + CI · **Owns: Documentation + CI cross-cutting axes**

## Goal
Land the documentation, handoff artifacts, and CI gates that make the corpus discoverable, the schemas readable, and the safety gates enforced.

## Scope
- `cairn-sessions/README.md` finalized: layout, storage policy, federation, how to gather/ingest, redaction posture.
- Schema docs for `envelope` / `manifest-row` / `finding` (`schema/*.md` or README sections).
- Update the `/session-distill` skill body (`cairn/files/skills/session-distill/SKILL.md`) to reference the envelope + findings ledger, and reconcile the Pi-parser claim from WS 05.
- Update `cairn-mcp-server/README.md` tool table (add `gather`, `manifest`, `corpus_status`; document `distillate_dock`'s ledger write; document the envelope input branch).
- Note the corpus in `cairn/AGENTS.md` + `cairn/HANDOFF.md` (the Hive Context sessions thread).
- CI: schema-validation over `normalized/**` + `findings/**`; manifest row-count check; redaction planted-secret test; pre-commit redaction hook install; MCP signature backward-compat smoke (DoD #3/#4/#5/#7/#9).

## Telemetry hook
N/A: docs + CI. CI gate pass/fail is the observable signal.

## Diagnostics path
CI logs are the diagnostic surface; `npm run validate-corpus` runs the full gate locally.

## Rollback story
Docs/CI are additive; rollback = `git revert`. Loosening a CI gate is discouraged (it's the DoD enforcement).

## Gate
All §5 DoD doc + CI rows green: corpus README + schema docs present; `/session-distill` skill + MCP README updated; AGENTS.md/HANDOFF note the corpus; CI runs schema-validation + redaction + signature smoke and passes.

## Files
`cairn-sessions/README.md`, `cairn-sessions/schema/*.md`, `cairn/files/skills/session-distill/SKILL.md`, `cairn-mcp-server/README.md`, `cairn/AGENTS.md`, `cairn/HANDOFF.md`, CI config (e.g. `.github/workflows/*` or `package.json` scripts) across the relevant repos.

---

Phases, steps, pre-flight, post-flight, executor handoff: **TO BE ELABORATED** via `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_10_DOCS_HANDOFF.md`. The elaborating session reads the master at §5 (DoD — most rows close here), §8 (operational/CI policy), and this workstream entry. This is the closure workstream; doc stubs may begin earlier but CI gates need the upstream deliverables present.
