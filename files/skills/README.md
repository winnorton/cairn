# Skills — cairn

Skills are reusable capabilities an agent can invoke mid-session. As of v0.12.1, each skill
is a **subdirectory** containing a `SKILL.md` file with YAML frontmatter at the top:

```
~/.claude/skills/<name>/SKILL.md
```

The `description` field in frontmatter is what the agent uses to decide whether the skill
matches the current task. The subdirectory shape allows shipping supporting files (templates,
examples, scripts) alongside the skill itself.

> **v0.12.0 format change.** Earlier cairn versions shipped flat `~/.claude/skills/<name>.md`.
> Claude Code's canonical format is `<name>/SKILL.md`, and flat-format skills don't
> reliably register as slash commands. v0.12.x ships under the new format. If you have an
> earlier cairn install, the v0.12 install adds the new subdir form alongside your existing
> flat files; you can remove the flat duplicates at your leisure (see `adopt.md`).

## Shape of a SKILL.md file

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

Cairn's skills fall into four categories. Each addresses a different gap-class.

### Maintenance skills — service the habitat itself

Help the agent keep its environment clean, current, and useful.

- `tour/` — onboard new users post-install.
- `reflect/` — end-of-task retrospective (post-hoc, same-agent).
- `plan/` — pre-action behavioral alignment (conversational, no file produced).
- `prune/` — retire stale entries by type.
- `audit/` — count citations, surface unused structures.
- `feedback/` — file issues to cairn's maintainer (three-level degradation).

### Collaboration skills — service the human-agent pair

Help the human do their part of the work, or help the agent support the human's
cognitive process. The maintenance skills existed from v0.1 and were identified by
agent self-observation (gap analysis). The collaboration skills came from studying
what the *human* actually does in the collaboration.

- `reframe/` — generate alternative framings when convergent thinking is stuck.
- `bridge/` — structure cross-session context relay (parallel sessions).
- `advocate/` — simulate end-user perspective before shipping.

### Cross-perspective skills — rotate the observer

These rotate WHO is looking at the work, not just how it's framed. Each surfaces a
gap class that the work-author cannot see from inside their own session.

- `resume/` — fresh session inheriting context from a prior one (defeats
  namespace-fragmentation between sessions).
- `review/` — fresh agent reading a change set cold (catches inconsistency-class bugs
  the author missed because they're "too close").

`/reflect` is post-hoc same-agent (different gap class than these); `/review` is
pre-ship cross-agent. Both can fire on the same change set.

### Artifact skills — produce in-tree planning files

Help the agent capture intent and structure execution as durable in-repo files (not
just conversation state). Distinct from maintenance skills like `/plan` or `/reflect`
which are behavioral/conversational — these produce files that ship with the codebase,
get seen by anyone who clones the repo, and have explicit lifecycles (folder-as-status:
active folder is live, `archive/` is shipped, no STATUS field).

- `note/` — file a quick thought, debug finding, or feature sketch as a single-paragraph
  in-tree capture (`docs/notes/`). Cheap to write, cheap to delete, can be promoted to
  a spec when work begins.
- `spec/` — write a structured agent execution spec (`docs/specs/`) with phases, steps,
  checkpoints, executor handoff. Distinct from `plan/` (behavioral alignment) — `spec/`
  produces a file the executor follows.

The artifact pattern came from observing a downstream project's plan-rework arc: a
single-verb `/plan` was being used both for one-paragraph thoughts and for heavy executor
handoffs, producing stale artifacts with significant drift between claim and shipped
reality. Splitting into two verbs closes the per-file friction; folder-as-status closes
the lifecycle hole.

### Skill pairings

`/reflect` and `/resume` form a load-bearing pair — the cross-session loop. `/reflect`
at session-end produces memory entries and a `HANDOFF.md`; `/resume` at session-start
reads them. Together they're the ritual that keeps persistence alive between sessions.
Without the pairing, memory and laws sit in files but never get refreshed. With it,
"agent forgets between sessions" becomes "agent picks up where we left off."

Design principle: **observe the collaboration first, then package what you see.**
Skills designed from observation solve problems that exist; skills designed from
theory often solve problems that don't.

Add your own by dropping a new `<name>/SKILL.md` subdirectory into this directory
with the frontmatter shape above.
