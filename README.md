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

For a pinned version: `adopt https://github.com/winnorton/cairn@v0.4.1`

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
skill. The agent files a GitHub issue (via `gh` CLI, or drafts one for you to paste if
`gh` is unavailable) and notifies you with a link. You are not required to triage in your
working session.

Scoped strictly to cairn itself: framework gaps, confusing instructions, missing skills,
docs errors. Not for your own project's issues.

See [`plans/v0.3-observation-and-feedback-loop.md`](./plans/v0.3-observation-and-feedback-loop.md) for design rationale.

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

## Agent-readable install instructions

Agents: the canonical install script is [`adopt.md`](./adopt.md). The machine-readable file
list is [`manifest.json`](./manifest.json). Follow `adopt.md` precisely.

## Status

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
