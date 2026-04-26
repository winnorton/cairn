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

Cairn's skills fall into three categories:

### Maintenance skills — service the habitat itself

Help the agent keep its environment clean, current, and useful.

- `tour.md` — onboard new users post-install.
- `reflect.md` — end-of-task retrospective.
- `plan.md` — pre-action behavioral alignment.
- `prune.md` — retire stale entries by type.
- `audit.md` — count citations, surface unused structures.
- `feedback.md` — file issues to cairn's maintainer (three-level degradation).
- `resume.md` — detect and load handoff context from a previous session.

### Collaboration skills — service the human-agent pair

Help the human do their part of the work, or help the agent support the human's
cognitive process. The maintenance skills existed from v0.1 and were identified by
agent self-observation (gap analysis). The collaboration skills came from studying
what the *human* actually does in the collaboration.

- `reframe.md` — generate alternative framings when the agent is stuck on one axis.
- `bridge.md` — structure cross-session context relay.
- `advocate.md` — simulate end-user perspective before shipping.

### Artifact skills — produce in-tree planning files

Help the agent capture intent and structure execution as durable in-repo files (not just
conversation state). Distinct from maintenance skills like `/plan` or `/reflect` which
are behavioral/conversational. These produce files that ship with the codebase, get
seen by anyone who clones the repo, and have explicit lifecycles (folder-as-status:
`notes/` and `specs/` are active, `archive/` is shipped).

- `note.md` — file a quick thought, debug finding, or feature sketch as a single-paragraph
  in-tree capture (`docs/planning/notes/`). Cheap to write, cheap to delete, can be
  promoted to a spec when work begins.
- `spec.md` — write a structured agent execution spec (`docs/planning/specs/`) with phases,
  steps, checkpoints, executor handoff. Distinct from `plan.md` (behavioral alignment) —
  `spec.md` produces a file the executor follows.

These skills came from observing the cwar-engine project's `/plan` rework (PRs #5, #7, #9,
#10): the original single-verb `/plan` was used both for one-paragraph thoughts and for
heavy executor handoffs, producing 49 stale `PLAN_*.md` files with ~75% drift between
claim and shipped reality. Splitting into two verbs closes per-file friction; the
companion `planning-gate` audit (worked example: cwar's `tools/docs-audit.ts`) closes
the lifecycle hole. See those skill files' "Worked examples" sections for the source PRs.

Design principle: **observe the collaboration first, then package what you see.**
Skills designed from observation solve problems that exist; skills designed from
theory often solve problems that don't.

Add your own by dropping new `.md` files into this directory with the frontmatter
shape above.
