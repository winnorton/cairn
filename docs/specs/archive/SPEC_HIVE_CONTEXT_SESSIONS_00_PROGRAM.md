# SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM

> **Program master.** Cross-harness session ingestion + learning corpus — the "Hive
> Context" for sessions. Drafted 2026-06-13 by Claude Opus 4.8 (1M). Cold-started via
> `/program`. Gate A (axes) signed off 2026-06-13.
>
> **Production-status:** pre-production for the corpus + ingestion path (`cairn-sessions/`
> is greenfield, zero users, not yet git-init'd); **additive/backward-compatible** for
> `cairn-mcp-server` (v0.4.0 is a released artifact — existing tool signatures must not
> break).
>
> **Spans three repos:** `cairn/` (framework: `/session-distill` skill, docs, AGENTS.md),
> `cairn-mcp-server/` (code: envelope, adapters, redaction, learning tools),
> `cairn-sessions/` (the corpus). Planning artifacts (this master + stubs) live in
> `cairn/docs/specs/`. Worktree isolation is **per-repo** (see §8).
>
> **Revision history:** Drafted 2026-06-13 (program form, cold-start). Pending Gate B
> peer-review.

---

## §0 LEAD FINDING

**cairn can ingest sessions from only 1 of its 3 target harnesses, has no structured
corpus, and distillation findings do not accumulate — so learning from sessions does not
compound.**

| Evidence | Detail |
|---|---|
| Corpus is a junk drawer | `cairn-sessions/` is a bare folder, **not git-init'd**, holding one raw 9 MB Claude Code session. No layout, manifest, redaction gate, or findings store. |
| Ingestion is Claude-Code-only | `cairn-mcp-server` `session_distill` parses Claude Code `.jsonl`; **Antigravity `.pb` returns a "deferred note"** (unsupported); **Pi** is not referenced by the MCP transcript parser (the `/session-distill` markdown skill *claims* Pi auto-detect — an unverified discrepancy). Net: 1 of 3 harnesses actually ingestable. |
| Zero cross-harness samples | Both corpus samples are Claude Code (`cairn_origin` 9 MB / 2287 lines, `fable_first` 8.8 MB / 3444 lines). Zero Pi, zero Antigravity. |
| Findings evaporate | Distillation output lands in a one-off `/note` or a skill edit. There is no findings ledger, so distillation N+1 re-derives what N already found. The compounding-value thesis is unrealized. |
| Redaction is manual | The origin session's GitHub PAT sat in the transcript ~6 weeks before discovery; it was scrubbed by hand-`sed` (`[LAW credentials-never-in-transcript]`). At corpus scale there is **no systematic scrubber gate.** |

**What this program replaces:** ad-hoc, hand-dropped, Claude-Code-only transcripts → a
cross-harness pipeline (`gather → redact → normalize → land → index → distill →
accumulate`) feeding a structured, federated corpus, so the learning tools already built
in `cairn-mcp-server` work across all three harnesses and findings compound across
sessions.

External validation for the shape: Shopify's "Under the River" (the Aquifer substrate —
public, searchable, shared session corpus) and Yegge's "Anthropic Hive Mind"
(transparency-as-substrate) both argue the value is the shared, queryable session
substrate, not the agent. This program builds cairn's markdown-and-git version of that
substrate.

## §1 PROGRAM GOAL

**Deliverables (concrete):**

1. A **canonical session envelope** schema (`envelope.schema.json`) that all three
   harness formats normalize into and all learning tools consume.
2. A **structured, git-tracked `cairn-sessions` corpus** — `normalized/`, `manifest/`,
   `findings/`, `schema/` — with raw transcripts kept OUT of git (reproducible from the
   source harness).
3. A **federation model**: per-project `<project>/.cairn/sessions/` ↔ the shared
   `cairn-sessions` repo, deduped by session id + content hash. (Per-project path
   realigned from `agents/sessions/` to `.cairn/sessions/` per SPEC_CAIRN_OWNERSHIP /
   `[LAW own-your-namespace]` — the `agents/` umbrella was superseded by `.cairn/`.)
