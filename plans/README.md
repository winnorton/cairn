# Plans

Release-shaped plan artifacts for cairn's own development. Captures the design
rationale, what shipped, and what was skipped per release.

Distinct from `docs/specs/` (executor handoffs) and `docs/notes/` (single-paragraph
intent capture). Plans here are *release plans* — one per cairn version that introduced
substantive design, written before or alongside the release commit.

## Folder-as-status (no `Status:` field)

| Folder | Meaning |
|---|---|
| `plans/` (here) | Active drafts for in-flight releases. Empty until a new release is being planned. |
| `plans/archive/` | Shipped releases. `git mv` is the ship signal. |

## Filename pattern

```
vX.Y-<topic>.md
```

Topic is the headline change for that release. Examples in `archive/`:
[v0.3-observation-and-feedback-loop](archive/v0.3-observation-and-feedback-loop.md),
[v0.4-typed-memory](archive/v0.4-typed-memory.md),
[v0.5-graduated-tiers](archive/v0.5-graduated-tiers.md),
[v0.6-feedback-endpoint](archive/v0.6-feedback-endpoint.md),
[v0.7-collaboration-skills](archive/v0.7-collaboration-skills.md),
[v0.8-upstream-downstream](archive/v0.8-upstream-downstream.md),
[v0.9-law-slugs](archive/v0.9-law-slugs.md),
[v0.10-session-handoff](archive/v0.10-session-handoff.md),
[v0.12-cairn-from-cwar-arc](archive/v0.12-cairn-from-cwar-arc.md).

## Relationship to docs/specs/ and docs/research/

- **`plans/`** captures release-shaped *design rationale* — the "why this release, why
  this shape, what was skipped." Written by the maintainer, not an executor.
- **`docs/specs/`** captures *executor handoffs* — phases/steps/checkpoints. Written
  for an agent to follow mechanically.
- **`docs/research/`** captures *findings* — papers analyzing the project from inside
  the habitat. Source material for design decisions but not action plans.

A v0.X release often has all three: a plan here, supporting specs in `docs/specs/`,
research that grounds the design in `docs/research/`. Most recent releases (v0.11.x,
v0.13.x) skipped the plan layer when the design was small enough to live in commit
messages + the release line in [README's Status section](../README.md#status).

## When to add a plan here

Add a plan in this folder when:

- The release introduces a new conceptual dimension (typed memory, tiers, taxonomies)
  rather than a bug fix or small feature.
- The "what was skipped" section will be load-bearing for the next release's design.
- The plan captures decisions worth re-reading later (per [LAW load-meta-laws]).

Skip the plan layer for doc-only releases or patch-level bumps — the release-line entry
in the README's Status section is enough.
