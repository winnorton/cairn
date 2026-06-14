# Skills — cairn

Skills are reusable capabilities an agent can invoke mid-session. Each skill is a
**subdirectory** containing a `SKILL.md` file with YAML frontmatter at the top. In cairn's
source they live at `files/skills/<name>/SKILL.md`; they reach your harness through the
cairn **package** (the `cairn` Claude Code plugin, `@winnorton/cairn-pi` for Pi, or
`agy plugin import claude` for Antigravity) — the vendor's own installer places them, so
cairn never hand-writes into a vendor skills directory.

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
- `peer-review/` — fresh agent reading a change set cold (catches inconsistency-class bugs
  the author missed because they're "too close"). Named `peer-review` to disambiguate from
  Claude Code's built-in `/review` skill.
- `session-distill/` — fresh agent reading a past session's JSONL transcript cold,
  through cairn's improvement lens. Produces a structured report of patterns recognized
  (matched against a seeded catalog), skill candidates with 3-instance gate check, law
  candidates, memory candidates, environment-support gaps. This is the **formalization
  of the methodology that produced cairn itself** — the transcript-analysis loop
  documented in the research papers (see `docs/research/collaboration-skills.md` and
  `human-interaction-patterns.md`). Reports by default; never auto-applies; user "do it"
  gates any cairn-side change. Cousin to `/peer-review` (same observer-rotation
  mechanic; transcript instead of diff).

`/reflect` is post-hoc same-agent (different gap class than these); `/peer-review` is
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
- `program/` — author a program-of-specs (one master coordination doc + N workstream
  child stubs in `docs/specs/`) for substantial work that exceeds a single spec's
  scope. Bakes in no-deferral discipline and cross-cutting axes coverage. Stubs are
  elaborated by `/spec --from <stub>`. Use when work spans parallel-team workstreams
  with cross-cutting concerns (telemetry, diagnostics, CI gates) — otherwise `/spec`
  alone suffices.
- `round-review/` — trust-but-verify an autonomous executor's round of work against a
  `/program`-produced master. Walks the master's §5 DoD criterion-by-criterion against
  the diff (the executor's status files are NOT authoritative; disk wins). Drafts R+1
  stub specs for the gaps plus an R+1 round master that's a self-contained dispatch
  target. Loop exits when the skill writes zero R+1 stubs. Closes the orchestration
  loop: `/program` → `/spec --from` → executor → `/round-review` → next dispatch.
- `fast-execute/` — the consumer-side verb of the artifact lifecycle: turns an
  autonomous executor (Antigravity Flash, Pi, or any harness with timer + file-read
  primitives) into a polling daemon that watches a sentinel-file inbox in
  `docs/specs/`, picks up dispatched specs (single specs or `/round-review` round
  masters), executes per the spec body, and marks completion via sentinel
  atomic-flip (`.ready` → `.claimed` → `.done`). The one artifact skill that
  consumes planning files rather than producing them — it closes the dispatch
  seam of the orchestration loop.
- `prompt-evolve/` — author a self-improving, version-controlled prompt for tough tasks
  done in many iterative passes over partitions (corpus mining, codebase refactor sweeps,
  doc backfill, bug triage, audits, etc.). Primary mode is `--from <SPEC>`: promotes the
  evolving-prompt deliverable embedded in a `/spec` into a standalone artifact at
  `<docs|.cairn>/prompt-evolve/<NAME>_PROMPT.md`. Enforces a canonical 7-phase
  scaffold (Pre-flight → Inventory → Extract → Write → Verify → Report →
  **Self-Improvement**) with Phase 6 absolute-path mandate, CHANGELOG format, fallback
  matrix, pending-re-run staging, and idempotence guarantee. Distinct from every other
  artifact skill: the artifact evolves over its lifetime — Phase 6 self-edits accumulate
  lessons each pass, and the prompt's CHANGELOG IS its institutional memory.

The artifact pattern came from observing a downstream project's plan-rework arc: a
single-verb `/plan` was being used both for one-paragraph thoughts and for heavy executor
handoffs, producing stale artifacts with significant drift between claim and shipped
reality. Splitting into two verbs (`/note`, `/spec`) closes the per-file friction;
folder-as-status closes the lifecycle hole. `/program` extends the same pattern upward
when one spec isn't enough.

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