4. A **redaction safety gate** — systematic secret-scrubber run inside normalization AND
   as a corpus pre-commit hook. Nothing un-scrubbed lands.
5. **Three working adapters** — Claude Code, Pi, Antigravity (`.pb`) — each emitting the
   canonical envelope, proven by one committed redacted sample per harness.
6. **`gather` + `MANIFEST`** — discovery across the three harness locations and an
   auto-generated one-row-per-session index.
7. **Learning-tools cutover + findings ledger** — `session_distill` / `overclaim_check` /
   `lesson_replay` / `namespace_audit` read envelopes; `distillate_dock` writes
   accumulating findings; a corpus-status diagnostic; existing tool signatures unchanged.
8. **Docs, handoff, CI** — corpus README, schema docs, `/session-distill` skill update,
   AGENTS.md/HANDOFF, schema-validation + redaction CI gates.

**Non-goals:**

- A query/search UI beyond grep + the MANIFEST (deferred — see §3 D3).
- Automated federation daemon (v1 federation is scripted/manual — §3 D2).
- Migrating cairn's typed *memory* into the corpus (separate v0.14 thread).
- Replacing any existing `cairn-mcp-server` tool — all work is additive.
- Real-time / streaming ingestion. Ingestion is batch, post-session.

## §2 CONTRACT SURFACES

The load-bearing cross-child contracts. Wave 0 freezes these before adapters fan out.
Every contract here is owned by a Wave-0 workstream and cited by downstream children.

### 2.1 Canonical session envelope (owned by WS 01)

One JSON document per session at `normalized/<harness>/<project_slug>/<id>.envelope.json`:

```jsonc
{
  "schema_version": "1.0",
  "content_hash": "<sha256 of the raw input — idempotence key>",
  "session": {
    "id": "<uuid>",
    "harness": "claude-code | pi | antigravity",
    "harness_version": "<string|null>",
    "model": "<string|null>",
    "provider": "<string|null>",
    "project_slug": "<slug>",
    "cwd": "<path|null>",
    "started_at": "<iso8601|null>",
    "ended_at": "<iso8601|null>",
    "redaction": { "scrubbed": true, "rules_version": "<string>", "hits": 0 }
  },
  "events": [
    {
      "seq": 0,
      "ts": "<iso8601|null>",
      "role": "user | assistant | tool | system",
      "type": "message | tool_call | tool_result | error | compaction | model_change",
      "text": "<string|null>",
      "tool": { "name": "<string>", "args_digest": "<hash|null>",
                "duration_ms": null, "is_error": false },
      "stop_reason": "<string|null>",
      "tokens": { "in": null, "out": null }
    }
  ]
}
```

**Invariants:** (a) deterministic — identical raw input yields a byte-identical envelope
(modulo nothing; no timestamps-of-processing inside); (b) `content_hash` is the
idempotence key — re-ingesting the same raw is a no-op; (c) `redaction.scrubbed == true`
is a precondition for persistence (WS 03 gate); (d) lossy-but-sufficient — the envelope
need not round-trip to raw, but MUST preserve everything the learning tools read (tool
names, roles, text, errors, compactions, stop reasons, token counts when present).

### 2.2 Corpus layout + storage policy (owned by WS 02)

```
cairn-sessions/                       # git repo
  README.md
  MANIFEST.md                         # human-readable index (WS 08)
  schema/
    envelope.schema.json              # §2.1 (WS 01)
    manifest-row.schema.json          # §2.3 (WS 08)
    finding.schema.json               # §2.4 (WS 09)
  normalized/<harness>/<project_slug>/<id>.envelope.json
  findings/
    <id>.findings.json                # accumulating distillation output (WS 09)
    LEDGER.md                         # human-readable rollup (WS 09)
  .gitignore                          # raw/, *.jsonl, *.pb, *.raw
```

