# Skills — cairn

Skills are reusable capabilities an agent can invoke mid-session. Each skill is a single
markdown file with YAML frontmatter at the top. The frontmatter's `description` field is
what the agent uses to decide whether the skill matches the current task.

## Shape of a skill file

```markdown
---
name: skill-name
description: One-sentence description used by the agent to decide relevance. Be specific.
  Include trigger phrases and anti-triggers ("skip when X") so the agent can self-filter.
---

# Skill Name

<Instructions for the agent when this skill is invoked.>

## When to use

<Specific situations — anchor to observable cues, not vibes.>

## Steps

1. ...
2. ...

## Output

<What the agent should produce when the skill completes.>
```

## Authoring notes

- **Descriptions matter more than content.** The agent decides whether to invoke based on
  the description. A vague description means the skill either never fires or fires at the
  wrong time. Include negative signals ("do NOT use for X") as well as positive.
- **Keep the skill body tight.** Agents load skill bodies only when invoking. Terse
  instructions beat paragraphs — the agent fills in the gaps.
- **One skill, one purpose.** Splitting "reflect" and "plan" into separate skills lets
  the agent invoke just the one relevant to the moment.

## Built-in skills (from cairn)

Cairn's skills fall into two categories:

### Maintenance skills — service the habitat itself

Help the agent keep its environment clean, current, and useful.

- `tour.md` — onboard new users post-install.
- `reflect.md` — end-of-task retrospective.
- `plan.md` — structured pre-flight before execution.
- `prune.md` — retire stale entries by type.
- `audit.md` — count citations, surface unused structures.
- `feedback.md` — file issues to cairn's maintainer (three-level degradation).

### Collaboration skills — service the human-agent pair

Help the human do their part of the work, or help the agent support the human's
cognitive process. The maintenance skills existed from v0.1 and were identified by
agent self-observation (gap analysis). The collaboration skills came from studying
what the *human* actually does in the collaboration.

- `reframe.md` — generate alternative framings when the agent is stuck on one axis.
- `bridge.md` — structure cross-session context relay.
- `advocate.md` — simulate end-user perspective before shipping.

Design principle: **observe the collaboration first, then package what you see.**
Skills designed from observation solve problems that exist; skills designed from
theory often solve problems that don't.

Add your own by dropping new `.md` files into this directory with the frontmatter
shape above.
