---
name: resume
description: Detect and load context from a previous session. Use when the user opens a
  new session and says "where were we", "resume", "pick up", "continue from last session",
  "what was happening", or when starting work that should inherit from a previous session.
  Probes for HANDOFF.md, memory at multiple project-slug paths (worktree-aware),
  transcript junctions, and recent git activity. Reports what was found and produces
  a compact orientation. Do NOT use for fresh starts where there's no previous session.
---

# Resume

When a session opens that should continue from a previous one, `/resume` probes the
filesystem for handoff artifacts the previous session left behind, synthesizes them,
and presents a compact orientation. Designed to defeat the namespace fragmentation
that breaks naive session-to-session handoff.

## Why this skill exists

A new session in a different worktree (or a fresh terminal, or a different agent
instance) does not automatically see the previous session's memory, HANDOFF.md, or
transcript. Memory is often namespaced per-worktree; HANDOFF.md is a convention that
nobody knows to look for; transcript junctions are ad-hoc. Without a deliberate probe
step, the new session starts cold even when context exists nearby.

`/resume` codifies the probe. The signal exists; the skill makes it findable.

## When to use

- User says: "resume", "where were we", "pick up", "continue from last session",
  "what was happening", "what's the state."
- New session opens and the user references prior work without specifying source.
- Workspace shows signs of recent work (recent commits, modified files) but you don't
  have the conversational context.

Do NOT invoke for:
- Fresh starts with no prior session.
- Mid-session continuations within the same conversation.
- When the user has already pasted the relevant context — they don't need /resume to
  echo what they just told you.

## Probe paths

Run all probes in parallel. Don't ask before reading — agents can probe files freely.

### 1. HANDOFF.md (highest signal)

Check these paths:

- `<cwd>/HANDOFF.md`
- `<cwd>/.claude/HANDOFF.md`
- `<cwd>/../HANDOFF.md` (parent project)
- `<cwd>/../../HANDOFF.md` (grandparent — common in worktree layouts)

If multiple HANDOFF.md files exist, prefer the one most recently modified.

If the workspace is part of a multi-repo setup (e.g. cairn alongside cwar), also check
adjacent project roots — a `HANDOFF.md` in a sibling project may be the real bridge.

### 2. Memory directory probe (worktree-aware + HANDOFF-aware)

Memory may be project-scoped, user-global, or per-worktree depending on Claude Code
configuration. **Probe multiple slugs.** Common locations:

- `~/.claude/memory/` (user-global)
- `~/.claude/projects/<current-cwd-slug>/memory/` (project-scoped, current slug)
- `~/.claude/projects/<parent-cwd-slug>/memory/` (parent slug — important for worktrees)

The slug is derived from the absolute path with separators replaced: `C:\Users\foo\bar`
becomes `C--Users-foo-bar`. For a worktree at `<project>/.claude/worktrees/<name>/`, the
parent slug points at `<project>` itself.

**ALSO: if HANDOFF.md (from step 1) contains a `## Related memory paths` section,
probe those paths too.** This is how cross-project memory bridges work — when a session
in project A produced memory at project B's slug, HANDOFF.md in A declares the pointer
so `/resume` knows to follow it. Example HANDOFF.md content:

```markdown
## Related memory paths

- `~/.claude/projects/C--Users-foo-projects-other-project/memory/` — primary memory
  for this effort lives at this slug, not the current one
```

If memory is found at a sibling/parent/declared slug but not the current one, **call
this out explicitly in the orientation** — it's a namespace-fragmentation finding the
user should know about.

### 3. Transcript junctions

Check for filesystem links pointing at prior session transcripts:

- `<cwd>/cairn_link/` (cairn convention)
- `<cwd>/.previous_session/`
- `<cwd>/session_link/`
- Any directory that's actually a junction/symlink to a `.jsonl` file or a session dir

If found, don't read the entire transcript. Use head/tail/grep for key markers:
- `head -c 2000` for the opening (often has the user's first message)
- `grep -c "\"type\":\"user\""` for message count signal
- `tail -c 5000` for the most recent turns

### 4. Recent git activity (always available, low cost)

- `git log -10 --oneline` — recent commit arc
- `git status --short` — in-flight changes
- `git stash list` — stashed work
- `gh issue list --state all --limit 5` — recent issues if `gh` is authenticated

## Steps

1. **Probe in parallel.** Issue all reads/lists at once where the tools support it.

2. **Synthesize what was found.** Categorize each source:
   - `HANDOFF.md` content (if any)
   - Memory entries by type (user, feedback, project, reference)
   - Transcript markers (size, recency, key topics from head/tail)
   - Recent commits + branch state

3. **Produce orientation in this format:**

```
Resume — context restored from <comma-separated sources>

## What was happening
<one paragraph synthesizing the core narrative; lift verbatim from HANDOFF.md if present>

## State at end
<what shipped, what's open, what's blocked>

## Anomalies / gaps
<things found at unexpected paths, missing pieces, namespace fragmentation, etc.>

## Next action
<from HANDOFF.md or inferred from recent commits>
```

4. **Ask one clarifying question** only if the highest-value gap remains. Don't ask
   multiple questions — pick the single piece of missing context that would change
   what the agent does next.

5. **If nothing was found**, report cleanly: list every path probed, note that none
   produced signal, and ask the user to point at the prior context manually. This
   keeps the failure mode transparent rather than silent.

## Output

Compact orientation. Under ~250 words. No prose padding. End with one of:
- `Pick up from <next action>?` (when next step is clear)
- `<single highest-value clarification question>` (when something key is missing)
- `Point me at the prior context if it lives elsewhere.` (when nothing was found)

## Relationship to other skills

- `/tour` is for FIRST adoption; `/resume` is for SUBSEQUENT sessions that inherit context.
- `/reflect` produces handoff artifacts (memory, HANDOFF.md candidates); `/resume`
  reads them. They're paired: reflect-then-resume is the cross-session loop.
- `/bridge` carries context across parallel sessions; `/resume` carries context across
  sequential sessions of the same effort.
