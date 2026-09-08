# Skills — cairn

Skills are reusable capabilities an agent can invoke mid-session. Each skill is a
**subdirectory** containing a `SKILL.md` file with YAML frontmatter at the top. In cairn's
source they live at `files/skills/<name>/SKILL.md`; they reach your harness through the
cairn **package** (the `cairn` Claude Code plugin, `@winnorton/cairn-pi` for Pi, or
the native `cairn-agy` plugin for Antigravity) — the vendor's own installer places them, so
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
- **Treat prompt size as a reviewed contract.** `node scripts/check-skill-budgets.mjs`
  enforces the 1024-character description cap and exact instructional-body word counts.
  Counts include prose, lists, and tables; frontmatter, headings, fenced examples, and
  HTML comments are excluded. After an intentional body edit, run the command from the
  repo root with `--update-body-baseline` and review the
  `scripts/skill-body-word-baseline.json` diff before the default check. A count increase
  requires explicit justification in review; baseline regeneration is not approval.
- **Size is necessary, not sufficient.** The budget and register gates certify prompt
  shape; a cold `/peer-review` of the skill plus adjacent docs certifies behavior.
- **One skill, one purpose.** Splitting "reflect" and "plan" into separate skills lets
  the agent invoke just the one relevant to the moment.

## Built-in skills (from cairn)

Cairn's skills fall into five categories. Each addresses a different gap-class.

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
get seen by anyone who clones the repo, and have explicit lifecycles. Execution specs
use folder-as-status: active is live and `archive/` is shipped, with no status field.
Permanent contract specs stay live and carry evidence-bearing status.

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
- `prompt-evolve/` — author a version-controlled operational prompt for multi-pass work where
  each pass produces output and reusable insight. Two entry modes: `/prompt-evolve <NAME>`
  cold-starts from a five-input brief (source, target, data model, tools, coverage unit);
  `/prompt-evolve --from <SPEC>` extracts a deliverable a `/spec` already names, leaving the
  spec in place. Coverage units may be known or discovered. The kernel requires
  inventory-before-write, a coverage table (named locally — scoreboard, coverage ladder,
  partition anchors), `ACTIVE`/`HELD` lifecycle state plus a read-only inheritance boundary
  when a loop is spawned from a narrowed predecessor, explicit stop and re-run semantics
  including narrowing aperture, validation, an absolute self-edit target, a versioned
  CHANGELOG, and blocked-work capture; phase numbering and project strategies remain
  adaptable. Stable mechanical rules graduate into schemas, validators, or tools.
- `lra/` — a `prompt-evolve` specialization for researching a subject over many passes, run
  engine-free as project-local markdown an agent walks. Mirrors the lra
  research→library→application pipeline 1:1 through lra commands (`subject create`,
  `collection create`, `research run`, `app serve`); scaffolds a project-local `research/`
  collection and drives two prompts (researcher + librarian) synced byte-for-byte from the
  lra lab (the researcher is immutable there). lra is `prompt-evolve`'s third worked instance
  (after fishing-agent and purduebb) and the source of `[LAW prompt-economy]`. See
  [`docs/CROSS_REPO_LRA_CAIRN.md`](../../docs/CROSS_REPO_LRA_CAIRN.md).
- `swarm/` — a living coordination surface for multi-workstream work that repeats over
  partitions with an open-ended lifecycle. Fan-out parallel stubs per wave, review results,
  self-improve the master, fan out the next wave. The master is held or retired only with
  user approval. Use when work spans parallel workstreams AND iterates over partitions.

### Execution skills — run a measured loop against the codebase

The other four categories produce text. These two mutate the tree, measure the result,
and keep or revert on the number — so they are the only cairn skills that ship runtime
code beside their `SKILL.md`. Both are adapted from
[pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT, © davebcn87).

- `autoresearch/` — autonomous optimization loop against any measurable target (test
  wall-clock, tick time, bundle size, Lighthouse, memory, training loss). One iteration
  is: pick an idea, edit, measure, keep or revert, log the insight. Keeps commit with an
  `Autoresearch-Result` trailer; everything else reverts the working tree. Session state
  lives in `.auto/` at the project root and survives compaction, restarts, and reverts,
  so the loop resumes from disk rather than from conversation history. A MAD-based
  confidence multiple separates a real win from benchmark noise. Bundles
  `scripts/experiment.mjs` (zero-dependency harness: init / run / log / status / export /
  mode / clear) and `scripts/stop-hook.mjs` (opt-in Claude Code Stop hook for never-stop
  mode). Script paths resolve from the base directory the harness announces at
  invocation, since the install location differs per harness.
- `autoresearch-finalize/` — split an autoresearch session's kept commits into
  file-disjoint, independently mergeable review branches, one per logical improvement
  group. `scripts/finalize.mjs` validates hash existence, a clean tree, disjointness, and
  full coverage of the branch diff before creating anything.

Neither ships in `@winnorton/cairn-pi` — Pi has the upstream `pi-autoresearch` extension
natively, with first-class tools and a dashboard widget.

The artifact pattern came from observing a downstream project's plan-rework arc: a
single-verb `/plan` was being used both for one-paragraph thoughts and for heavy executor
handoffs, producing stale artifacts with significant drift between claim and shipped
reality. Splitting into two verbs (`/note`, `/spec`) closes the per-file friction;
folder-as-status closes the lifecycle hole. `/program` extends the same pattern upward
when one spec isn't enough.

### Skill pairings

`/reflect` and the `HANDOFF.md` it produces form the cross-session loop. `/reflect`
at session-end produces memory entries and a `HANDOFF.md`; the next session reads
`HANDOFF.md` (plus the memory index) at start. Together they're the ritual that keeps
persistence alive between sessions. Without the loop, memory and laws sit in files but
never get refreshed. With it, "agent forgets between sessions" becomes "agent picks up
where we left off."

Design principle: **observe the collaboration first, then package what you see.**
Skills designed from observation solve problems that exist; skills designed from
theory often solve problems that don't.

Add your own by dropping a new `<name>/SKILL.md` subdirectory into this directory
with the frontmatter shape above.
