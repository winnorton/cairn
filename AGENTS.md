# cairn — Agent Context

This is a **skill authoring project**. The shipped artifact is a tree of agent skills
(plus supporting memory, laws, and context templates) that other projects adopt via
`adopt cairn`. Most substantive edits in this repo target a skill under `files/skills/`.

## Read first

Before designing anything new, skim the relevant research paper(s) in `docs/research/`
— every architectural choice in this project (4-layer habitat, typed memory, slug
identity, collaboration-vs-maintenance skill split, distillate/bridge flow, MVH = two
files) has a paper documenting *why*. New design without that grounding tends to
recreate problems the research already solved. See [docs/research/README.md](docs/research/README.md)
for the index.

## Current state

- **Version:** [`VERSION`](VERSION) is the one place the current version is stated;
  release history is in [`CHANGELOG.md`](CHANGELOG.md). Cut a release with
  `node scripts/release.mjs` (see `## Working agreement`).
- **Why releases matter here:** a version bump is the only signal Claude Code's plugin
  manager updates on, and Antigravity and Codex change only when reinstalled. Twice
  (v0.15.0, v0.16.1) installed copies ran a months-old skill set because nothing was
  bumped.
- **v0.14.0 (2026-06-14)** — the **cairn ownership migration**: state
  moved out of vendor namespaces into a cairn-owned `<project>/.cairn/` directory;
  skills distribute as cairn-named packages the vendor's own installer places
  (the `cairn` Claude Code plugin, `@winnorton/cairn-pi` npm, the native
  `packages/cairn-agy` agy plugin); zero agent writes to any vendor-owned path.
  Program master archived at
  [`docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`](docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md).
  (v0.13.1 renamed `/review` → `/peer-review` to disambiguate from Claude Code's
  built-in `/review`.)
- **Primary environments (3):** Claude Code, Antigravity (Google), and Pi (pi.dev).
  Roles split asymmetrically: **Antigravity is the primary coding environment**
  (implementation, broad tool-use, real edit/run cycles). **Claude Code is
  primary for specs and reviews** — `/spec`, `/program`, `/peer-review`, and
  `/round-review` run here; the strong tool-use discipline and spec format make
  it the authoring anchor. **Pi is supported but not primary** — the six-skill
  authoring loop installs natively via
  `pi install npm:@winnorton/cairn-pi` and Pi executes `/spec`- and `/program`-
  produced artifacts cleanly (validated: session `019eaed6`,
  `SPEC_VAST_TERRAIN_P1_05_WORKER_STAGE_RUNNER`, zero cairn skills installed —
  the cairn `/spec` format is the executor contract). Pi adoption details in
  [adopt.md](adopt.md) Step 3; cairn-pi source in `packages/cairn-pi/`, sync'd
  with a drift guard (see
  [docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md](docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md)).
  Cowork stays in `manifest.json` for backward compat but is no longer in the
  primary triplet.
- **Shipped in v0.15.0 (formerly the unreleased interim slice):** six changes, listed
  here for provenance. (1) The `lra` skill pack — a `prompt-evolve` specialization; see
  [docs/CROSS_REPO_LRA_CAIRN.md](docs/CROSS_REPO_LRA_CAIRN.md). (2) The
  skill-size gate suite in `scripts/` (`check-skill-budgets.mjs`,
  `check-prompt-register.mjs`) wired into CI — `check-skill-budgets` enforces
  Pi's 1024-character description cap plus exact per-skill instructional-body
  word baselines in `scripts/skill-body-word-baseline.json`; intentional count
  changes require `--update-body-baseline` in the reviewed diff. (3)
  Law-creation discipline — `scripts/check-laws-shape.mjs` plus the two newest
  meta-rules (machine-checkable means gate-not-law, memory-first promotion). (4)
  A **skill-compression campaign (2026-07-08/09)** that rewrote `prompt-evolve`
  to its 676-word kernel and ratcheted `spec`, `program`, `reflect`, `note`,
  `peer-review`, and `plan` down against the baseline. (5) The `swarm` skill —
  living coordination for repeating multi-workstream work (count 18→19). (6)
  `prompt-evolve` cold-start mode, a project-named coverage table, and
  `ACTIVE`/`HELD` lifecycle state — grounded in a survey of 15 evolving prompts
  across cwar-engine + lra, 14 of which had independently grown a per-unit status
  table under five different names. The superseded `agents/`
  umbrella draft is retired at `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`.
  Before touching `manifest.json`, `adopt.md`, or path conventions, read the
  archived v0.14.0 program master for the design rationale.
