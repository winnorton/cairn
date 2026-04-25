# cairn

A portable agent environment — memory, laws, skills, and context templates that your agent
installs into any work effort with one prompt. Works in Claude Code and Cowork.
Domain-agnostic: software, writing, research, personal knowledge management, anything.

> A *cairn* is a stack of stones that travelers leave to guide those following. This is the
> configured environment you leave for future agent sessions — and the one they inherit.

## Adopt

Paste this to your agent:

```
adopt https://github.com/winnorton/cairn
```

Your agent will fetch [`adopt.md`](./adopt.md), detect your environment, preview the install
plan, wait for your confirmation, and write the files. Nothing is installed without your ok.

For a pinned version: `adopt https://github.com/winnorton/cairn@v0.10.1`

For a minimal install (two files, works with any agent): `adopt https://github.com/winnorton/cairn --tier seed`

## What you get

| File | Purpose |
|---|---|
| `~/.claude/memory/` | Typed memory tree: `user/`, `feedback/`, `project/`, `reference/` — each with its own citation rules and hygiene |
| `<project>/CLAUDE.md` | Project context template — fill in per effort |
| `<project>/.claude/LAWS.md` | Meta-laws + 6 seed laws — your non-negotiables |
| `~/.claude/skills/` | Two categories: **maintenance** (`tour`, `reflect`, `plan`, `prune`, `audit`, `feedback`) + **collaboration** (`reframe`, `bridge`, `advocate`) — see [skills taxonomy](#skills-taxonomy-maintenance-vs-collaboration) below |

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

## Extend

- Add laws to `LAWS.md` as you hit "never again" or "always do this" moments.
- Add skills by dropping a `.md` file into `~/.claude/skills/` with YAML frontmatter (see [`files/skills/README.md`](./files/skills/README.md)).
- Add memory entries via the agent when it learns something worth persisting.
- Periodically say **`audit`** to see which laws and memories are actually being cited, then **`prune`** to retire the cold ones.

## Usage signal (citations)

Citation conventions are type-aware. Laws fire discretely and cite by **slug**, not number —
numbers drift when laws are reordered; slugs are stable: `[LAW plan]`, `[LAW cadence]`.
Memory is split into four types with different citation rules:

| Type | Character | Citation | Why |
|---|---|---|---|
| Laws | Discrete triggers | `[LAW <slug>]` (e.g. `[LAW plan]`) | Stable across reorders — numbers are display-order only |
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

These are **collaboration skills**, distinct from the maintenance skills (reflect,
plan, prune, audit, tour, feedback) that service the habitat itself. See the
taxonomy below.

## Skills taxonomy: maintenance vs collaboration

Cairn's skills fall into two categories with different origins.

**Maintenance skills — service the habitat:**

- `tour` — onboard new users post-install.
- `reflect` — end-of-task retrospective.
- `plan` — structured pre-flight before execution.
- `prune` — retire stale entries by type.
- `audit` — count citations, surface unused structures.
- `feedback` — file issues to cairn's maintainer (three-level degradation).

**Collaboration skills — service the human-agent pair:**

- `reframe` — generate alternative framings when convergent thinking is stuck.
- `bridge` — structure cross-session context relay (parallel sessions).
- `advocate` — simulate end-user perspective before shipping.
- `resume` — detect and load context from a previous session (sequential sessions).

The maintenance skills were identified by gap analysis — what the agent noticed it
needed. The collaboration skills came from studying what the *human* does in the
collaboration (see [`docs/research/collaboration-skills.md`](./docs/research/collaboration-skills.md)
for the analysis).

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
- **`grow`** — adds `LAWS.md` + `reflect`/`plan` skills. Durable conventions any careful agent can follow.
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

v0.10.1 — `/resume` validation surfaced two gaps; both fixed. (1) HANDOFF.md drifted
within one release cycle ("v0.9.1" inside HANDOFF.md while main was on v0.10.0) — new
seed law `handoff-stays-current` in cairn's own `LAWS.md` requires HANDOFF.md to update
in the same commit as VERSION/manifest/README. (2) `/resume` couldn't find memory
written under a different project's slug — extended the skill to read a `## Related
memory paths` section from HANDOFF.md and probe those paths too. cairn's HANDOFF.md
now declares cwar's memory slug explicitly, so a fresh `/resume` in cairn finds the
session's memory entries.

v0.10.0 — `/resume` skill for session-to-session handoff. The first link test (a fresh
session opening in a different worktree, asking "where were we?") FAILED to auto-discover
prior context because: (1) memory is namespaced per-worktree; (2) `HANDOFF.md` requires
explicit knowledge of where to look; (3) transcript junctions are ad-hoc. `/resume`
codifies the probe — checks HANDOFF.md at common paths, memory at multiple project slugs
(worktree-aware), transcript junctions, and recent git activity, then synthesizes a
compact orientation. Agents now have a named protocol for "pick up where we left off."
See `plans/v0.10-session-handoff.md`.

v0.9.1 — Session-close release: cairn's own LAWS.md (at repo root — framework eats its
own dog food), LAWS.md template credit note pointing at `NEW_LAWS_OF_AI_AGENT_ENGINEERING`
as the meta-disciplinary source, `HANDOFF.md` for session-to-session bridging, and #15
closed (userSkills dual-scope path detection parallel to #6's memory fix).

v0.9.0 — Slug-based law identity (#18). Laws now cite by stable slug (`[LAW plan]`,
`[LAW cadence]`) instead of drift-prone numbers. Numbers remain as display-order markers.
`/audit` matches both forms during transition. Evidence: cwar's AGENTS.md renumbered
26→22→13 rules in one day, leaving citation debt in ESLint comments and cross-file
references — cairn preempts the same pattern. See `plans/v0.9-law-slugs.md`.

v0.8.0 — Reflection cadence + upstream/downstream distillation (closes #14 + #17).
`/reflect` now triggers proactively at natural checkpoints (not only on explicit user
request) and produces distillate for declared downstream consumer habitats. New
optional `## Downstream consumers` section in `CLAUDE.md` template. Sixth seed law
added: "Pause to reflect at natural checkpoints." Addresses the root cause observed
when a research agent produced 1,600+ lines of work and zero memory entries —
reflection wasn't firing. See `plans/v0.8-upstream-downstream.md`.

v0.7.0 — Collaboration skills + taxonomy (#16). Systematic analysis of the cairn build
transcript surfaced three more skills that serve the human-agent pair: `/bridge`
(cross-session relay), `/advocate` (end-user perspective), and a `/plan` enhancement
for timing awareness. Introduces the maintenance-vs-collaboration taxonomy explicitly
in README and skills/README. Adds `collaboration-skills.md` and `human-interaction-patterns.md`
to `docs/research/`. See `plans/v0.7-collaboration-skills.md`.

v0.6.4 — Cite in durable output, not just in conversation (#13). First cross-session
habitat transfer observation revealed that `[LAW prefer-edit]` (formerly `[LAW 4]`) fired in live transcript but
left no trace on disk — `/audit` was blind despite the habitat actively shaping
behavior. LAWS.md meta-rule 5, memory type READMEs, and audit.md now specify
citations must appear in files/notes/commits to feed the audit loop. Adds
`habitat-transfer.md` and `cross-session-observation.md` to `docs/research/`.

v0.6.3 — Install must fetch files via HTTP, not heredoc inline (#12). adopt.md
Step 5 now explicitly rules out `cat > file << EOF ... EOF` patterns and mandates
`curl -sL {rawBase}/{src} > {dest}` (or equivalent). Adoption time drops from
minutes to seconds when agents follow the correct path.

v0.6.2 — adopt.md no longer invites agents to render a tier picker (#11). First-time
install is default-full with a single y/n confirmation; tier flags documented as
invocation-only forms.

v0.6.1 — Feedback endpoint live + multi-URL fallback. Deployed to Cloud Run;
manifest now lists both the Cloud Run direct URL and `cairn.winnorton.com` (custom
domain, pending CNAME propagation) so agents always have a working primary. Skill
tries URLs in array order, falls through on DNS/network/5xx.

v0.6.0 — Hosted feedback endpoint (cairn-side wiring). Handler code + Cloud Run
deployment guide in `server/feedback-endpoint/`. See `plans/v0.6-feedback-endpoint.md`.

v0.5.1 — `/reframe` skill + "Who cairn serves" framing (#9). Cairn now directly
supports the user's reframing job (not just context provision). Skill generates 2–4
alternative framings on request — helps humans rotate the solution space when
convergent thinking is stuck.

v0.5.0 — Graduated tiers (#8). Every installed file tagged with a `tier` alongside
`role`. Four tiers: `seed` (two-file minimum viable = maximally portable habitat),
`grow` (adds laws + process skills), `structure` (adds typed memory + hygiene),
`full` (adds cairn-ecosystem integration). Default install unchanged (full); users who
want portable minimal now have `--tier seed`. See `plans/v0.5-graduated-tiers.md`.

v0.4.3 — Roles: every installed file tagged `essential | scaffolding | optional` (#7).
Install preview groups by role; README's Design notes explains what matters vs what
helps.

v0.4.2 — Memory path dual-scope detection (#6). `adopt.md` Step 1 and `manifest.json`
now document that Claude Code has two memory conventions (user-global vs project-scoped)
and require probing before installing. Silent-failure gap closed.

v0.4.1 — Agent-driven migration as a first-class path (#5). `adopt.md` now documents the
migration flow (detect → plan → execute → verify) including index-tombstoning for
environments without deletion support. Cowork Step 3 also distinguishes bash mount from
memory store with per-layer tool guidance.

v0.4.0 — Typed memory (#4). Memory splits into `user/`, `feedback/`, `project/`, and
`reference/` subdirectories with per-type citation conventions. `/audit` and `/prune`
are per-type aware. See `plans/v0.4-typed-memory.md`.

v0.3.3 — Version marker + re-adoption fast-path (#3).
v0.3.2 — Explicit doc-only re-adoption case (#2).
v0.3.1 — Cowork `.claude/` write protection + shell fallback (#1).
v0.3.0 — citation convention, `audit`, `feedback`.

## License

MIT — fork it, adapt it, make your own cairn.
