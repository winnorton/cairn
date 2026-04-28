# Reference memory

**Character:** episodic lookups. External pointers — URLs, ticketing systems, dashboards,
docs, Slack channels, Linear projects. Agent looks them up when the task triggers; otherwise
they sit dormant.

**Citation:** `[MEM reference/<name>]` at the moment of reference, in **durable output**
(the file, note, or commit where the reference is actually being cited). "Per
[MEM reference/linear_ingest], this bug would be tracked there" — cite when you point
the user or yourself at the external resource, and write the citation into the
artifact you're producing. Citations that stay only in the conversation produce no
audit signal.

**Hygiene:** integrity-driven. References decay because the thing they point to moves or
dies. `/prune` should periodically validate that the referenced resources still exist —
though that may require web fetch or user confirmation.

## When to save reference memory

- User mentions an external system and what it's used for ("bugs go in Linear INGEST,"
  "oncall dashboard is at grafana.internal/..."). Save the pointer + its purpose.
- Repeatedly-referenced URLs that save the agent from asking or guessing.
- Channel/project/board pointers that scope work context.

## Shape of an entry

```markdown
---
name: linear_ingest
description: Pipeline bugs tracked in Linear project INGEST.
type: reference
---

Pipeline bugs live in Linear project **INGEST**. Check there for context on pipeline
tickets before filing duplicates or making design assumptions.

Link: https://linear.app/<workspace>/team/INGEST
```

Keep entries short — name + description + URL + one sentence on what it's for. Anything
deeper belongs in the external system itself, not cached here.

## Hygiene note

If you cite a reference and the link 404s or the system has been renamed, update or retire
the memory. Referring to dead resources is worse than not knowing they exist.