**Storage policy (LOCKED §3):** committed = normalized envelopes + manifest + findings +
schema. NOT committed = raw transcripts (gitignored; reproducible from source harness;
LFS is an option but not v1-required since normalized ≪ raw).

### 2.3 Manifest row schema (owned by WS 08)

One row per session: `id | harness | project_slug | model | started_at | event_count |
tool_call_count | distilled (bool) | findings_ref | redaction_hits`. `MANIFEST.md`
renders these as a markdown table; `manifest-row.schema.json` is the machine form.

### 2.4 Finding schema (owned by WS 09)

```jsonc
{
  "session_id": "<uuid>",
  "distilled_at": "<iso8601>",
  "distiller": "<tool|skill>@<version>",
  "patterns": [ { "name": "<catalog-name|new>", "instance_count": 1, "evidence": "<L-range or seq-range>" } ],
  "candidates": { "skills": [], "laws": [], "memory": [] },
  "links": { "note": "<path|null>", "commit": "<hash|null>" }
}
```

The findings ledger is what makes learning compound: distillation N+1 reads prior
`findings/*.json` before analyzing, matching against the seeded catalog in
`/session-distill` so patterns are recognized, not re-invented.

### 2.5 Adapter interface (owned by WS 01; implemented by WS 04/05/06)

`normalize(rawPath: string) → Envelope` — a pure, deterministic, network-free function
in `cairn-mcp-server/src/adapters/<harness>.ts`. A registry detects harness by
format-signature (first-N-line envelope shape for JSONL; magic bytes / path for `.pb`)
and dispatches. Refactor the existing `src/helpers/transcript.ts` parsing into the Claude
Code adapter rather than duplicating it.

### 2.6 Redaction interface (owned by WS 03)

`scrub(input: string | Envelope) → { clean, hits, rules_version }` — secret-shape
detection (GitHub PAT `github_pat_…` / `ghp_…`, AWS `AKIA…`, OpenAI `sk-…`, bearer
tokens, PEM private-key blocks, generic high-entropy `KEY=`/`TOKEN=` assignments). Runs
(a) inside normalization before the envelope is persisted, and (b) as a corpus
pre-commit hook (defense in depth). `[LAW credentials-never-in-transcript]`.

## §3 RESOLVED DESIGN DECISIONS (no deferrals)

| Decision | Resolution | Rationale |
|---|---|---|
| Corpus home | **BOTH** per-project `<project>/.cairn/sessions/` AND shared `cairn-sessions` repo, federated | User-locked. Per-project keeps a session near its work; the shared repo is the cross-project, cross-harness hive (the "multiplayer substrate"). Per-project path realigned `agents/sessions/`→`.cairn/sessions/` per SPEC_CAIRN_OWNERSHIP. |
| Storage model | Normalized + manifest + findings in git; **raw OUT** (gitignored, reproducible) | User-locked. Raw is 9 MB+/session; normalized is ≪ that. Keeps clones lean; raw recoverable from source harness. |
| Harness coverage | **All three at once** — Claude Code, Pi, Antigravity `.pb` | User-locked. Cross-harness is the whole point; fixtures (WS 07) force one real sample per harness. |
| Envelope format | Single JSON doc per session (`<id>.envelope.json`), `schema_version`'d, `events[]` array | Easier for tools to consume than streaming JSONL; compact; schema-validatable in CI. |
| Idempotence | `content_hash` (sha256 of raw) stored in envelope; re-ingest is a no-op | Determinism sub-clause of §4; lets `gather` re-run safely. |
| Adapter location | `cairn-mcp-server/src/adapters/`; refactor `transcript.ts` into the CC adapter | Transcript parsing already lives in the MCP server (sanctioned code zone); avoids a second parser. |
| Redaction enforcement | Two layers: in-normalization scrub + corpus pre-commit hook | Gate, not cleanup. A single layer fails open if someone commits by hand. `[LAW credentials-never-in-transcript]`. |
| MCP backward-compat | Additive only — existing `session_distill` signature unchanged; envelope path is a new input branch | v0.4.0 is released; other sessions may already call these tools. |
| Federation mechanism (v1) | Scripted/manual sync keyed on `id`+`content_hash` dedup | Avoids building a daemon before multi-project usage is real (see D2). |
| Pi-parser discrepancy | WS 05 verifies whether the MCP parser handles Pi; if not, builds it; reconciles the markdown skill's claim | Resolves the §0 unverified-discrepancy evidence row. |

