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

- **Latest tag:** v0.13.1 (renamed `/review` → `/peer-review` to disambiguate from
  Claude Code's built-in `/review`).
- **Primary environments (3):** Claude Code, Antigravity (Google), and Pi (pi.dev).
  Roles split asymmetrically: **Claude Code + Antigravity are primary authoring
  environments** (where `/spec`, `/program`, `/round-review`, and most cairn skills
  fire). **Pi is the primary executor** for `/spec`- and `/program`-produced
  artifacts — Pi reads a spec and executes phase-by-phase using its own
  `@juicesharp/rpiv-todo` package for compaction-surviving orchestration. Validated
  by Pi session `019eaed6` executing `SPEC_VAST_TERRAIN_P1_05_WORKER_STAGE_RUNNER`
  cleanly with zero cairn skills installed — the cairn `/spec` format is the
  executor contract. Cowork stays in `manifest.json` for backward compat but is
  no longer in the primary triplet. Per-env path resolutions in
  [manifest.json](manifest.json) `pathVariables`. Pi adoption details in
  [adopt.md](adopt.md) Step 3. The six-skill authoring loop (spec, program,
  round-review, fast-execute, peer-review, note) also installs natively in Pi via
  `pi install npm:@winnorton/cairn-pi` — source in `packages/cairn-pi/`, sync'd
  from `files/skills/` with a drift guard (see
  [docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md](docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md)).
- **In flight as of v0.13.1:** v0.14.0 architectural shift — pull state out of vendor
  namespaces (`~/.claude/memory/`, `<project>/.claude/`) into a cairn-controlled
  `<project>/agents/` directory. Spec at `docs/specs/SPEC_AGENTS_UMBRELLA.md`
  (untracked at draft). Forced by 2026-05 Claude Code sandbox restrictions on writes
  that combine curl-fetched content + `.claude/*` paths. Skill files stay at
  `~/.claude/skills/` (Claude Code loader requirement). The v0.14 `<project>/agents/`
  path also naturally aligns with Pi's `<project>/.agents/skills/` discovery
  convention — cross-env unification falls out of the move. Read the spec before
  touching `manifest.json`, `adopt.md`, or path conventions.
- **Open design threads:** see `docs/notes/` — in-repo memory tier (v0.14-adjacent),
  `/cairn-introspect` skill candidate (gate at 3+ instances), supervisor pattern
  (deferred), v0.13.0 follow-ups.

## Layout

- `files/skills/<name>/SKILL.md` — the skill body + YAML frontmatter (the
  `description:` field is load-bearing — agents use it to decide whether to invoke)
- `files/skills/README.md` — the skill catalog and category groupings
- `files/LAWS.md`, `files/CLAUDE.md`, `files/memory/` — supporting context templates
  shipped to adopters. Editing these changes what every future adopter gets.
- `LAWS.md` (repo root) — cairn's *own* 9 laws governing how cairn itself is developed
  (distinct from `files/LAWS.md`, which is the *template* shipped to adopters)
- `adopt.md` — the install/onboarding script agents follow when running `adopt cairn`
- `manifest.json` — machine-readable install manifest read by `adopt.md`; `files:`
  array is the canonical source-of-truth for what ships
- `VERSION` — semver, bumped per release
- `HANDOFF.md` — bridge across session boundaries (must be updated in the same commit
  as `VERSION` per `[LAW handoff-stays-current]`)
- `README.md` — product surface for humans considering adoption
- `docs/research/` — 9 papers (agentic-habitat, two-file-habitat, habitat-transfer,
  collaboration-skills, human-interaction-patterns, feedback-velocity,
  distillate-to-production, plus README and open-questions). The "why" archive.
- `docs/notes/` (active, single-paragraph intent capture) + `docs/notes/_promoted/`
  (breadcrumbs after `/spec --from` promoted a note to a spec)
- `docs/specs/` — execution specs; folder-as-status (`docs/specs/archive/` for shipped)
- `plans/` (active) and `plans/archive/` (shipped, v0.3 → v0.12 documented) — same
  folder-as-status pattern as specs
- `server/feedback-endpoint/` — Node 20 + Express + Octokit handler for the
  `/feedback` skill's hosted-endpoint path; deployed to Cloud Run, fronted at
  `cairn.winnorton.com/feedback`. Stateless, 2-req/60s rate limit, PII sanitization.
- `packages/cairn-pi/` — npm package shipping the six authoring-loop skills to Pi
  (`pi install npm:@winnorton/cairn-pi`). `skills/` holds committed byte-identical
  copies of `files/skills/` entries, regenerated by `scripts/sync-skills.mjs`;
  `--check` (wired to `prepublishOnly`) fails on drift, over-cap descriptions, or
  VERSION-lockstep breaks. Never hand-edit the copies.

Edits to `files/**` change what adopters get on their next `adopt cairn` run.
Edits outside `files/**` change cairn-the-repo only.

## Skills defined by this project (18)

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
- [`resume`](files/skills/resume/SKILL.md) — fresh session inheriting context from a prior one
- [`peer-review`](files/skills/peer-review/SKILL.md) — fresh agent reading a change set cold
- [`session-distill`](files/skills/session-distill/SKILL.md) — fresh agent reading a past session JSONL cold through cairn's improvement lens; formalizes the transcript-analysis methodology that produced cairn itself (`/reframe`, `/bridge`, `/advocate`, and the collaboration-skills taxonomy all came from this loop)

### Artifact — produce in-tree planning files
- [`note`](files/skills/note/SKILL.md) — single-paragraph in-tree capture (`docs/notes/`)
- [`spec`](files/skills/spec/SKILL.md) — structured agent execution spec (`docs/specs/`)
- [`program`](files/skills/program/SKILL.md) — program-of-specs (master + N workstream stubs)
- [`round-review`](files/skills/round-review/SKILL.md) — review one round of executor output against a program, draft R+1 stubs + round master
- [`fast-execute`](files/skills/fast-execute/SKILL.md) — polling-daemon executor: watches a sentinel-file inbox in `docs/specs/`, executes dispatched specs, marks completion via sentinel atomic-flip. The consumer-side verb of the artifact loop
- [`prompt-evolve`](files/skills/prompt-evolve/SKILL.md) — author a self-improving prompt for tough tasks done in many iterative passes over partitions (corpus mining, refactor sweeps, doc backfill, audits). The only artifact skill whose output evolves over its lifetime — Phase 6 self-edits accumulate lessons each pass

Adding a new skill = drop a `files/skills/<name>/SKILL.md` subdirectory with frontmatter
(schema in [`files/skills/README.md`](files/skills/README.md)) AND add a matching entry
in the category list both there and in this file. Until both lists agree, the skill is
half-shipped.

## Hard rules

See [LAWS.md](LAWS.md) for the full set of non-negotiable rules for developing cairn
itself. The ones that fire most often:

- **`[LAW load-meta-laws]`** — load the project's meta-laws before architectural
  decisions. For cairn itself that means reading this file's `Read first` pointer +
  the relevant research paper before designing.
- **`[LAW handoff-stays-current]`** — `HANDOFF.md` updates in the same commit as
  `VERSION`, `manifest.json`, `README.md` status section. One commit, one consistent
  view. Drift here actively misleads the next session.
- **`[LAW pre-merge-review]`** — release-shaped PRs (`feat: vX.Y.Z`, `fix: vX.Y.Z`,
  or any change touching 3+ user-facing files) get a fresh-perspective `/peer-review`
  from a session that didn't author the change. Mandatory for cairn's own development,
  not just recommended.
- **`[LAW commit-cite]`** — when a commit implements a law or memory's directive,
  cite the source by slug in the commit message body. Citations must reach durable
  output (files, commits) — `/audit` can't scan conversation.
- **`[LAW choose-slug-by-scope]`** — memory entries land at the slug matching the
  *scope of what's remembered*, not the slug where the session happens to be
  running. Cross-cutting agent-meta-knowledge picks one slug + declares a pointer
  in `HANDOFF.md`'s `## Related memory paths`.

Cite by slug (`[LAW <slug>]`) in any durable output the law shaped — that's how the
`/audit` skill earns its signal.

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
  `docs/specs/` vs `docs/specs/archive/`, `docs/notes/` vs `docs/notes/_promoted/`.
  `git mv` is the ship signal. Status fields drift; folder locations don't.
- **Slug-is-identity** — laws and memories cite by slug, never by number. Numbers
  reorder; slugs survive. Same applies to skill names — collision with another
  vendor's namespace (e.g. `/review`) triggers a rename, not a coexistence attempt.
- **Citations in durable output** — `[LAW <slug>]`, `[MEM <type>/<name>]` belong
  in files, commits, notes, research docs. Conversational citations produce zero
  audit signal.
- **Three-level degradation** — the `/feedback` pattern (endpoint → `gh` CLI →
  paste). Generalizes to any delivery path that might fail in restrictive
  environments. Always provide the last-resort manual path.
- **Cairn ships markdown, not code** — keep it that way. Two exceptions, each
  contained in its own subdirectory by design: the feedback endpoint
  (`server/feedback-endpoint/`) and the cairn-pi package's dev-time sync script
  (`packages/cairn-pi/scripts/`). The published pi package itself is markdown-only.

## Don't adopt cairn into cairn

Cairn's own repo has its own `LAWS.md`, `HANDOFF.md`, and `files/` template tree.
Running `adopt cairn` from inside this repo would create duplicate artifacts and
recursive confusion. If you want to use one of cairn's skills while working on cairn
itself, the source-of-truth file is `files/skills/<name>/SKILL.md` — copy from there.

## For continuity

- [HANDOFF.md](HANDOFF.md) — cross-session bridge for the next agent
- [README.md](README.md) — what cairn is (the product surface) and how external
  projects adopt it
