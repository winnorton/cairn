# Project memory

**Character:** current work state. Active goals, deadlines, in-flight decisions, stakeholders,
ongoing initiatives. Changes as the project moves — faster than user or feedback memory.

**Citation:** `[MEM project/<name>]` when it shapes a specific decision, **in the
durable output that records that decision** (file, note, commit, doc). Don't cite
just because project memory is "relevant" — cite when it actually drove what you did
or didn't do, and write the citation into the artifact of that doing. Citations in
conversational replies that don't reach disk produce no audit signal.

**Hygiene:** time-driven. Project state goes stale fast. `/prune` should visit project
memory more often than other types.

## Where to save: flat vs project-subdir

Under v0.14+, cairn memory is **project-local** at `<project>/.cairn/memory/` — one store
per repo, no slugs; use the flat shape `project/<entry>.md`, citation `[MEM project/<name>]`.

The two cases below are **legacy (pre-v0.14)** guidance for the user-global stores cairn used
before the `.cairn/` move — relevant only if you maintain a shared store outside the project.

- **Slug-separated stores** (a per-project-slug store the harness separates by slug)
  — keep flat. The slug already separates projects; subdirs would duplicate that. Path
  shape: `project/<entry>.md`. Citation: `[MEM project/<name>]`.

- **Cross-project user-global stores** *(legacy, pre-v0.14 — under v0.14+ cairn memory is
  project-local at `<project>/.cairn/memory/`; this case applies only to a shared store you
  maintain OUTSIDE the project — e.g. a harness's own global memory directory shared
  across every project)* — use a `project/<project-name>/` subdirectory layer. Every workspace
  shares one tree, so without subdirs, entries from cwar-engine, cairn, and any
  side-project pile flat and become unsearchable past ~20 entries. Path shape:
  `project/<projectname>/<entry>.md`. Citation: `[MEM project/<projectname>/<name>]`.

The `<projectname>` is conventionally the producing workspace's directory basename
(e.g. `cwar-engine`, `cairn-mcp-server`). Pick by who shares the store: if memory
is *only this project's*, flat; if *multiple projects* share the tree, subdir.

## When to save project memory

- User tells you about deadlines, initiatives, blockers, deliverables.
- Decisions made that shape the work ("we decided to rip out auth middleware because
  legal flagged session-token storage").
- Stakeholders and their constraints.

Avoid saving:
- Code patterns or architecture (derivable from the code).
- Git history (authoritative in the repo).
- Debugging fixes (the fix is in the code).

## Shape of an entry

```markdown
---
name: merge_freeze
description: Merge freeze Mar 5 for mobile release cut; flag non-critical PRs after.
type: project
---

Merge freeze begins 2026-03-05 for mobile release cut.

**Why:** mobile team needs stability for the release branch; anything merged after may
not make this release cycle.

**How to apply:** for PRs scheduled after 2026-03-05, check whether the change is
critical. If not, suggest waiting until after the release.
```

**Convert relative dates to absolute dates** when saving ("Thursday" → "2026-03-05"). Relative
dates rot fast — absolute dates stay interpretable.

## Hygiene note

When a deadline passes or a project phase ends, retire the memory or mark it as historical.
Carrying stale project memory into a new phase is the most common source of bad agent
behavior from stale context.
