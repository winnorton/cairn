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

For a pinned version: `adopt https://github.com/winnorton/cairn@v0.6.0`

For a minimal install (two files, works with any agent): `adopt https://github.com/winnorton/cairn --tier seed`

## What you get

| File | Purpose |
|---|---|
| `~/.claude/memory/` | Typed memory tree: `user/`, `feedback/`, `project/`, `reference/` — each with its own citation rules and hygiene |
| `<project>/CLAUDE.md` | Project context template — fill in per effort |
| `<project>/.claude/LAWS.md` | Meta-laws + 5 seed laws — your non-negotiables |
| `~/.claude/skills/` | Starter skills: `tour`, `reflect`, `plan`, `prune`, `audit`, `feedback` (drop in more) |

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

Citation conventions are type-aware. Laws fire discretely, so they cite inline — `[LAW 3]`.
Memory is split into four types with different citation rules:

| Type | Character | Citation | Why |
|---|---|---|---|
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
how an agent works. But the human in the loop has jobs too, and cairn targets one of
them directly:

- **Context provision** (user's main job): feeding the agent facts, history, and
  constraints. Cairn supports this via `CLAUDE.md`, `MEMORY.md`, and `LAWS.md`.
- **Reframing** (user's other job): rotating the solution space when the agent is
  converging toward a wrong answer. Agents converge toward training patterns;
  reframes unlock out-of-distribution solutions. The **`/reframe`** skill directly
  supports this: user invokes, agent generates 2–4 alternative framings, user picks
  one to explore.

Reframing is not context provision. It's a different cognitive move and cairn treats
it as such.

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

v0.6.0 — Hosted feedback endpoint. `/feedback` skill now POSTs to
`https://cairn.winnorton.com/feedback` as the primary delivery path; `gh` CLI and
user-paste remain as graceful fallbacks. Handler code + Cloud Run deployment guide
in `server/feedback-endpoint/`. Deployment pending; cairn-side wiring shipped.
See `plans/v0.6-feedback-endpoint.md`.

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
