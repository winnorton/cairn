---
name: peer-review
description: Review a coherent PR, branch, commit, or spec change set cold before ship.
  The reviewer must not have authored the change. Read the full diff plus adjacent
  unchanged files to catch internal defects, spec drift, and propagation bugs. Use for
  "peer-review", "fresh eyes", "review this PR", or "did I miss anything?" Use
  /round-review for program rounds and /reflect for same-agent retrospection.
---

# Peer Review

Rotate to a cold reviewer with zero authoring context; test both the diff's internal
correctness and its consistency with untouched files.

## Eligibility

- Review only a coherent change set (commit, range, branch, PR, working tree, or spec
  path); wait while scope is unstable.
- The reviewer did not participate in authoring and shares zero conversation history
  with the author (unforked context). If you wrote the change, decline and route it to a
  fresh agent or session; self-review re-creates the blind spot peer-review exists to
  catch.
- Whole-round `DEFINITION OF DONE` verification against a program master goes to
  `/round-review`; one workstream's diff or a Gate B master/stub commit stays here.
- Use `/reflect` for lessons from the current agent's completed work.

## Workflow

### 1. Establish the change set

Record changed files and lines. Use the available form:

- PR: use `gh pr view <N> --json title,baseRefName,headRefName,changedFiles,additions,deletions`
  for metadata and `gh pr diff <N>` for the diff.
- Branch: `git diff <base>...HEAD` plus `git log <base>..HEAD --oneline` (when `HEAD`
  is on `<base>`, inspect the target commit via `git show <sha>`).
- Commit or range: `git show <sha>` or `git diff <range>`.
- Working tree: `git diff HEAD` plus untracked files (`git status --porcelain`).
- File or spec path: resolve the branch diff (`git diff <base>...HEAD`) or, on trunk, the
  commits touching that artifact (`git log --follow --oneline -- <path>`, then
  `git show <commits>`) so the review covers the introducing commit, Gate B absorptions,
  revisions, and sibling files committed with them.

Fall back from `gh` to Git. Read the complete diff, additions and removals.

### 2. Read the blind-spot surface

For every changed or removed concept, find references outside the diff and read the
relevant unchanged files. Include siblings, callers, configuration, workflows, docs,
templates, and comments that claim consistency with the changed surface.

Read the project context (`AGENTS.md`, `CLAUDE.md`, or equivalent), relevant
`HANDOFF.md`/active planning artifacts, and recent history. Keep this context scoped to
the change.

### 3. Test the gap classes

Check, in priority order:

1. internal defects break behavior, safety, error paths, data integrity, or
   cross-section spec invariants (dependencies, gates, contracts);
2. changed and unchanged files disagree, or implementation drifts from its governing
   spec;
3. renamed or removed concepts were not propagated;
4. frontmatter or project conventions drift;
5. callers, registrations, or consumers are missing;
6. documentation describes old behavior;
7. naming or organization creates non-blocking friction.

### 4. Report

Produce:

1. **What works** — 2–4 concrete strengths.
2. **Problems** — numbered and severity-ordered. Every item names `file:line`, the
   defect, and its impact. Drop concerns without an actionable location.
3. **Biggest risk** — the single pre-ship concern that deserves attention first.
4. **Optional suggestions** — explicitly non-blocking quality-of-life changes.
5. **Recommendation** — push/merge, or hold for named findings, followed by one exact
   next-action question.

Distinguish shipping blockers from quality-of-life issues. Do not soften or inflate
severity.

## Output

A 200–600 word structured review in the step 4 shape.

## Companion skills

`/round-review` verifies program rounds against `DEFINITION OF DONE`. `/reflect`
captures post-hoc lessons from your own work. `/note` files deferred non-blocking
findings. `/audit` checks structural citation integrity.
