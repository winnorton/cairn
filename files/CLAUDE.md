# [Project / Effort Name] — Agent Context

<!--
  This file is loaded into every agent session in this project.
  Everything here should survive across sessions and be true regardless of the current task.

  Keep it tight. Agents have limited context. If something is long-form, put it in a
  linked doc and reference it here with a one-line pointer.
-->

## What this is

<!-- One short paragraph: the purpose of this work effort, who it's for, what "done" looks like. -->

## Quick start

<!--
  If this project has commands, entry points, or rituals for starting work, list them here.
  Examples: `npm run dev`, `open notes/inbox.md`, `read the brief at docs/brief.md`.
  If the work is non-code, list the canonical "how I begin a session" steps.
-->

## Layout

<!--
  The shape of the work. For code: directory overview. For a writing project: chapters / drafts folder.
  For research: sources, working docs, deliverables. Keep it to the top-level structure.
-->

## Conventions

<!--
  Rules specific to this effort. Naming, format, style. Point to LAWS.md for hard rules.
  This section is for "the way we do things here" — soft conventions, not non-negotiables.
-->

## Hard rules

See [LAWS.md](agents/LAWS.md) for the non-negotiable rules for this effort.

## Notes vs cross-session memory

Two filing destinations exist for thoughts the agent (or human) wants to preserve, and
they answer different questions:

- **`/note`** writes to `docs/notes/` in *this repo*. The note travels with the codebase,
  is visible to anyone who clones, and is right for thoughts bound to a specific
  file/system in this project. File-bound, repo-visible.
- **Cross-session memory** writes to `agents/memory/` in *this repo* (typed: `user/`,
  `feedback/`, `project/`, `reference/`). Git-tracked, visible to anyone who clones,
  agent-readable across sessions. Right for facts that shape future agent reasoning
  about this project regardless of what file they're touching. Cross-machine sync
  comes free with `git push`/`git pull`.

Both destinations are repo-tracked. The distinction is *file-bound observation*
(`/note`) vs *facts that shape future reasoning* (memory).

## Related context

<!--
  Pointers to external systems the agent may need: issue trackers, docs sites, shared drives.
  Keep entries one line each so agents can scan quickly.
-->

## Downstream consumers

<!--
  OPTIONAL. Use only if this workspace's work is meant to inform OTHER habitats — e.g.,
  a research workspace producing findings for a build workspace; an upstream design
  effort feeding a downstream implementation.

  When /reflect fires, declared downstream consumers trigger an extra distillation step:
  memory entries, laws, and plans are proposed in the SHAPE of the consumer's habitat,
  not just this one's. The distillate is written to distillate/<consumer>/... for
  transport (copy, symlink, or git submodule).

  Format:
  - **<consumer-name>** (`<path-or-URL>`) — one-line description of what research
    from this workspace applies there.

  Example:
  - **cwar-engine** (`~/projects/cwar/cwar-engine`) — game engine being built;
    findings about rendering, ECS, architecture apply there.

  Remove this section (header and comment) if this workspace has no downstream consumers.
-->
