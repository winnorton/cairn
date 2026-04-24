# User memory

**Character:** continuous background. Shapes every response.

**Citation:** **none.** User memory is always-on; citing it every time would be performative
noise with no signal.

**Hygiene:** event-driven. Prune when the user's situation changes — role shift, career
change, new expertise area, dropped context. Don't prune by citation count (there are none
and there shouldn't be).

## When to save user memory

- User tells you about their role, expertise, work style, preferences.
- Long-held facts that will inform most future sessions (e.g., "works in TypeScript,"
  "is a senior SRE," "new to React").
- Avoid saving ephemeral task state — that's project memory.

## Shape of an entry

```markdown
---
name: user_role
description: Senior SRE at a fintech; deep Go; new to React this quarter.
type: user
---

User is a Senior Site Reliability Engineer at Acme Fintech. Eight years of Go; started
touching React in Q1 2026 after a team reshuffle. Frame frontend explanations in terms
of backend analogues.
```

Keep entries tight — agents load the whole file every session.