**Deferrals (3 of ≤5 budget — each with a named WHEN and a stub at fan-out):**

| # | Deferred | WHEN | Stub |
|---|---|---|---|
| D1 | Antigravity **full-fidelity** protobuf decode. If the `.pb` schema can't be cleanly reversed in WS 06, ship best-effort text/event extraction now; structured decode follows. | After the WS 06 spike result | `SPEC_HIVE_CONTEXT_SESSIONS_06b_ANTIGRAVITY_FULL_DECODE.md` (drafted only if the spike falls back) |
| D2 | Automated federation (sync daemon / auto-push per-project → shared) | v0.15.x, at first real multi-project corpus contention | Draft at that fan-out |
| D3 | Cross-harness query/search beyond grep + MANIFEST (a "hive query" surface, possibly the MCP console) | After the corpus holds ≥20 sessions across ≥2 harnesses | Draft at that fan-out |

*Executors do NOT need to revisit any of the resolved rows above.*

## §4 HARD CONTRACT (Privacy/Security + Determinism)

**Privacy/Security — the load-bearing contract.** No raw secret or private credential
ever lands in a committed corpus artifact. Redaction is a **gate, not a cleanup**:
- Normalization MUST refuse to persist an envelope unless `redaction.scrubbed == true`.
- The corpus repo MUST carry a pre-commit hook that blocks any staged file containing a
  known secret shape, including hand-added files that bypass normalization.
- A planted-secret test fixture MUST prove 100 % catch on the known-shape set; misses are
  release-blocking, not warnings.
- This is `[LAW credentials-never-in-transcript]` operationalized at corpus scale.

**Determinism sub-clause.** Normalization is a pure function of raw input: identical raw →
byte-identical envelope. No processing timestamps, no machine-specific paths, no random
ordering inside the envelope. `content_hash` is the idempotence key.

## §5 DEFINITION OF DONE

Program is done (reviewable as a whole) when:

1. `cairn-sessions/` is a git repo with the §2.2 layout; `schema/envelope.schema.json`
   exists and validates.
2. **One redacted normalized envelope per harness** is committed (Claude Code, Pi,
   Antigravity) — `ls normalized/*/*/*.envelope.json` shows ≥3 across ≥3 harness dirs.
3. A CI step validates every committed envelope against `envelope.schema.json`
   (`npm run validate-corpus` or equivalent) and passes.
4. Redaction: a planted-secret fixture is caught 100 %; the pre-commit hook blocks an
   un-scrubbed staged file (demonstrated in a test).
5. `MANIFEST.md` is auto-generated; row count == committed envelope count.
6. `session_distill` (MCP) consumes an envelope and writes a `findings/<id>.findings.json`
   conforming to `finding.schema.json`; `LEDGER.md` is updated.
7. Existing `cairn-mcp-server` tool signatures are unchanged — a backward-compat smoke
   test / signature grep passes.
8. Docs landed: `cairn-sessions/README.md`, schema docs, `/session-distill` skill body
   updated to reference the envelope + ledger, AGENTS.md + HANDOFF note the corpus.
9. CI wires schema-validation + the redaction pre-commit hook.

## §6 RISKS

