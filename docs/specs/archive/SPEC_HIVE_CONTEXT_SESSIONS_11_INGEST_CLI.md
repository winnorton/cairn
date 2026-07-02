# SPEC_HIVE_CONTEXT_SESSIONS_11_INGEST_CLI — cairn-ingest CLI + Spark LLM distiller

> **Drafted:** 2026-06-13 by Claude Opus 4.8 (1M) · **Program:** [SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM](SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md)
> **Repo:** `cairn-mcp-server` (branch `feat/cairn-ingest-cli`) · **Production-status:** additive (v0.5.0 released; do not break tool signatures).
>
> **Why this exists:** the deploy spec `spark/specs/SPEC_CAIRN_SESSIONS_DEPLOY.md` (Prereq A)
> needs a runnable ingest contract. v0.5.0 has the *functions* but no CLI and **no LLM
> distiller** — and the distiller IS "the Spark LLM path." This spec builds both so the
> spark sidecar has something to run. The post-program operationalization workstream.

## Goal

A single `cairn-ingest` CLI entrypoint (`dist/cli/ingest.js`, wired as a `bin`) with three
subcommands that wrap existing functions plus one new piece — an LLM distiller that sends
a compressed session pre-digest to an OpenAI-compatible endpoint (the Spark coding lane)
and writes back a schema-valid `Finding`.

## Contract (what the spark deploy calls)

```
cairn-ingest gather  --corpus <dir> [--roots harness=path,...]
cairn-ingest distill --corpus <dir> --llm-base-url <url> [--model <name>] [--max <N>] [--temperature <t>]
cairn-ingest status  --corpus <dir>
```

- **gather** (deterministic, no LLM): discover candidates (roots overridable), `persistSession`
  each new one (normalize → redaction gate → write under `normalized/<harness>/<slug>/`,
  dedup on `content_hash`), regenerate `MANIFEST.md`. Print `{discovered, persisted,
  skipped_dup, errors, manifest_rows}` JSON.
- **distill** (the Spark LLM path): for each envelope under `normalized/**` lacking
  `findings/<id>.findings.json` (up to `--max`, default 25): distill via the LLM, write
  `findings/<id>.findings.json` + update `LEDGER.md`. Print `{distilled, skipped, failed}`.
- **status**: print `corpusStatus(corpus)` JSON (coverage, distilled ratio, ledger).

Env fallbacks: `CORPUS_ROOT`, `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `CAIRN_DISTILL_MODEL`.
Flags override env. `--llm-base-url` is OpenAI-compatible (`POST {base}/chat/completions`).

## §1 Refactors to existing code (additive, signatures preserved)

1. `gather.ts` — `discoverCandidates(roots?: Partial<Record<Harness,string>>)`: when `roots`
   is given, sweep those paths for the named harness(es) instead of the hardcoded defaults.
   No-arg call keeps current behavior (MCP `gather` tool unchanged).
2. `corpus_status.ts` — extract the scan logic from `register()` into an exported
   `corpusStatus(corpusRoot: string): CorpusStatus`; `register()` calls it. No tool change.

## §2 New: the LLM distiller — `src/distill/llm.ts`

`distillEnvelope(envelope, { corpusRoot, baseUrl, apiKey, model, temperature }): Promise<Finding>`

1. **Pre-digest** (compress — never send the raw envelope): counts by `role`/`type`, top
   tools, inflection points (`type:error`/`compaction` events, same-tool runs ≥4),
   user-message arc (all `role:user` text), redaction hits, duration, model, harness.
   Reuse `session_distill`'s analysis where practical.
2. `priorPatterns = loadPriorPatternNames(corpusRoot)` — match against, don't re-derive.
3. **Sample events** to a char budget (~40 KB): ALL user + error + compaction events;
   first/last ~8 assistant messages; tool-distribution summary. Never the full `events[]`.
4. **Prompt** — system = cairn's distillation lens (patterns recognized vs the seeded
   catalog; skill/law/memory candidates with the 3-instance gate; report-only stance —
   mirror `files/skills/session-distill/SKILL.md`). User = pre-digest + sampled events +
   `priorPatterns`. Demand STRICT JSON matching `finding.schema.json` (use
   `response_format: {type:'json_object'}` when the endpoint supports it).
5. `POST {baseUrl}/chat/completions` via global `fetch` (Node 24; no SDK dep), `temperature`
   default 0.2, sensible timeout. `Authorization: Bearer ${apiKey||'local'}`.
6. Parse JSON; **validate against `finding.schema.json`** (load `<corpus>/schema/finding.schema.json`,
   fallback to a bundled copy; ajv). On invalid/parse-fail, retry ONCE with a "return only
   valid JSON for this schema" nudge; then give up (count as `failed`, do not write garbage).
7. Stamp `session_id`, `harness`, `distilled_at` (ISO — findings may carry processing time;
   the ENVELOPE stays deterministic), `distiller: "cairn-ingest@<pkg version>"`.
8. `writeFindingsLedger(corpusRoot, id, harness, finding)`.

**Resilience:** LLM endpoint down / 5xx / timeout → log, count `failed`, continue. `distill`
must never corrupt the corpus or crash the run; `gather` is independent of the LLM.

## §3 CLI — `src/cli/ingest.ts` → `dist/cli/ingest.js`

Shebang `#!/usr/bin/env node`. Minimal arg parsing (no new dep — hand-roll or use an
already-present one). `package.json`: add `"bin": { "cairn-ingest": "dist/cli/ingest.js" }`
and ensure `tsc` emits `dist/cli/ingest.js` executable. Each subcommand prints a one-line
JSON summary and exits non-zero on hard failure (missing corpus, bad flags).

## §4 Definition of Done

1. `npm run build` clean; `dist/cli/ingest.js` exists with shebang.
2. `node dist/cli/ingest.js status --corpus <real cairn-sessions path>` prints coverage.
3. `gather --corpus <tmp copy> --roots claude-code=<docs/study_sessions>` persists a
   schema-valid **redacted** envelope and updates the manifest (dedup re-run = no-op).
4. `distill` end-to-end: against the live Spark lane if reachable
   (`http://spark-448f:8001/v1` or via `nuc-util`), else a mocked `fetch` returning a
   canned valid Finding — prove parse → validate → `writeFindingsLedger` → `LEDGER.md`.
   Report which path was exercised.
5. Existing MCP tool signatures unchanged (backward-compat grep/smoke).
6. A short `test/ingest_cli.mjs` covering gather (real) + distill (mock LLM).

## §5 Executor handoff

Read the master §2.1/§2.4 (envelope + finding schemas) and the WS 09 `findings_ledger.ts`
/ `session_distill.ts` first. The distiller's prompt should read like `/session-distill`'s
methodology, not a generic "summarize this." Do NOT add an LLM SDK — global `fetch` only.
Do NOT change existing tool signatures. The corpus `finding.schema.json` is the validation
source of truth.