- **Open design threads:** see `docs/notes/` — in-repo memory tier (addressed
  by v0.14.0 `.cairn/` move), `/cairn-introspect` skill candidate (gate at 3+
  instances), supervisor pattern (deferred), v0.13.0 follow-ups.

## Layout

- `files/skills/<name>/SKILL.md` — the skill body + YAML frontmatter (the
  `description:` field is load-bearing — agents use it to decide whether to invoke).
  A skill may ship supporting files beside it (`README.md`, `scripts/`); the whole
  directory is the source of truth and `scripts/sync-skills.mjs` propagates all of it
- `files/skills/README.md` — the skill catalog and category groupings
- `files/.cairn/LAWS.md`, `files/.cairn/CLAUDE.md`, `files/.cairn/memory/` — supporting
  context templates shipped to adopters (installed to `<project>/.cairn/`). Editing
  these changes what every future adopter gets.
- `LAWS.md` (repo root) — cairn's *own* 9 laws governing how cairn itself is developed
  (distinct from `files/.cairn/LAWS.md`, which is the *template* shipped to adopters)
- `adopt.md` — the install/onboarding script agents follow when running `adopt cairn`
- `manifest.json` — machine-readable install manifest read by `adopt.md`; `files:`
  array is the canonical source-of-truth for what ships
- `scripts/skill-body-word-baseline.json` — reviewed instructional-word counts for
  every source skill; CI rejects unacknowledged count drift
- `VERSION` — semver; bumped by `scripts/release.mjs` in lockstep with the five
  package/manifest version files
- `CHANGELOG.md` — one short entry per release, written by `scripts/release.mjs`
- `scripts/release.mjs` — one-command release: gates, version bump, changelog entry,
  commit, tag, push, then refresh of the maintainer's Claude Code, Antigravity, and
  Codex installs (`--install-only` refreshes without releasing; `--dry-run` previews)
- `HANDOFF.md` — bridge across session boundaries; updated when a session has something
  to hand off, not per release
- `README.md` — product surface for humans considering adoption
- `docs/research/` — 9 papers (agentic-habitat, two-file-habitat, habitat-transfer,
  collaboration-skills, human-interaction-patterns, feedback-velocity,
  distillate-to-production, plus README and open-questions). The "why" archive.
- `docs/notes/` (active, single-paragraph intent capture) + `docs/notes/_promoted/`
  (breadcrumbs after `/spec --from` promoted a note to a spec) + `docs/notes/_done/`
  (finished without a spec)
- `docs/specs/` — execution and permanent contract specs; folder-as-status for standalone execution specs and completed programs (`docs/specs/archive/` for shipped; permanent contracts and unbuilt scheduled-deferral specs stay live)
- `plans/` (active) and `plans/archive/` (shipped, v0.3 → v0.12 documented) — same
  folder-as-status pattern as specs
- `server/feedback-endpoint/` — Node 20 + Express + Octokit handler for the
  `/feedback` skill's hosted-endpoint path; deployed to Cloud Run, fronted at
  `cairn.winnorton.com/feedback`. Stateless, 2-req/60s rate limit, PII sanitization.
- `packages/cairn-pi/` — npm package shipping the six authoring-loop skills to Pi
  (`pi install npm:@winnorton/cairn-pi`). The `autoresearch` pack is out of its
  curation — Pi has the upstream `pi-autoresearch` extension natively. `skills/`
  holds committed byte-identical copies of `files/skills/` entries, regenerated by
  `scripts/sync-skills.mjs`;
  `--check` (wired to `prepublishOnly`) fails on drift, over-cap descriptions, or
  VERSION-lockstep breaks. Never hand-edit the copies.