| Risk | Severity | Mitigation | Child |
|---|---|---|---|
| Antigravity `.pb` schema can't be cleanly reversed | High | Best-effort text/event extraction fallback (D1); spike-first before committing to full decode | WS 06 |
| A secret slips into a committed envelope | Critical | Two-layer redaction gate + planted-secret test + pre-commit hook | WS 03 |
| Envelope schema churns after adapters are built | High | Freeze §2.1 in Wave 0 before adapters fan out; schema_version'd for later evolution | WS 01 |
| MCP cutover breaks an existing tool signature | High | Additive-only rule; backward-compat smoke test in DoD #7 | WS 09 |
| Raw transcripts accidentally committed (bloat / secrets) | Medium | `.gitignore` raw globs + pre-commit hook (double duty) | WS 02 + WS 03 |
| Federation dedup misses → duplicate sessions in shared repo | Medium | Dedup on `id`+`content_hash`; manifest uniqueness check in CI | WS 08 |
| Pi-parser discrepancy hides a half-working path | Medium | WS 05 verifies the MCP parser empirically before building | WS 05 |
| Corpus has no Pi/Antigravity samples to build against | Medium | WS 07 fixtures are the forcing function; capture real samples first | WS 07 |

No homeless risks.

## §7 WHY THIS SHAPE

- **Envelope-as-contract** decouples the N harness formats from the M learning tools:
  adapters fan out in parallel, tools change once. Without it, every tool would need to
  know three dialects (the current CC-only trap).
- **Code lives in `cairn-mcp-server`, not cairn** — transcript parsing already lives
  there; it's the sanctioned code zone (same exception class as the feedback endpoint).
  cairn stays markdown.
- **Raw out of git** because normalized ≪ raw and raw carries the highest secret risk;
  keeping it out shrinks both the bloat and the attack surface.
- **Redaction as a gate** because `[LAW credentials-never-in-transcript]` was paid in a
  real incident; a cleanup step that runs "later" is how the PAT survived six weeks.
- **Findings ledger** because the entire premise ("learning compounds") is false without a
  place findings accumulate; a one-off `/note` is write-only memory.
- **Federation = per-project + shared** mirrors cairn's existing dual-scope memory model
  and the articles' "multiplayer by construction" — sessions live near their work AND in
  the hive.

## §8 OPERATIONAL POLICY

- **Per-repo worktree isolation.** The program spans three repos; a worktree isolates
  within one repo. Group: MCP-server work (WS 01, 03, 04, 05, 06, 09) → worktrees in
  `cairn-mcp-server`; corpus work (WS 02, 07, 08) → worktrees in `cairn-sessions`;
  framework/docs (WS 10) → `cairn`. Parallel agents never share a worktree.
- **Contracts freeze before fan-out.** Wave 0 (WS 01, 02, 03) publishes §2.1/§2.2/§2.6 and
  must be reviewable before Wave 1 adapters start coding against them.
- **Per-workstream loop:** `/spec --from <stub>` → code → cold `/peer-review` (fresh agent,
  not the author) → revise → re-review until sign-off → integrate serialized through main.
- **CI gates (WS 10 wires, others contribute):** envelope schema-validation; manifest
  row-count == envelope-count; redaction planted-secret test; pre-commit redaction hook;
  MCP signature backward-compat smoke.
- **Schema evolution:** `schema_version` is bumped on any breaking envelope change; the
  validator pins the current version; old envelopes are re-normalized, not hand-edited.
- **Counts are programmatic** — cite `rg`/`ls` counts (e.g. envelope count), never frozen
  numbers, in status reports.

## §9 PARALLELIZATION GRAPH + STATUS TABLE

