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

- `reflect.md` — pause and take stock: what's been learned, what to remember, what to adjust.
- `plan.md` — before executing, state the plan and get approval.

Add your own by dropping new `.md` files into this directory with the frontmatter shape above.
