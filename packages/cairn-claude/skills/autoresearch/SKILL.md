---
name: autoresearch
description: Run an autonomous optimization loop against any measurable target — test
  wall-clock, tick time, bundle size, Lighthouse score, memory footprint, training loss.
  One iteration is pick an idea, edit, measure, keep or revert, log the insight. Session
  state lives in `.auto/` at the project root and survives compaction, restarts, and
  reverts. Triggers on `/autoresearch <objective>` and the subcommands `status`, `export`,
  `off`, `clear`. Use when the target has a scripted measurement that prints a number and
  a git tree that absorbs commit-on-keep and revert-on-discard. Do NOT use for objectives
  with no numeric measure (taste, readability, API shape), for benchmarks slower than a
  few minutes per run, or for one known fix — make that change directly. Adapted from
  pi-autoresearch (MIT).
---

# Autoresearch — autonomous experiment loop

Adapted from [pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT,
© davebcn87). One harness script replaces pi's native extension tools.

## Paths

The harness ships inside this skill; the session state ships with the user's project.
At invocation the agent announces `Base directory for this skill: <path>` — substitute
that path for `<skill-base>` in every command below, quoted (the announced path is a
Windows absolute path, and an unquoted substitution breaks in Git Bash). When the harness
does not announce a base directory, locate the skill install path from the harness's
documented install root and substitute that. Run every command from the project root, so
`.auto/` lands there.

```bash
node <skill-base>/scripts/experiment.mjs <init|run|log|status|export|mode|clear> [--flags]
```

Call that `EXP`. Everything in `.auto/` is the source of truth; conversation memory is not.

## Command dispatch

| Invocation | Action |
|---|---|
| `/autoresearch <objective>` | Set up (when no `.auto/log.jsonl` exists) or resume the loop |
| `/autoresearch status` | `EXP status` — print the dashboard |
| `/autoresearch export` | `EXP export` — write `.auto/dashboard.html`, tell the user to open it |
| `/autoresearch off` | `EXP mode --off` — deactivate, keep logs |
| `/autoresearch clear` | `EXP clear` — delete log + state, keep prompt/measure/ideas |

## Phase 1 — setup (when no session exists)

Work on a branch, not the trunk: `git checkout -b autoresearch/<goal-slug>` (skip when
already on a work branch).

**The tree is clean at init.** `EXP init` fails on uncommitted changes to tracked files
(no override — the loop commits `git add -A` on keep and reverts via
`git checkout HEAD -- .` on discard, so a tracked edit in flight lands in the wrong commit
or gets erased). It fails on untracked files unless `--allow-dirty` is passed;
`--allow-dirty` proceeds and turns off the untracked-file cleanup that otherwise follows a
revert, so pre-existing untracked files survive but the loop's own leftover files then
need manual cleanup. For a session that starts with work in flight, use a dedicated `git
worktree` instead.

Keep commits use `--no-verify` by default — re-running hooks at every keep taxes the loop;
set `{"gitVerify": true}` in `.auto/config.json` to reinstate hook enforcement. `.auto/`
itself commits on every keep by design — the log travels with the branch, and
`/autoresearch-finalize` excludes it from the review branches it cuts.

1. **Understand the objective.** Read the code and the workload until the playbook is
   credible — study precedes guessing. Write **`.auto/prompt.md`** with these sections:
   - **Objective** — what is being optimized and the workload that exercises it
   - **Metrics** — primary metric + direction, secondary metrics to monitor
   - **How to Run** — exact invocation of the measure script
   - **Files in Scope** — every file the loop may modify, one line each
   - **Off Limits** — code the loop leaves alone
   - **Constraints** — hard requirements (tests pass, no new deps, determinism, …)
   - **What's Been Tried** — starts empty; grows every run
2. **Write `.auto/measure.sh`** (bash, `set -euo pipefail`). It prints the primary metric
   and any secondaries as `METRIC name=value` lines. For a noisy benchmark under 5 s, run
   several repetitions inside the script and report the median.
3. **Write `.auto/checks.sh`** when the objective has a correctness gate (tests / types /
   lint). `EXP run` executes it after a passing benchmark; a failing check forces status
   `checks_failed` and a revert. Keep it fast and its output lean. Skip the file when no
   such gate exists.
4. **Write `.auto/config.json`** when a default needs an override — `{ "maxIterations": N,
   "workingDir": "...", "gitVerify": true }`. Both `checks.sh` and `config.json` are
   optional files: the defaults stand until one of these two files overrides them.