- `packages/cairn-claude/` — the `cairn` Claude Code plugin shipping all 20 skills to
  Claude Code (`claude plugin marketplace add winnorton/cairn` + `claude plugin install
  cairn@cairn`). Skills synced from `files/skills/` by the shared `scripts/sync-skills.mjs`;
  drift guard runs in CI (plugin has no `prepublishOnly`). Per `[LAW own-your-namespace]`.
- `packages/cairn-agy/` — the native Antigravity (agy) plugin (agy uses a ROOT
  `plugin.json`, not Claude's `.claude-plugin/`). Same shared sync-guard; installs via
  `agy plugin install https://github.com/winnorton/cairn/tree/main/packages/cairn-agy`. agy's
  `import claude` does NOT ingest marketplace plugins, hence a native agy package — see
  [docs/notes/NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md](docs/notes/NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md).

Edits to `files/**` change what adopters get on their next `adopt cairn` run.
Edits outside `files/**` change cairn-the-repo only.

## Skills defined by this project (20)

Listed by category — full descriptions in
[`files/skills/README.md`](files/skills/README.md):

### Maintenance — service the habitat itself
- [`tour`](files/skills/tour/SKILL.md) — onboard new users post-install
- [`reflect`](files/skills/reflect/SKILL.md) — end-of-task retrospective (post-hoc, same-agent)
- [`plan`](files/skills/plan/SKILL.md) — pre-action behavioral alignment (conversational, no file)
- [`prune`](files/skills/prune/SKILL.md) — retire stale entries by type
- [`audit`](files/skills/audit/SKILL.md) — count citations, surface unused structures
- [`feedback`](files/skills/feedback/SKILL.md) — file issues to cairn's maintainer

### Collaboration — service the human-agent pair
- [`reframe`](files/skills/reframe/SKILL.md) — alternative framings when convergent thinking is stuck
- [`bridge`](files/skills/bridge/SKILL.md) — structure cross-session context relay
- [`advocate`](files/skills/advocate/SKILL.md) — simulate end-user perspective before shipping

### Cross-perspective — rotate the observer
- [`peer-review`](files/skills/peer-review/SKILL.md) — fresh agent reading a change set cold
- [`session-distill`](files/skills/session-distill/SKILL.md) — fresh agent reading a past session JSONL cold through cairn's improvement lens; formalizes the transcript-analysis methodology that produced cairn itself (`/reframe`, `/bridge`, `/advocate`, and the collaboration-skills taxonomy all came from this loop)

### Artifact — produce in-tree planning files
- [`note`](files/skills/note/SKILL.md) — single-paragraph in-tree capture (`docs/notes/`)
- [`spec`](files/skills/spec/SKILL.md) — structured execution or permanent contract spec (`docs/specs/`)
- [`program`](files/skills/program/SKILL.md) — program-of-specs (master + N workstream stubs)
- [`round-review`](files/skills/round-review/SKILL.md) — review one round of executor output against a program, draft R+1 stubs + round master
- [`prompt-evolve`](files/skills/prompt-evolve/SKILL.md) — author a version-controlled operational prompt for multi-pass work, cold-started from a five-input brief or extracted from a spec; coverage units may be known or discovered and a project-named coverage table tracks them, the prompt carries `ACTIVE`/`HELD` lifecycle state so a paused loop stays resumable, and every pass validates work then improves the prompt
- [`lra-lite`](files/skills/lra-lite/SKILL.md) — engine-free fallback for the lra research pipeline; agents should **prefer the full lra engine** (check for `lra_*` MCP tools, ask the user) before using this. Mirrors the lra research→library→application pipeline 1:1 via lra commands as project-local markdown. The two prompts are verbatim from the lra lab (the source of `[LAW prompt-economy]`); see [`docs/CROSS_REPO_LRA_CAIRN.md`](docs/CROSS_REPO_LRA_CAIRN.md)
- [`swarm`](files/skills/swarm/SKILL.md) — living coordination surface for repeating multi-workstream work over partitions; fan-out parallel stubs per wave, review results, self-improve the master, fan out the next wave; held or retired only with user approval

### Execution — run a measured loop against the codebase
The only category whose skills mutate and measure the tree rather than produce text. Both
bundle runtime code (§ Design DNA names the exception) and are adapted from
[pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT, © davebcn87).

- [`autoresearch`](files/skills/autoresearch/SKILL.md) — autonomous optimization loop against any measurable target: pick an idea, edit, measure, keep or revert, log the insight. Session state in `.auto/` at the project root survives compaction and reverts; MAD-based confidence scoring keeps noise from being claimed as a win; `scripts/experiment.mjs` is a zero-dependency harness and `scripts/stop-hook.mjs` an opt-in Claude Code Stop hook for never-stop mode
- [`autoresearch-finalize`](files/skills/autoresearch-finalize/SKILL.md) — split an autoresearch session's kept commits into file-disjoint, independently mergeable review branches; `scripts/finalize.mjs` validates disjointness and full diff coverage before cutting a branch

Adding a new skill = drop a `files/skills/<name>/SKILL.md` subdirectory with frontmatter
(schema in [`files/skills/README.md`](files/skills/README.md)) AND add a matching entry
in the category list both there and in this file. Until both lists agree, the skill is
half-shipped. Enroll it in the relevant package sync-configs, run
`node scripts/check-skill-budgets.mjs --update-body-baseline` from the repo root, then
run the default budget and package sync checks. Instructional counts include prose,
lists, and tables; they exclude frontmatter, headings, fenced examples, and HTML
comments.

## Hard rules

See [LAWS.md](LAWS.md) for the full set of non-negotiable rules for developing cairn
itself. The ones that fire most often:

- **`[LAW load-meta-laws]`** — load the project's meta-laws before architectural
  decisions. For cairn itself that means reading this file's `Read first` pointer +
  the relevant research paper before designing.
- **`[LAW commit-cite]`** — when a commit implements a law or memory's directive,
  cite the source by slug in the commit message body. Citations must reach durable
  output (files, commits) — `/audit` can't scan conversation.
- **`[LAW choose-slug-by-scope]`** — memory entries land at the slug matching the
  *scope of what's remembered*, not the slug where the session happens to be
  running. Cross-cutting agent-meta-knowledge picks one slug + declares a pointer
  in `HANDOFF.md`'s `## Related memory paths`.

Cite by slug (`[LAW <slug>]`) in any durable output the law shaped — that's how the
`/audit` skill earns its signal.

## Working agreement (sole maintainer)

Cairn has one user: its maintainer. Process is sized for that (2026-11-19).

- **Commit straight to `main`** when asked to commit. No branch or PR unless asked.
- **Release with one command.** `node scripts/release.mjs` runs the gates, bumps the six
  version files, writes the `CHANGELOG.md` entry from commit subjects, commits, tags,
  pushes, and refreshes the Claude Code, Antigravity, and Codex installs. Release when
  skill bodies change and the installs should pick them up; doc-only changes need none.
- **No per-release prose.** Do not restate a release in `HANDOFF.md`, `README.md`, this
  file, or `CLAUDE.md`. The changelog entry is the record.
- **Review on request.** A cold `/peer-review` is worth asking for when a skill's contract
  is rewritten. It is not a merge gate.
- **Gates stay.** The mechanical checks in `scripts/` and CI are cheap and keep running.
  When a skill body changes, re-record the body-word baseline; no written justification.

## HIVE_CONTEXT_SESSIONS program (shipped, 2026-06-13)

The `cairn-sessions` corpus and `cairn-mcp-server` v0.5.0 session-ingestion tooling
are now live across all three harnesses (Claude Code, Pi, Antigravity). The corpus at
`~/projects/cairn/cairn-sessions` holds normalized envelopes from all three harnesses
(4 sessions committed as fixtures), a findings ledger (`findings/LEDGER.md`), and three
JSON Schemas. The ingestion pipeline (`gather` / `manifest` / `corpus_status` MCP tools +
`normalizeAuto`) normalizes any raw transcript to a canonical envelope, scrubs secrets
(defense-in-depth: in-normalization + pre-commit hook in cairn-sessions), and deduplicates
on `content_hash`. `session_distill` now accepts `envelope_path` to consume corpus
envelopes directly and write compounding findings. The compounding mechanism — prior
pattern names from `findings/*.json` seeding the next distillation — is now operational.
See the program master at `docs/specs/archive/SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md`.

## Design DNA

Patterns this project leans on hard. Carry them through every new piece of work:

- **Minimum viable habitat is two files** — `CLAUDE.md` + `MEMORY.md`. Everything
  else is graduated. Don't add a layer unless its absence is observably breaking
  something.
- **Observe the collaboration first, then package what you see** — every
  collaboration skill (reframe, bridge, advocate) came from transcript analysis,
  not from theory. New skill proposals should cite at least 3 observed instances
  before promotion (see `NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md` for the
  3-instance gate).
- **Folder-as-status, not `Status:` fields** — `plans/` vs `plans/archive/`,
  `docs/specs/` vs `docs/specs/archive/` (standalone execution specs and completed
  programs; active program children carry `STUB` / `READY FOR EXECUTOR` and permanent
  contract specs carry 3-pass evidence status in `docs/specs/`), `docs/notes/` vs
  `docs/notes/_promoted/` and `docs/notes/_done/`. `git mv` is the ship signal. Status fields drift; folder
  locations don't.
- **Slug-is-identity** — laws and memories cite by slug, never by number. Numbers
  reorder; slugs survive. Same applies to skill names — collision with another
  vendor's namespace (e.g. `/review`) triggers a rename, not a coexistence attempt.
- **Citations in durable output** — `[LAW <slug>]`, `[MEM <type>/<name>]` belong
  in files, commits, notes, research docs. Conversational citations produce zero
  audit signal.
- **Three-level degradation** — the `/feedback` pattern (endpoint → `gh` CLI →
  paste). Generalizes to any delivery path that might fail in restrictive
  environments. Always provide the last-resort manual path.
- **Cairn ships markdown, not code** — the *shipped payload* (skills, templates,
  packages' published content) stays markdown-only, with runtime code quarantined
  in named locations: the feedback endpoint (`server/feedback-endpoint/`), the
  shared sync/gate scripts (`scripts/` at repo root), thin per-package delegate
  shims (`packages/*/scripts/`), and — since the `autoresearch` pack —
  `files/skills/autoresearch{,-finalize}/scripts/*.mjs`. The published pi package
  ships zero scripts (`package.json` `files:` whitelist); the git-installed
  plugins carry the inert shims only. The autoresearch exception was taken
  deliberately and named per `[LAW scope-explicit]`: a measure-keep-revert loop needs
  deterministic metric parsing, MAD statistics, and git side effects, and prose
  telling an agent to hand-roll those produces a different loop every run. The
  gate for any future bundled-code skill is the same — the skill's contract is
  mechanical, and an agent re-deriving it each invocation breaks the contract.
  A skill that bundles code declares its assets in `manifest.json` via `bundles`,
  and `scripts/sync-skills.mjs` byte-checks every asset, not just `SKILL.md`.

## Don't adopt cairn into cairn

Cairn's own repo has its own `LAWS.md`, `HANDOFF.md`, and `files/` template tree.
Running `adopt cairn` from inside this repo would create duplicate artifacts and
recursive confusion. If you want to use one of cairn's skills while working on cairn
itself, the source-of-truth file is `files/skills/<name>/SKILL.md` — copy from there.

## For continuity

- [HANDOFF.md](HANDOFF.md) — cross-session bridge for the next agent
- [README.md](README.md) — what cairn is (the product surface) and how external
  projects adopt it
