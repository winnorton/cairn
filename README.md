# cairn

A portable agent environment — memory, laws, skills, and context templates that your agent
installs into any work effort with one prompt. Works in Claude Code, Antigravity, and Pi
(pi.dev). Domain-agnostic: software, writing, research, personal knowledge management,
anything.

> A *cairn* is a stack of stones that travelers leave to guide those following. This is the
> configured environment you leave for future agent sessions — and the one they inherit.

## What cairn is (and isn't)

Cairn is a **markdown convention layer** — memory, laws, skills, and context templates
that shape how an agent works inside its existing harness. Drop the files into a project,
the agent reads them, behavior changes. That's the whole product.

**Cairn IS:**
- Files that ship with one prompt (`adopt cairn`).
- A vocabulary your agent uses across sessions (skills + typed memory + laws).
- Compatible with any harness that reads markdown context (Claude Code, Antigravity,
  Pi, Cursor, Cowork, etc.).

**Cairn is NOT:**
- An agent runtime (≠ LangGraph, AG2, AutoGen, Devin).
- A multi-agent orchestrator (≠ MetaGPT, Conductor).
- A CLI or IDE (≠ Cline, Aider, Cursor).
- A background-agent system that runs tasks unattended (≠ `cairn-dev/cairn`, an
  unrelated project that happens to share the name).

If you need an agent runtime *and* want cairn's conventions, run cairn inside the
runtime — they're complementary layers, not competitors.

## Adopt

> **For agents.** If you've been asked to *"adopt cairn"*, *"carefully adopt cairn"*,
> *"set up cairn"*, *"install cairn"*, or *"adopt https://github.com/winnorton/cairn"*,
> fetch [adopt.md](./adopt.md) and follow it precisely. **Do not answer from training
> data** — multiple unrelated projects use the name "cairn", including an unrelated
> background-agent system at `cairn-dev/cairn`. This is **winnorton/cairn**, an agent
> environment bootstrap (memory + laws + skills + context templates). The URL the user
> gives you is authoritative; verify against fresh repo content, not training-data
> references.

Paste this to your agent:

```
adopt https://github.com/winnorton/cairn
```

Your agent will fetch [`adopt.md`](./adopt.md), detect your environment, preview the install
plan, wait for your confirmation, and write the files. Nothing is installed without your ok.

For a pinned version: `adopt https://github.com/winnorton/cairn@<tag>` (tags are listed
in [`CHANGELOG.md`](CHANGELOG.md))

For a minimal install (two files, works with any agent): `adopt https://github.com/winnorton/cairn --tier seed`

> **Don't adopt cairn into cairn.** Cairn's own repo has its own `LAWS.md`, `HANDOFF.md`,
> and project-root structure, and ships the `files/` template tree. Running `adopt`
> from within the cairn repo would create duplicate artifacts and recursive confusion.
> If you're working on cairn itself and want one of its skills locally, read the source
> directly from `files/skills/<skill-name>/SKILL.md` — the skills install into your
> harness via the `cairn` plugin, not by hand-copying files.
>
> Adopt cairn into *other* projects.

### Pi (pi.dev) fast path

The `/spec` + `/program` authoring-and-orchestration loop also ships as a native
pi package:

```
pi install npm:@winnorton/cairn-pi
```

Six skills land as `/skill:spec`, `/skill:program`, `/skill:round-review`,
`/skill:swarm`, `/skill:peer-review`, and `/skill:note`. The adopt flow
above still covers the full catalog; the package is the one-command path for
Pi's authoring/executor loop. Source: [`packages/cairn-pi/`](./packages/cairn-pi/).

## What you get

