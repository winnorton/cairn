# Memory Index

Memory is organized into four types, each with its own character, citation convention,
and hygiene rules. This asymmetry matters: user memory is continuous background; feedback
memory fires discretely; project memory shapes specific decisions; reference memory is
looked up on demand. Treating them uniformly forces all of them into the worst-fitting
convention.

- **[user/](user/README.md)** — who you are (role, profile, expertise, long-held preferences).
  Always-on background. **No citation.** Prune when your situation changes, not by usage.

- **[feedback/](feedback/README.md)** — collaboration preferences and lessons learned.
  Fires discretely, like a mini-law. **Cite `[MEM feedback/<name>]` when applying.**
  Audit tracks citation frequency; prune retires uncited entries.

- **[project/](project/README.md)** — current work state (goals, deadlines, active focus,
  stakeholders). **Cite `[MEM project/<name>]` when it shapes a specific decision.**
  Prune frequently as project state evolves.

- **[reference/](reference/README.md)** — external pointers (URLs, ticketing systems,
  docs). Episodic lookups. **Cite `[MEM reference/<name>]` at the moment of reference.**
  Prune when the external resource moves or dies.

## Adding an entry

Put the new file in the appropriate subdirectory. Each type's `README.md` documents its
conventions in more detail. Every entry file uses this frontmatter shape:

```markdown
---
name: <short name>
description: <one-line description used to decide relevance>
type: user | feedback | project | reference
---

<body>
```

The type in frontmatter should match the subdirectory — they're redundant but reinforce each
other. The subdirectory is authoritative; the frontmatter `type` is a belt-and-suspenders check.

## Guiding principle

If a memory feels important enough to cite *every time it fires*, it probably belongs in
`LAWS.md` as a law, not in memory. The types create a gravitational pull:

- Cite every time + binary compliance → **law**
- Cite discretely when applied → **feedback memory**
- Cite when it drives a specific decision → **project memory**
- Cite at lookup → **reference memory**
- Never cite (always-on) → **user memory**

## Where memory should live: slug policy

When you work on a single project, this question doesn't matter — everything goes
at one slug. When work spans projects (shared tooling informing multiple efforts,
side projects relating to a primary one), choose slug by **scope of what's being
remembered**:

- **Project-specific facts** (codebase conventions, ongoing decisions, project
  state, references to project-internal resources) → store at *this project's*
  slug.
- **Cross-cutting agent-meta-knowledge** (collaboration patterns, reframing,
  general principles that apply regardless of which project) → pick one slug
  (usually the project where the insight first emerged) and **declare a pointer
  in `HANDOFF.md`'s `## Related memory paths` section** so other projects'
  `/resume` invocations find them. Don't duplicate across slugs — two sources of
  truth drift the moment one is edited.
- **Per-worktree** (rare — work that's genuinely scoped to a single worktree) →
  use the worktree's slug. Most worktree work is project-scoped, not
  worktree-scoped; default to parent project's slug unless there's a reason.

The `HANDOFF.md` `## Related memory paths` mechanism + `/resume` skill solve
cross-slug discovery without forcing duplication. Use them; don't work around them.

When uncertain: pick the project where the work artifact is being produced. Let
`HANDOFF.md` handle the cross-references.

## Where citations must live

Citations go in **durable output** — files the agent writes or edits, notes,
commits, research documents — because that's what `/audit` can scan. Citations
in conversational responses that don't reach disk produce zero audit signal.
Say it in the reply if you want; write it in the file that was shaped by the
memory if you want that usage to count.
