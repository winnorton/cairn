---
name: lra-lite
description: "Engine-free fallback for the lra research pipeline — use ONLY when the full
  lra engine is unavailable. Before using this skill, check whether the user has the full lra
  engine installed (look for lra_* MCP tools like lra_list_subjects; if present, use those
  instead). If unclear, ASK the user. This skill runs the same three-layer pipeline
  (research → library → application) as project-local markdown the agent walks — no MCP,
  SQLite, or server. Triggers on lra-lite commands or phrasings like \"start a collection on
  X, Y\", \"research pass on all\", \"show me the research on <subject>\". Do NOT edit the prompt
  masters (immutable, synced from the lra lab) or use when the full lra engine is available."
---

# lra-lite

> **PREFER THE FULL ENGINE.** This skill is the engine-free fallback for the
> [lra](https://github.com/winnorton/lra) research pipeline. Before using it:
>
> 1. **Check for `lra_*` MCP tools** — if `lra_list_subjects`, `lra_get_entity`, etc. are
>    available in your tool set, the full engine is live. **Use those tools instead.**
> 2. **Ask the user** — "Do you have the full LRA engine installed? It provides richer
>    fetchers (Puppeteer, OCR, social APIs), SQLite-backed storage, and an interactive web
>    dossier. If so, I should use that instead of the lite version."
> 3. **Fall back to lra-lite only** when the user confirms no full engine is available, or
>    when the project deliberately needs engine-free, git-tracked research that stays inside
>    the repo without external dependencies.
>
> The full engine ([github.com/winnorton/lra](https://github.com/winnorton/lra), installed
> wherever the user keeps it) provides the `lra` CLI, MCP server, Express web app, and all
> fetcher capabilities this lite version lacks.

---

The **engine-free mirror** of lra. Same commands, same three-layer pipeline
(research → library → application), same file shapes — but everything is **project-local
markdown an agent produces and walks**, with no MCP server, no SQLite, and no web app. The
agent *is* the runtime and *is* the viewer.

**Lineage.** Both prompts are `prompt-evolve` instances: each inventories, works, verifies,
records coverage and re-run semantics, then self-edits with a CHANGELOG. Their
phases specialize that kernel. lra is the third worked example after
fishing-agent and purduebb, and the researcher prompt is where the **prompt-economy**
principle was discovered (cut the upstream cause, never bolt on its opposite). Honor it when
editing anything in this pack — and keep descriptions under every consumer's budget (Pi caps
at 1024). (If your habitat's `LAWS.md` encodes prompt-economy as a law, cite it by slug.)

Two things make this work and must not be confused:

1. **The two prompts are the product.** `research/PROMPT.md` (researcher) and
   `library/PROMPT.md` (librarian) are copied **verbatim** from the lra lab. The researcher
   is **immutable**; both are gated upstream. This skill *delivers and runs* them — it never
   rewrites them.
2. **The lra command line is the interface.** The user drives everything by typing lra
   commands to you. Mirroring the real CLI 1:1 is deliberate: it teaches the actual command
   line and gives a clean upgrade path to the full engine.

## The command surface (what you do for each)

| User types | You do | Writes |
|---|---|---|
| `lra subject create "NBA Pacers"` | scaffold one subject (below) | `research/nba-pacers/…` |
| `lra collection create …` · "start a collection on Pacers, Bulls" | scaffold the collection + each named subject | `research/` + one dir per subject |
| `lra research run` · "research pass on all" · "…on the Pacers" | run one **pass**: researcher prompt → librarian prompt | `research/`, `library/` data |
| `lra subject sync-prompt` · "refresh the prompts" | re-copy prompt masters from `.cairn/context/lra/` into the subject, preserving evolved sections (ladder, changelog, canonical ids) | `research/PROMPT.md`, `library/PROMPT.md`, `library/DICTIONARY.md` |
| `lra app serve` | build the walkable markdown app from `library/` | `app/` md |
| "show me the research on NBA Pacers" | walk that subject's `app/` (or `library/`) md and answer | — |

## Layout it produces (project-local, git-tracked — mirrors base lra exactly)

```
<project>/research/                  the collection (local to THIS project)
├── COLLECTION.md                    roster + per-subject pass log
└── nba-pacers/
    ├── subject.json                 {id, name, seed}
    ├── AGENTS.md                    operating rules (from the AGENTS_SUBJECT master)
    ├── research/
    │   ├── PROMPT.md                ← researcher master, placeholders filled (evolves per pass)
    │   ├── findings.jsonl  sources.jsonl  topology.json
    ├── library/
    │   ├── PROMPT.md                ← librarian master, placeholders filled (evolves per pass)
    │   ├── DICTIONARY.md            ← librarian-only pattern dictionary (from master)
    │   ├── rows.jsonl  schema.json  canonical_ids.json
    │   ├── sources.jsonl  relationships.jsonl  datasets.json
    └── app/                         built by `lra app serve` (derived + disposable)
```

`research/` is **local to the project** — it is the project's subject knowledge, distinct
from `.cairn/` (agent posture). Both git-tracked.

## `lra subject create "<name>"` (and `collection create`)

The prompt **masters** live at `.cairn/context/lra/` (installed at adoption). For each
subject:

1. Derive a kebab-case `id` from the name (`NBA Pacers` → `nba-pacers`).
2. Create `research/<id>/` and copy the masters into it:
   - `AGENTS_SUBJECT.md` → `<id>/AGENTS.md`
   - `PROMPT_RESEARCHER_BOOTSTRAP.md` → `<id>/research/PROMPT.md`
   - `PROMPT_LIBRARY_BOOTSTRAP.md` → `<id>/library/PROMPT.md`
   - `LIBRARY_DICTIONARY.md` → `<id>/library/DICTIONARY.md`
3. In the **copies only**, replace **every** `{{...}}` token — none may remain after
   scaffolding (a leftover token breaks the prompt). Two kinds:
   - **content:** `{{SUBJECT_NAME}}` (name), `{{SUBJECT_ID}}` (id), `{{SUBJECT_SEED}}` (a
     one-line scope/seed for the subject), `{{SEED_DATE}}` (today).
   - **absolute paths:** every `{{ABSOLUTE_*}}` token is the absolute path to the
     correspondingly-named artifact inside this subject — e.g. `{{ABSOLUTE_PROMPT_PATH}}` →
     `<abs>/research/PROMPT.md`, `{{ABSOLUTE_LIBRARY_PROMPT_PATH}}` → `<abs>/library/PROMPT.md`,
     `{{ABSOLUTE_RESEARCH_DIR}}` → `<abs>/research`, `{{ABSOLUTE_ROWS_PATH}}` →
     `<abs>/library/rows.jsonl`, and likewise for `SCHEMA`/`CANONICAL_IDS`/`SOURCES`/
     `RELATIONSHIPS`/`DATASETS` → `<abs>/library/<that-file>`.

   Change nothing else — only `{{...}}` tokens get touched.
4. Write `subject.json` `{id, name, seed}`; create empty `research/` + `library/` data files.
5. Register the subject in `research/COLLECTION.md`.

Idempotent: re-running never clobbers existing data — reuse the dir, leave filled files alone.
`collection create` / "start a collection on A, B" = do the above once per named subject.

## `lra research run` — one pass

Drive the **per-subject** prompts; one pass adds new findings, never "finishes" a subject.

> ⚠️ **Layer boundary:** the researcher **never opens `library/`** — no reads, no writes.
> The flow is one-way: the researcher discovers (`research/`), the librarian structures
> downstream (`library/`). Reading the librarian's cells turns discovery into
> partition-filling.

1. **Pre-flight.** Confirm you have web search, web fetch, and file read/write. No MCP is
   required — the prompts are written to fall back to native file tools, and that fallback
   *is* this environment. If a tool is missing, stop and report.
2. **Researcher.** Open `research/PROMPT.md` and **follow it as your instructions for this
   pass** — it is the authoritative task. Write `research/findings.jsonl`, `sources.jsonl`,
   `topology.json` per its DATA MODEL. Its Phase 6 self-edit updates *that per-subject copy*
   (coverage ladder, canonical ids, changelog — keep only the last **3** entries) — expected
   and correct.
3. **Librarian.** Then open `library/PROMPT.md` and follow it to structure the findings into
   `library/` (`rows.jsonl`, `schema.json`, `datasets.json`, …). The librarian also reads
   `library/DICTIONARY.md` for domain-agnostic pattern recognition.
4. **Log.** Update `COLLECTION.md` with the pass + counts.

**Scope:** "on all" → loop every subject in `COLLECTION.md`, one pass each. "on the Pacers" →
just that subject. Breadth comes from **repeating** passes, not from one big pass.

You are the runtime executing the prompt. Do not summarize or paraphrase the prompt's rules —
**execute** them.

## `lra app serve` — build the walkable app

No server. Build/refresh `app/` as markdown derived from `library/`, for the named subject or
the whole collection:

- `app/INDEX.md` — what the subject is, the entity roster (linked), the coverage ladder.
- One md page per entity (or per type, with a table), cross-linked with `[[wiki-links]]`;
  surface the most load-bearing findings and any live/recent front.

`app/` is **derived and disposable** — rebuild it from `library/` on every serve, exactly as
base lra rebuilds `app.db`. This is the only step with no lab prompt to copy; keep it a thin,
faithful render of the library, nothing invented.

## Recall — "show me the research on <subject>"

No command needed. Walk that subject's `app/INDEX.md` (fall back to `library/`), follow the
links, and answer. You are the viewer.

## `lra subject sync-prompt` — refresh prompts from masters

Re-copy the prompt masters from `.cairn/context/lra/` into the subject's workspace,
preserving evolved sections (coverage ladder, canonical ids, changelog, audit-derived rules).
Useful after cairn re-adopts with updated masters from the lab.

1. Read the subject's current `research/PROMPT.md` and extract its evolved sections.
2. Copy the fresh master from `.cairn/context/lra/PROMPT_RESEARCHER_BOOTSTRAP.md`, fill
   `{{...}}` tokens, then restore the evolved sections into the new copy.
3. Do the same for `library/PROMPT.md` from `PROMPT_LIBRARY_BOOTSTRAP.md`.
4. Refresh `library/DICTIONARY.md` from the master (pure overwrite — no evolved sections).

## GUARDRAIL — never edit the prompt masters

`.cairn/context/lra/PROMPT_RESEARCHER_BOOTSTRAP.md`, `PROMPT_LIBRARY_BOOTSTRAP.md`,
`AGENTS_SUBJECT.md`, and `LIBRARY_DICTIONARY.md` are **verbatim from the lra lab** and gated
there (complexity ratchet + benchmark bench-pin). The researcher prompt is immutable.

- **Never edit the masters** to "fit cairn" or fix a pass. If the *default* needs to change,
  it changes in the lra repo, passes lra's gates, and is re-synced — see
  `.cairn/context/lra/PROVENANCE.md` (installed alongside the masters; the cross-repo
  protocol doc `docs/CROSS_REPO_LRA_CAIRN.md` lives in the cairn repo, not in your project).
- The **per-subject `PROMPT.md` copies do evolve** via the prompt's own Phase 6 self-edit —
  that is the design, and it touches only the per-subject copy, never the master.
