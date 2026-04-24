# Feedback memory

**Character:** fires discretely, like a mini-law. Collaboration preferences, lessons learned,
"do this / don't do that" rules that survive across sessions.

**Citation:** `[MEM feedback/<name>]` when applying, in **durable output you write**
(files, notes, commits — not just in your conversational reply). Works the same way
`[LAW N]` works — discrete trigger, discrete citation, real signal for `/audit`.
Citations that don't reach disk contribute no audit signal.

**Hygiene:** citation-driven + semantic. `/audit` flags uncited-over-time entries; `/prune`
reviews them plus any entries whose motivation has become obsolete.

## When to save feedback memory

- User corrects your approach ("no, don't do X") — save with the *why* so you can judge
  edge cases later.
- User confirms a non-obvious approach worked ("yes exactly, keep doing that") — save as
  validated judgment, not just a correction.
- Patterns in how the user wants to collaborate (terseness, planning cadence, tone).

## Shape of an entry

```markdown
---
name: terse_responses
description: User prefers terse, action-oriented responses; no trailing summaries.
type: feedback
---

User wants terse responses with no trailing summaries of what was just done.

**Why:** user said "I can read the diff" after a verbose summary response — they see the
tool output directly and summaries waste their time.

**How to apply:** end-of-turn = one or two sentences on what changed and what's next.
No recaps of each step taken.
```

**Lead with the rule, then Why, then How to apply.** Without the why, you can't judge
edge cases. Without the how-to-apply, agents over-apply or miss the trigger.

## Boundary with laws

If a feedback-memory rule feels load-bearing enough that violating it would break the
project or workflow, it belongs in `LAWS.md` as a law. The difference is blast radius,
not structure.
