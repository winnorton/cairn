# Cross-repo link: cairn (store) ← lra (lab)

This repo (**cairn**) ships an engine-free **research pack** whose heart — two prompts — is
authored and gated in the jointly-owned **lra** repo. This doc records the link from cairn's
side; the mirror lives at `docs/CROSS_REPO_LRA_CAIRN.md` in lra.

## The relationship

| | lra | cairn (this repo) |
|---|---|---|
| role | **the lab** | **the store** |
| owns | the full engine (CLI, MCP, SQLite, Express app, fetchers), the validate gates, the benchmark, and the **authoring** of the prompts | the **adoption mechanism** (one prompt → markdown skills + templates) and the engine-free delivery of the pipeline |
| the prompts | source of truth, hardened + scored here | **delivered verbatim**, run in native-file fallback mode |

The lra pack is the same three-layer pipeline as the lab (research → library → application),
but as **project-local markdown an agent walks** — no MCP, no SQLite, no server. It mirrors
lra's CLI 1:1 so adopting it teaches the real command line.

## What this pack contains

| file | role |
|---|---|
| `files/skills/lra/SKILL.md` | the command skill — teaches/runs `lra subject create`, `lra research run`, `lra app serve`; scaffolds a project-local `research/` collection; drives the prompts. **cairn-authored, mutable.** |
| `files/.cairn/context/lra/PROMPT_RESEARCHER_BOOTSTRAP.md` | researcher prompt — **verbatim from lra, immutable** |
| `files/.cairn/context/lra/PROMPT_LIBRARY_BOOTSTRAP.md` | librarian prompt — **verbatim from lra** |
| `files/.cairn/context/lra/AGENTS_SUBJECT.md` | per-subject operating rules — **verbatim from lra** |
| `files/.cairn/context/lra/PROVENANCE.md` | source commit + md5 fingerprints + re-sync protocol |

## The boundary that matters

cairn's plugin is **"markdown skills only; no runtime code."** This pack respects that:

- the **skill** (`files/skills/lra/`) is the only thing that rides the plugin;
- the three **prompt templates** ride the adopt/manifest flow as `.cairn/` habitat files
  (like cairn's context templates), not the plugin;
- there is **no runtime** — the host agent is the engine and the viewer.

It does, however, **expand cairn's footprint by one directory**: the pack produces a
project-local, git-tracked `research/` collection at the adopter's project root.

- `.cairn/` = **agent posture** (memory, laws, skills) — *how the agent works*.
- `research/` = **subject knowledge** (the libraries this project accumulates) — *what the
  project knows*.

Both project-local, cleanly separated by purpose. This is the one genuine identity expansion:
cairn now writes a second top-level dir, because a knowledge base that isn't in the repo it's
*for* is just a worse version of memory.

## NEVER edit the prompt masters here

The researcher prompt is immutable; both are gated in lra. Editing them in cairn forks the
most protected asset off its gates. Changes to the *default* happen in lra, pass lra's
`npm run validate`, and re-sync here (see `PROVENANCE.md`). The per-subject `PROMPT.md` copies
the skill scaffolds **do** evolve per-pass via the prompt's own Phase 6 — that touches only
the copy, never the master.

## Shipping status (cairn release machinery)

**Wired.** The skill + 4 masters are registered in `manifest.json` (masters use `mode: overwrite`
so they track upstream on re-adopt); `lra` is enrolled in the `cairn-claude` + `cairn-agy`
`sync-config.json` and synced into both packages (not `cairn-pi` — outside its authoring-loop
curation). Passes cairn's gates: `check-skill-budgets`, `sync-skills --check` (all packages),
and the §5 DoD greps. A fresh-agent `/peer-review` has run.

**Remaining — the release act itself:** bump `VERSION` (+ package-lockstep + `README.md`
`## Status`) and publish the packages. Held at v0.14.0 until then.
