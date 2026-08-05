---
name: autoresearch-finalize
description: Close out an autoresearch session by splitting its kept commits into
  file-disjoint, independently mergeable review branches — one per logical improvement
  group. Reads the `Autoresearch-Result` commit trailers and `.auto/prompt.md`, groups the
  changed files, validates disjointness plus full coverage of the branch diff, then cuts
  one branch per group off the merge-base. Triggers on `/autoresearch-finalize`. Use after
  an `/autoresearch` loop has produced kept commits and the user wants them reviewed or
  merged. Do NOT use on a branch without `Autoresearch-Result` trailers, on a dirty
  working tree, or as a general-purpose commit splitter. Adapted from pi-autoresearch
  (MIT).
---

# Autoresearch finalize

Adapted from [pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT,
© davebcn87). Turns a messy autoresearch branch — dozens of keep-commits interleaved with
`.auto/` noise — into clean, independently mergeable review branches.

## Paths

The splitter ships inside this skill. At invocation the agent announces `Base directory
for this skill: <path>` — substitute that path for `<skill-base>` below, quoted (the
announced path is a Windows absolute path, and an unquoted substitution breaks in Git
Bash). The sibling `autoresearch` skill installs at `<skill-base>/../autoresearch` when
both ship from the same cairn package; call that directory `<autoresearch-base>` —
`<autoresearch-base>/scripts/experiment.mjs` is its harness. Run every command from the
project root.

## Procedure

1. **Survey the session.**
   ```bash
   node <autoresearch-base>/scripts/experiment.mjs status --limit 100
   git log --oneline $(git merge-base HEAD main)..HEAD
   ```
   Read the `Autoresearch-Result` trailers and `.auto/prompt.md` "What's Been Tried" for
   what each kept commit contributed.

2. **Design groups.** Partition the branch's changed files into logical, *file-disjoint*
   groups — one file belongs to exactly one group, which is what makes the branches
   independently mergeable. Each group carries: `title` (imperative summary with the
   metric win, e.g. "Cache sector flowfields (tick 2.8→1.9 ms)"), `body` (what/why plus
   confidence data), `last_commit` (the last branch commit holding that group's final file
   state), and a descriptive `slug`. Two improvements touching one file are one group.

3. **Write `groups.json`** in the scratchpad or `.auto/`, uncommitted:
   ```json
   {
     "base": "<merge-base with trunk>",
     "trunk": "main",
     "final_tree": "<branch HEAD>",
     "goal": "<short-goal-slug>",
     "groups": [
       { "title": "...", "body": "...", "last_commit": "<hash>", "slug": "..." }
     ]
   }
   ```

4. **Run the splitter.** It validates hash existence, a clean tree, file-disjointness, and
   full coverage of the `base..HEAD` diff before creating anything:
   ```bash
   node <skill-base>/scripts/finalize.mjs <path>/groups.json
   ```
   Branches are created as `autoresearch/<goal>/<NN>-<slug>`, all rooted at `base`, with
   `.auto/` excluded automatically.

5. **Verify and report.** For each created branch run `git diff main...<branch> --stat`,
   confirm it builds and tests in isolation when that is cheap, then summarize for the
   user: branch → improvement → metric delta → suggested merge order (any order is valid).

On a file-overlap validation failure, merge the offending groups or pick a later
`last_commit`, then re-run. Hand-editing branch contents to force disjointness discards
the guarantee the splitter exists to provide.

## Requirements

`node` and `git` on PATH. Zero npm dependencies.