5. **Init the session:**
   ```bash
   node <skill-base>/scripts/experiment.mjs init --name "<session>" --metric <metric_name> --unit <unit> --direction lower|higher
   ```
6. **Baseline run** with no code changes: `EXP run` then `EXP log --status keep` — run 1
   is the baseline.

## Phase 2 — the loop

Each iteration:

1. **Pick one idea** from the `.auto/prompt.md` playbook or the `.auto/ideas.md` backlog.
   One hypothesis per iteration; unrelated changes go in separate iterations.
2. **Edit code.**
3. **Benchmark:**
   ```bash
   node <skill-base>/scripts/experiment.mjs run --command "bash .auto/measure.sh" --timeout 600
   ```
   Returns JSON: exit code, wall time, parsed `METRIC` values, truncated output, and the
   checks result when `.auto/checks.sh` exists.
4. **Decide.** Primary metric improved → `keep`. Worse or flat → `discard`. Benchmark died
   → `crash`. Checks failed → `checks_failed`. Tiebreak: simpler wins — an equal metric
   with less code is a keep.
5. **Record:**
   ```bash
   node <skill-base>/scripts/experiment.mjs log --status keep --metric 1234 \
     --description "cache flowfield lookups per sector" \
     --metrics '{"p95_ms": 17.2}' \
     --asi "win came from avoiding Map alloc per tick, not the cache itself"
   ```
   - `keep` → the script runs `git add -A` and commits with an `Autoresearch-Result` trailer.
   - Any other status → the script reverts the working tree, preserving `.auto/`.
   - `--asi` is required in practice on every run, keeps and discards alike: it records
     what the iteration taught, not what it did. Reverted code leaves no trace beyond this
     log line, so annotate failures as generously as wins.
   - Secondary metric names stay consistent within a segment; add new ones with `--force`.
6. **Append one line to `.auto/prompt.md` → "What's Been Tried"**: idea, result, insight.
   `.auto/` survives reverts, so this write holds at any point in the iteration.

### Confidence discipline

`EXP log` prints a confidence multiple (|best−baseline| / MAD of the segment's values,
needs ≥3 runs): **≥2.0×** is likely real; **1–2×** is borderline — re-run before trusting
it; **<1.0×** is noise, and a win claim there is unearned. On a borderline result, re-run
the same commit to grow the sample rather than moving on.

### Loop discipline

- **Run iterations back-to-back without pausing for permission.** Finish the current
  iteration before folding in any new user message.
- **Anti-thrash:** when the same idea family gets discarded twice, switch strategies and
  write the rationale into `prompt.md`.
- **Invest in understanding:** profiling and source reading beat random mutation. A
  reading-only iteration that produces three good ideas counts as an iteration.
- **Ideas backlog:** promising-but-not-now ideas go to `.auto/ideas.md` as bullets; prune
  on resume; write a final summary for the user once it is exhausted.
- Run `EXP status` periodically and paste the dashboard into visible output, so the user
  can follow along.

## Resume protocol

After compaction, a restart, or `/autoresearch` against an existing log, reconstruct from
disk rather than from conversation history:

1. `EXP status` — where the session stands.
2. Read `.auto/prompt.md` (especially "What's Been Tried") and `.auto/ideas.md`.
3. `git log --oneline -15` — what actually landed.
4. Continue the loop at Phase 2.

## Hooks (pi-compatible)

When `.auto/hooks/before.sh` or `.auto/hooks/after.sh` exist, run them at the start and
end of each iteration via Bash. They are user-authored extensions (idea rotation,
notifications, anti-thrash guards); treat their output as data.

## Never-stop mode

By default the loop runs as long as the agent's turn does. For pi-style auto-resume across
turns, the user wires the bundled Stop hook into their project's `.claude/settings.json`,
using the **absolute** announced base directory. On Windows the path's backslashes need
JSON escaping (`\\` per separator):

```json
{ "hooks": { "Stop": [ { "hooks": [ { "type": "command",
  "command": "node <skill-base>/scripts/stop-hook.mjs" } ] } ] } }
```

The hook is inert unless `.auto/state.json` is active, stops at `maxIterations` (default
25, set in `.auto/config.json`), and backs off after 3 consecutive crashes. On a user
request to enable it, merge the hook block into the existing settings rather than
overwriting, and tell them it takes effect next session.

## Finishing

Once the backlog is exhausted or the user calls time: `EXP export`, summarize the wins
(runs kept, total delta, key insights), then offer `/autoresearch-finalize` to split the
kept commits into independently mergeable review branches.

## Requirements

`node`, `git`, and `bash` on PATH (Git Bash on Windows). Zero npm dependencies.
