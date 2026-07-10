---
name: peer-review
description: Review a coherent PR, branch, or commit range cold before ship. The reviewer
  must not have authored the change. Read the full diff plus adjacent unchanged files to
  catch propagation and consistency bugs. Use for "peer-review", "fresh eyes", "review
  this PR", or "did I miss anything?" Use /round-review for program rounds and /reflect
  for same-agent retrospection.
---

# Peer Review

Rotate to a cold reviewer and test the change against the files its author did not touch.

## Eligibility

- Review only a coherent commit, branch, or PR; wait while scope is unstable.
- The reviewer did not participate in authoring. An author routes the work to a fresh
  agent or session instead of self-reviewing.
- Use `/round-review` for executor output governed by a program master.
- Use `/reflect` for lessons from the current agent's completed work.

## Workflow

### 1. Establish the change set

Record changed files and lines. Use the available form:

- PR: use `gh pr view <N> --json title,baseRefName,headRefName,changedFiles,additions,deletions`
  for metadata and `gh pr diff <N>` for the diff.
- Branch: `git diff <base>...HEAD` plus `git log <base>..HEAD --oneline`.
- Commit range: `git diff <range>`.

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

1. changed and unchanged files disagree;
2. renamed or removed concepts were not propagated;
3. frontmatter or project conventions drift;
4. callers, registrations, or consumers are missing;
5. documentation describes old behavior;
6. naming or organization creates non-blocking friction.

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

A 200–600 word structured review. End with a clear push/merge decision or a specific
question about the numbered findings.