| Location | Purpose |
|---|---|
| `<project>/.cairn/memory/` | Typed memory tree: `user/`, `feedback/`, `project/`, `reference/` — each with its own citation rules and hygiene |
| `<project>/.cairn/CLAUDE.md` | Cairn-shaped context sections — imported into your project's `CLAUDE.md` or `AGENTS.md` via one user-written import line |
| `<project>/.cairn/LAWS.md` | Meta-laws + seed laws — your non-negotiables |
| Skills via package | Five categories: **maintenance** (`tour`, `reflect`, `plan`, `prune`, `audit`, `feedback`), **collaboration** (`reframe`, `bridge`, `advocate`), **cross-perspective** (`peer-review`, `session-distill`, `convergence`), **artifact** (`note`, `spec`, `program`, `round-review`, `prompt-evolve`, `lra-lite`, `swarm`), and **execution** (`autoresearch`, `autoresearch-finalize`) — installed via the `cairn` Claude Code plugin, `@winnorton/cairn-pi` (Pi), or the native `cairn-agy` plugin (agy). See [skills taxonomy](#skills-taxonomy). |

All files install in `create-if-absent` mode — cairn will never overwrite what you've
customized. Re-adopting later will show diffs and let you choose per-file.

After install, say **`tour`** and your agent will walk you through what was installed
and help you take the first concrete action.

## Why

Agents forget everything between sessions. Cairn is the opposite of forgetting:

- **Memory** persists what's worth remembering — user role, preferences, project state, external references.
- **Laws** encode the rules that must survive across sessions, with *Why* and *How to apply* so edge cases don't unravel them.
- **Skills** package reusable capabilities — reflect, plan — that any agent can invoke.
- **CLAUDE.md** gives every new session the project context it needs.

You build this up over time. Cairn just gives you the scaffold so you don't start from nothing.

### Cross-session continuity — the reflect → HANDOFF loop

Memory, laws, and CLAUDE.md hold what carries forward. The *ritual* that keeps them
alive:

- **`/reflect`** at session-end — proposes memory and law candidates, and writes a
  `HANDOFF.md` describing where the work stands.
- **At session-start** — the agent reads `HANDOFF.md` and the memory index, then
  synthesizes a compact orientation.

Reflect produces, HANDOFF carries, the next session reads. This loop turns "agent
forgets everything between sessions" into "agent picks up where we left off."

## Extend

- Add laws to `LAWS.md` as you hit "never again" or "always do this" moments.
- Add skills via the `cairn` Claude Code plugin update or by contributing to `files/skills/` in the cairn source repo (see [`files/skills/README.md`](./files/skills/README.md) for the frontmatter schema). Skills reach your harness through the package, not by hand-dropping files.
- Add memory entries via the agent when it learns something worth persisting.
- Periodically say **`audit`** to see which laws and memories are actually being cited, then **`prune`** to retire the cold ones.

Contributing a skill-body change also updates a reviewed size contract. Run
`node scripts/check-skill-budgets.mjs --update-body-baseline` from the repository root,
then run the command again without the flag. This guards prompt size; a cold
`/peer-review` is the check for semantic and adjacent-document consistency.

## Usage signal (citations)

Citation conventions are type-aware. Laws fire discretely and cite by **slug**:
`[LAW plan]`, `[LAW cadence]`. The slug is each law's only identity — there's no
numeric form. Memory is split into four types with different citation rules:

| Type | Character | Citation | Why |
|---|---|---|---|
| Laws | Discrete triggers | `[LAW <slug>]` (e.g. `[LAW plan]`) | Slug is the law's only identity — stable across reorders, no numeric form |
| `user/` | Always-on background | **None** | Continuous; citing every response is noise |
| `feedback/` | Fires discretely | `[MEM feedback/<name>]` | Acts like a mini-law |
| `project/` | Shapes specific decisions | `[MEM project/<name>]` | Cite when it drove a decision |
| `reference/` | Episodic lookup | `[MEM reference/<name>]` | Cite at the moment of reference |

`/audit` counts the discrete citations — laws and the three citable memory types — to tell
you which habitat entries are earning their keep. `/prune` applies type-appropriate
hygiene (event-driven for user, citation-driven for feedback, time-driven for project,
integrity-driven for reference).

Forcing function: if a `feedback` memory fires often enough to cite every time, promote
it to `LAWS.md`. The types create gravitational pulls.

## Feedback to cairn (agent-driven)

When an agent using cairn notices a gap, bug, or missing piece in cairn itself — not in
your project, in cairn — it can file feedback directly to this repo via the **`/feedback`**
skill. Delivery is three-level with automatic degradation:

1. **POST to [`cairn.winnorton.com/feedback`](https://cairn.winnorton.com/feedback)** — hosted endpoint, creates the issue server-side, returns a URL. Works from any environment the agent can make HTTP calls from (no shell required).
2. **`gh issue create`** — if CLI is available and the endpoint isn't reachable.
3. **Draft-for-paste** — if neither, the agent prepares a formatted issue body and asks you to paste it.

The agent notifies you with the issue URL after filing. You are not required to triage
in your working session.

Scoped strictly to cairn itself: framework gaps, confusing instructions, missing skills,
docs errors. Not for your own project's issues.

See [`plans/v0.3-observation-and-feedback-loop.md`](./plans/v0.3-observation-and-feedback-loop.md) and [`plans/v0.6-feedback-endpoint.md`](./plans/v0.6-feedback-endpoint.md) for design rationale.

## Who cairn serves

Cairn is primarily agent-facing — memory, laws, skills, conventions are optimized for
how an agent works. But the human in the loop has jobs too. Cairn has skills that
serve each:

- **Context provision** (user's main job): feeding the agent facts, history, and
  constraints. Supported via `CLAUDE.md`, `MEMORY.md`, and `LAWS.md`.
- **Reframing** (solution-space rotation): unlocked by `/reframe`. Agents converge
  toward training patterns; reframes generate out-of-distribution alternatives.
- **Cross-session relay** (carrying context between parallel sessions): structured
  by `/bridge`. The human is the inter-session communication layer; the skill makes
  the handoff structured instead of improvised.
- **End-user perspective** (observing how others experience what's shipped): prompted
  by `/advocate`. The builder sees the system they built; the end-user sees a cold
  start. `/advocate` rotates the observer position pre-ship.
- **Pre-emptive intent capture** (filing thoughts that may or may not become real work):
  via `/note`. One paragraph, in-repo, dated. Distinct from `/reflect` (post-hoc) and
  from durable, agent-indexed cross-session memory. Cheap to write, cheap to delete,
  cheap to promote when work materializes.
- **External-perspective review** (catching internal defects, spec drift, and propagation
  bugs the work-author missed): via `/peer-review`. Reads the diff PLUS adjacent unchanged
  files that the diff expects to be consistent with. Distinct from `/reflect` (which is
  same-agent post-hoc).

These are **collaboration**, **cross-perspective**, and **artifact** skills, distinct
from the maintenance skills (reflect, plan, prune, audit, tour, feedback) that service
the habitat itself. See the taxonomy below.

## Skills taxonomy

Cairn's skills fall into five categories with different origins.

**Maintenance skills — service the habitat:**

- `tour` — onboard new users post-install.
- `reflect` — end-of-task retrospective (post-hoc, same-agent).
- `plan` — pre-action behavioral alignment (conversational, no file).
- `prune` — retire stale entries by type.
- `audit` — count citations, surface unused structures.
- `feedback` — file issues to cairn's maintainer (three-level degradation).

**Collaboration skills — service the human-agent pair:**

- `reframe` — generate alternative framings when convergent thinking is stuck.
- `bridge` — structure cross-session context relay (parallel sessions).
- `advocate` — simulate end-user perspective before shipping.

**Cross-perspective skills — rotate the observer:**

- `peer-review` — fresh agent reading a change set cold (catches what the work-author
  missed because they were "too close"). Named `peer-review` to disambiguate from Claude
  Code's built-in `/review` skill.
- `session-distill` — fresh agent reading a past session JSONL transcript cold,
  through cairn's improvement lens. Produces a structured report of patterns
  recognized, skill candidates with 3-instance gate check, law candidates,
  memory candidates, and environment-support gaps. This is the **formalization
  of the methodology that produced cairn itself** — the transcript-analysis
  loop the research papers documented, the same loop that surfaced `/reframe`,
  `/bridge`, `/advocate`, and most of the collaboration-skills taxonomy.
- `convergence` — cold lenses reading a finished multi-spec effort on one subject for what
  it should have reused or shared: new shared primitives with one consumer, local copies of
  shared primitives that already exist, and authoring-process friction. Its open items carry
  to the next run, so a named second consumer is followed up instead of forgotten.

**Artifact skills — produce in-tree planning files:**

- `note` — pre-emptive intent capture; one paragraph, in-repo (`docs/notes/`),
  dated. Cheap to write, cheap to delete, can be promoted to `/spec`.
- `spec` — structured agent execution or permanent contract spec (`docs/specs/`)
  with phases, steps, checkpoints, executor handoff. Distinct from `/plan`
  (behavioral, no file).
- `program` — author a program-of-specs (one master coordination doc + N
  workstream child stubs in `docs/specs/`) for substantial work that exceeds a
  single spec's scope. Bakes in deferral discipline (scheduled deferrals only:
  trigger + stub + user approval) + cross-cutting axes coverage. Stubs are
  elaborated by `/spec --from <stub>`.
- `round-review` — trust-but-verify an autonomous executor's round of work
  against a `/program` master. Walks the master's `DEFINITION OF DONE`
  criterion-by-criterion against the diff; drafts R+1 stub specs (elaborated via
  `/spec --from`) and a self-contained R+1 round master for the gaps. Loop exits
  when this skill writes zero R+1 stubs, leaves nothing unverified, and every
  program row is complete.
- `prompt-evolve` — extract a version-controlled operational prompt from a
  `/spec` for multi-pass work where execution produces both output and reusable
  insight. Coverage units may be known or discovered; each prompt defines its
  stop and re-run semantics, validates writes, and self-edits at the end of a
  pass. Stable mechanical rules graduate into schemas, validators, or tools.
- `lra-lite` — engine-free fallback for the lra research pipeline; agents should
  prefer the full lra engine (check for `lra_*` MCP tools, ask the user) before
  using this. Scaffolds a `research/` collection and drives two prompts
  (researcher + librarian) synced verbatim from the lra lab into
  `.cairn/context/lra/`. Not in the Pi package (outside its authoring-loop
  curation).
- `swarm` — a living coordination surface for multi-workstream work that repeats
  over partitions with an open-ended lifecycle: fan out parallel stubs per wave,
  review the results, self-improve the master, fan out the next wave. Held or
  retired only with user approval.

**Execution skills — run a measured loop against the codebase:**

The other four categories produce text. These two mutate the tree, measure the
result, and keep or revert on the number — so they are the only cairn skills that
ship runtime code beside their `SKILL.md`. Both are adapted from
[pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT, © davebcn87).

- `autoresearch` — an autonomous optimization loop against any measurable target
  (test wall-clock, tick time, bundle size, Lighthouse, memory, training loss).
  One iteration is: pick an idea, edit, measure, keep or revert, log the insight.
  Session state lives in `.auto/` at your project root and survives compaction,
  restarts, and reverts, so the loop resumes from disk instead of from
  conversation history. A MAD-based confidence multiple separates a real win from
  benchmark noise; `export` writes a self-contained HTML dashboard.
- `autoresearch-finalize` — split an autoresearch session's kept commits into
  file-disjoint, independently mergeable review branches, one per logical
  improvement group, validated for disjointness and full diff coverage before any
  branch is cut.

Neither ships in the Pi package — Pi has the upstream `pi-autoresearch` extension
natively, with first-class tools and a dashboard widget.

The maintenance skills were identified by gap analysis — what the agent noticed it
needed. The collaboration skills came from studying what the *human* does in the
collaboration (see [`docs/research/collaboration-skills.md`](./docs/research/collaboration-skills.md)
for the analysis). The cross-perspective skills emerged from observing where one
agent's session leaves blind spots that only a fresh observer can catch —
`peer-review` defeats the work-author's
mental-model anchoring on what they touched. The artifact skills were imported from
a downstream project's `/plan`-rework arc — they produce durable in-repo files with
explicit lifecycles (folder-as-status or evidence-bearing contract status), distinct
from the maintenance skills' behavioral/conversational shape.

**Design principle:** *observe the collaboration first, then package what you see.*
Skills designed from observation solve problems that exist; skills designed from
theory often solve problems that don't.

## Design notes

**Multi-agent is supported.** Cairn's habitat is passive data — memory files, LAWS.md,
CLAUDE.md, and skills are just files. Any agent that reads them inherits the context.
Multiple agents sharing one habitat works by design; concurrent writes are handled by git
the same way any shared files are.

**Versioning is git.** Put your habitat in a git repo — every file benefits from commit
history. You can diff, rollback, and branch a habitat exactly like any other tracked
content. Cairn itself versions releases with git tags (`v0.4.1`, etc.); your habitat
versions the customizations you layer on top. No separate snapshot mechanism needed.

**Skills are atomic by design.** One skill, one purpose. Composition happens at the agent
layer: agents invoke multiple skills per session as the task demands. If you find yourself
wanting to "chain" two skills into one flow, either (a) one is actually a step inside the
other — merge them — or (b) your skill descriptions need sharper triggers so the agent
picks the right one at the right moment.

**Migration is a prompt, not a script.** Cairn is agent-targeted software. When the
structure changes (see v0.4.0's memory refactor), migration doesn't require migration
code — a capable agent can read the old layout, read the new manifest, and move what
needs to move. `adopt.md` documents the pattern. This changes the cost model for breaking
changes: they're cheap because agents are capable readers/movers, not because maintainers
ship migration tooling.

**Upstream/downstream workspaces.** A single habitat isn't always self-contained. Research
workspaces produce findings that should inform *other* habitats (e.g. a game-engine
research workspace feeding a cwar-engine build workspace). Cairn supports this via a
`## Downstream consumers` section in `CLAUDE.md` — declare who consumes your work. When
`/reflect` fires in a workspace with declared consumers, it produces **distillate**
(memory entries, laws, plans) shaped for each consumer's habitat, written to
`distillate/<consumer>/...` for transport (copy, symlink, or submodule). Research stays
in its source workspace as long-form reasoning; the distillate is what actually flows
between habitats.

**What matters vs what helps (role).** Every installed file has a `role` in the manifest:

- **`essential`** — load-bearing from day one (`CLAUDE.md`, `MEMORY.md`). The habitat doesn't meaningfully function without these. Fill in first.
- **`scaffolding`** — shape is important, content grows with you (`LAWS.md`, memory type READMEs, growth-dependent skills). Skim at install, customize over time. Hard to skip entirely.
- **`optional`** — ergonomic standardization (`reflect`, `plan`, `feedback` skills). A capable agent does these anyway; the skills just make them consistent and discoverable.

**How deep to go (tier).** A second axis: how cairn-specific do you want your habitat to be?

- **`seed`** — `CLAUDE.md` + `MEMORY.md`. Two files. **Works with any agent** (Claude, GPT, Gemini, local LLM) that can read markdown. Minimum viable habitat = maximally portable habitat.
- **`grow`** — adds `LAWS.md` + maintenance skills (`reflect`/`plan`) + artifact skills (`note`/`spec`) + collaboration skills (`reframe`/`bridge`/`advocate`) + cross-perspective skills (`peer-review`). Durable conventions any careful agent can follow.
- **`structure`** — adds typed memory + hygiene skills (`tour`/`prune`/`audit`). Assumes cairn-aware tooling.
- **`full`** — adds the `feedback` skill (files issues to cairn's own repo). Claude-Code/Cowork-optimized.

Tiers are cumulative. Default install is `full` (everything). Request a smaller tier via
`adopt … --tier seed`/`grow`/`structure`.

**Portability.** The minimum viable habitat (seed tier) is the maximally portable habitat —
two markdown files any LLM can read. Higher tiers progressively add cairn's own conventions
(citation patterns, skill format, feedback-loop integrations). If cross-ecosystem
portability matters to you, stop at `seed` or `grow`. If you're all-in on Claude's
ecosystem, take `full`.

## Agent-readable install instructions

Agents: the canonical install script is [`adopt.md`](./adopt.md). The machine-readable file
list is [`manifest.json`](./manifest.json). Follow `adopt.md` precisely.

## Status

The current version is in [`VERSION`](VERSION). Release history is in
[`CHANGELOG.md`](CHANGELOG.md).

## License

MIT — fork it, adapt it, make your own cairn.