```
Wave 0 (foundation / contract-freeze)
  01 ENVELOPE ───────┐
  02 CORPUS ─────────┤ (02 git-inits cairn-sessions; gates anything that commits there)
  03 REDACTION ──────┘
        │
        ▼
Wave 1 (adapters + fixtures — parallel against frozen contracts)
  04 ADAPTER_CLAUDE_CODE   (needs 01)
  05 ADAPTER_PI            (needs 01)
  06 ADAPTER_ANTIGRAVITY   (needs 01)   ← riskiest; spike-first
  07 FIXTURES              (needs 02, 03, and 04/05/06 to emit normalized samples)
        │
        ▼
Wave 2 (integration / closure)
  08 GATHER_MANIFEST       (needs 01, 02, ≥1 adapter)
  09 LEARNING_LEDGER       (needs 01, 02, adapters)
  10 DOCS_HANDOFF          (needs all settling; doc stubs can start anytime)
```

| Phase | Spec | Status | Owner | Depends on |
|---|---|---|---|---|
| 01 | [SPEC_HIVE_CONTEXT_SESSIONS_01_ENVELOPE.md](SPEC_HIVE_CONTEXT_SESSIONS_01_ENVELOPE.md) | ✅ COMPLETE | sonnet (mcp `7117763`) | (foundational) |
| 02 | [SPEC_HIVE_CONTEXT_SESSIONS_02_CORPUS.md](SPEC_HIVE_CONTEXT_SESSIONS_02_CORPUS.md) | ✅ COMPLETE | sonnet (sessions `f99e38a`) | (foundational) |
| 03 | [SPEC_HIVE_CONTEXT_SESSIONS_03_REDACTION.md](SPEC_HIVE_CONTEXT_SESSIONS_03_REDACTION.md) | ✅ COMPLETE | sonnet (mcp `7117763`) | (foundational) |
| 04 | [SPEC_HIVE_CONTEXT_SESSIONS_04_ADAPTER_CLAUDE_CODE.md](SPEC_HIVE_CONTEXT_SESSIONS_04_ADAPTER_CLAUDE_CODE.md) | ✅ COMPLETE | sonnet (mcp `7cc5bd4`) | 01 |
| 05 | [SPEC_HIVE_CONTEXT_SESSIONS_05_ADAPTER_PI.md](SPEC_HIVE_CONTEXT_SESSIONS_05_ADAPTER_PI.md) | ✅ COMPLETE | sonnet (mcp `7cc5bd4`) | 01 |
| 06 | [SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY.md](SPEC_HIVE_CONTEXT_SESSIONS_06_ADAPTER_ANTIGRAVITY.md) | ✅ COMPLETE (best-effort, 06b deferred) | sonnet (mcp `7cc5bd4`) | 01 |
| 07 | [SPEC_HIVE_CONTEXT_SESSIONS_07_FIXTURES.md](SPEC_HIVE_CONTEXT_SESSIONS_07_FIXTURES.md) | ✅ COMPLETE | sonnet (sessions `f051e6f`) | 02, 03, 04, 05, 06 |
| 08 | [SPEC_HIVE_CONTEXT_SESSIONS_08_GATHER_MANIFEST.md](SPEC_HIVE_CONTEXT_SESSIONS_08_GATHER_MANIFEST.md) | ✅ COMPLETE | sonnet (mcp `6e7c050`) | 01, 02, ≥1 adapter |
| 09 | [SPEC_HIVE_CONTEXT_SESSIONS_09_LEARNING_LEDGER.md](SPEC_HIVE_CONTEXT_SESSIONS_09_LEARNING_LEDGER.md) | ✅ COMPLETE | sonnet (mcp `6e7c050`) | 01, 02, adapters |
| 10 | [SPEC_HIVE_CONTEXT_SESSIONS_10_DOCS_HANDOFF.md](SPEC_HIVE_CONTEXT_SESSIONS_10_DOCS_HANDOFF.md) | ✅ COMPLETE | sonnet (docs/CI across 3 repos) | 01–09 settling |

Executors claim a row by setting `Status: in-progress, Owner: <name/model>` and mark
`COMPLETE` when the workstream merges. This table is the orchestration state file.

