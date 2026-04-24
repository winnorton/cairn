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
