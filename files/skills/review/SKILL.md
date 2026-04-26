---
name: review
description: External-perspective review of a change set before ship. Reads the diff PLUS
  adjacent unchanged files that the diff expects to be consistent with, and flags
  inconsistency-class bugs the work-author missed because they were "too close" to the
  change. Use when the user says "review this PR", "fresh eyes on", "external review of",
  "did I miss anything", "check this branch before merge", or hands you a PR/branch they
  did not author. Distinct from /reflect — /review is pre-ship cross-agent fresh-perspective;
  /reflect is post-session same-agent distillate. Different gap classes; both can fire on
  the same change. Do NOT use for the agent's own in-flight work — fresh perspective
  requires you to NOT have been the author. If you wrote the change you're being asked
  to review, decline and route the user to a different agent or session.
---

# Review

External-perspective review of a change set. Catches the inconsistency-class bugs that
work-authors miss because they're anchored on what they touched and have a calcified
mental model of what the unchanged files expect.

## Why this skill exists

When agent A rewrites file X, A's mental model updates and A assumes adjacent files Y
and Z are consistent. But A didn't touch Y or Z this session. A fresh agent reads Y
and Z cold, with no anchor, and catches the lie.

**Why fresh-perspective specifically.** Single-pass review by the work-author tends to
re-confirm the author's mental model rather than challenge it. The author looks where
they *expect* problems to be — which is exactly the set of files they touched. The
gap class lives in files they didn't touch. A fresh agent reads those cold.

Cairn ships this skill in v0.12.x. Its first real test was a v0.12.x doc patch:
the release that introduced `/review` (v0.12.1) shipped with stale tier counts in
`adopt.md`, a "three categories" claim in README that v0.12.0 had already invalidated,
and cwar-coupled worked examples in this very skill body — all caught by a fresh
`/review` session reading the v0.12.x arc cold. The patch landed as v0.12.3.

## When to use

**User-invoked:**
- *"review this PR"* / *"review PR #X"*
- *"give me fresh eyes on this branch"*
- *"external review of [URL]"*
- *"did I miss anything in this change?"*
- *"check this before I merge"*
- User hands you a branch or PR and asks for a take.

**Anti-trigger — do NOT invoke when:**
- You authored the change you're being asked to review. Fresh perspective is the whole
  point; reviewing your own work re-creates the blind-spot you're supposed to catch.
  Tell the user: *"I wrote this — for the gap-class /review catches, you need a session
  that wasn't in the build. Want me to spawn one, or pick a different agent?"*
- The work is in-flight (uncommitted, unstable, scope still moving). Wait until there's
  a coherent change set to read.
- The user wants self-reflection on completed work — that's `/reflect`, not `/review`.

## What `/review` looks for (the gap-classes)

Ranked by what fresh perspective uniquely catches:

1. **Inconsistency between changed and unchanged files.** The author updated A; B
   referenced something in A that no longer exists. Highest-value gap class.
2. **Renamed/removed concepts not propagated.** The diff renames a field; other files
   still use the old name. Build won't break if the references are in markdown/comments,
   so tests don't catch it.
3. **Frontmatter / convention drift.** New file follows convention X; existing siblings
   follow convention Y. A fresh reader notices the asymmetry.
4. **Missing call sites.** A new function was added but no caller invokes it; or an
   internal function was removed but a doc still references it.
5. **Documentation lag.** The diff changes behavior; the README / CLAUDE.md / inline
   docs still describe the old behavior.
6. **Quality-of-life issues.** Naming, organization, leak of design speculation into
   runtime code — flag but don't block.

## Steps

### 1. Establish the change set

Determine what to read. Common forms:

- **GitHub PR** — `gh pr view <N> --json number,title,additions,deletions,changedFiles,baseRefName,headRefName`. Then `gh pr diff <N>` for the diff.
- **Local branch** — `git diff <base>...HEAD` (typically `main...HEAD`). Use `git log <base>..HEAD --oneline` for the commit arc.
- **Specific commit range** — same as above with explicit refs.

If `gh` isn't available, fall back to `git diff` exclusively.

Record: which files changed, which lines.

### 2. Read the diff (changed lines)

Read the diff in full — both directions (added and removed). Don't skim. The author's
mental model is encoded in what they did and didn't change.

### 3. Read adjacent UNCHANGED files (the blind-spot class)

This is the step that distinguishes `/review` from `/reflect`. For each non-trivial
concept introduced or modified in the diff:

- Find files that **reference** the changed concept but were **not** in the diff.
  (`grep`, `git log -- <file>` to confirm not-touched-this-PR.)
- Read them. Look for stale references to the old shape.
- Examples to specifically check: workflow files, README references, doc tables,
  configuration files, sibling files in the same directory, files mentioned in the
  changed files' comments.

This is where the gap-class lives. The author didn't read these files this session; a
fresh agent does.

### 4. Read context that anchors the change

- The repo's CLAUDE.md / AGENTS.md / equivalent for project conventions.
- Recent commit history (`git log --oneline -10`) for immediate prior arc.
- Any HANDOFF.md or active plan files that frame the change.

Don't re-read what the diff already shows. Don't pad context.

### 5. Synthesize the review

Produce a structured report:

```
## Review — <PR/branch identifier>

### What works
<2-4 bullets — the design calls that hold up, the diagnoses that ring true>

### Problems
<numbered list, severity-ordered. For each: file:line ref, what's wrong, why it matters>

### Biggest risk
<one paragraph — the most important thing the author should know before merging>

### Optional pulls / suggestions
<low-severity quality-of-life items, separable from the merge decision>
```

Lead with strengths to anchor the review's good faith. Then problems, severity-ordered.
A real shipping blocker (something that breaks on first use) belongs at #1 with that
label.

For each problem, include a **file:line reference** so the author can navigate.
Vague concerns ("this could be cleaner") aren't actionable — either point at lines
or drop the item.

### 6. End with a clear next-action question

Don't end open-ended. Pick one:
- *"Want me to draft the fix for #1?"* — when the blocker is straightforward
- *"Want to file the deferred items as notes so they don't evaporate?"* — when there
  are quality-of-life items the author may not action immediately
- *"Merge as-is, or address #1-#N first?"* — when the review surfaces no blockers

## Output

A structured review (typically 200–600 words) with the format from Step 5.

Quality bar:
- Every problem has a file:line ref or is dropped.
- Severity is honest. Don't inflate quality-of-life into blockers; don't downplay
  shipping blockers as "nits."
- The biggest-risk paragraph is the one thing the author would want to read first.
  Make it earn its place.

## Relationship to other skills

- **`/reflect`** is post-hoc, same-agent. Different gap class. Both can fire on the
  same change.
- **`/audit`** scans citations and structural integrity. `/review` reads for
  judgement-class bugs. Use both for high-stakes changes.
- **`/note`** is where deferred items from a `/review` should land if the author
  defers them. The review surfaces them; `/note` files them so they don't evaporate.