> **Merge note (2026-06-13):** all 10 workstreams shipped and merged to `main` across
> three repos. `cairn-mcp-server`'s four per-wave commits (`7117763`, `7cc5bd4`,
> `6e7c050`, `2b040b6`) were **squashed to `8ff43a0`** on merge — GitHub push protection
> flagged a Stripe-format string in the redaction test's planted-secret fixtures, so the
> fixtures now assemble secret-shaped strings at runtime and history was collapsed to one
> clean commit. The pre-squash hashes above are historical. `cairn` (merge `9057bc7`) and
> `cairn-sessions` keep per-commit history. `cairn-sessions` is now a **private** GitHub
> repo (`winnorton/cairn-sessions`, created 2026-06-13, default branch `main`).

> **Post-program operationalization (2026-06-13).** The program shipped the ingestion
> *machinery*; two follow-ons make it *run autonomously on the Spark lab*:
> - **WS 11 — [SPEC_HIVE_CONTEXT_SESSIONS_11_INGEST_CLI.md](SPEC_HIVE_CONTEXT_SESSIONS_11_INGEST_CLI.md)**
>   (built, `cairn-mcp-server` main `4734325`): the `cairn-ingest` CLI (`gather`/`distill`/
>   `status`) + the **Spark LLM distiller** — distillation routed through a local
>   OpenAI-compatible endpoint (deepseek-v4-flash). Distill validated via mock; live
>   validation is the deploy CHECKPOINT 3.
> - **Deploy — `spark/specs/SPEC_CAIRN_SESSIONS_DEPLOY.md`** (in the spark repo): the
>   spark agent's runbook to deploy the corpus + `cairn-ingest` sidecar + systemd timers
>   on `nuc-util`, distilling on the Spark coding lane, pushing findings to the **private**
>   `cairn-sessions` remote (created 2026-06-13). Pending: the spark agent runs the deploy;
>   the laptop-side federation for Claude Code + Antigravity sessions (D2 made concrete).

## §10 FIRST-ACTION CHECKLIST

1. Read this master end-to-end, especially §2 (contracts) and §4 (hard contract).
2. Read §0's evidence; confirm it against the live tree
   (`ls cairn-sessions/`, the `cairn-mcp-server` README tool table).
3. Claim a Wave-0 row from §9 (01, 02, or 03) — these gate everything.
4. `/spec --from docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_<NN>_<TOPIC>.md` to elaborate the
   stub into a full executable plan.
5. Create a worktree in the correct repo per §8 (MCP-server vs corpus vs framework).
6. Execute → cold `/peer-review` → revise → integrate. Mark §9 COMPLETE on merge.
7. Wave 0 must be reviewable before Wave 1 adapters code against the frozen contracts.

## §11 ARCHITECTURAL RATIONALE FOR THE PROGRAM SHAPE

Why a program, not a single `/spec`:

- **Parallel teams + worktree isolation across three repos.** Ten workstreams land in
  three different repos; a single spec can't model per-repo worktree isolation or
  parallel adapter fan-out. The master is the only place the cross-repo coordination lives.
- **Cross-cutting concerns would vanish in a single spec.** Redaction (security),
  determinism, the findings ledger, CI gates, and docs are exactly the rows that get
  dropped as "not the feature." The axes pass (Gate A) forced each to a named owner;
  §3's no-deferral discipline keeps them.
- **The envelope is a contract surface N adapters and M tools share.** That is the
  textbook program signature — freeze the contract in Wave 0, fan out in Wave 1. A
  single spec would interleave contract and consumers and develop the §-to-§
  consistency drift `/program` exists to prevent.
- **Precedent:** cairn's own dev process treats multi-workstream work this way; this is
  the first program to span the cairn / cairn-mcp-server / cairn-sessions triad, which is
  itself why the coordination surface needs to be explicit.
