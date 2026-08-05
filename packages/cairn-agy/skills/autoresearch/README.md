# autoresearch — provenance and layout

Adaptation of [pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT,
© davebcn87) for harnesses that load markdown skills: an autonomous optimization loop —
try an idea, measure it, keep what works, revert what doesn't, repeat.

Works against any measurable target: test wall-clock, sim tick time, bundle size,
Lighthouse score, memory footprint, training loss.

## What maps where

| pi-autoresearch | cairn's adaptation |
|---|---|
| `init_experiment` / `run_experiment` / `log_experiment` extension tools | `scripts/experiment.mjs` (init / run / log), driven via Bash |
| Dashboard widget + Ctrl+Shift+F overlay | `experiment.mjs status` (terminal) + `experiment.mjs export` (self-contained HTML with metric chart) |
| `/autoresearch` command | the `autoresearch` skill ([SKILL.md](SKILL.md)) |
| Agent-end auto-resume hook | opt-in Claude Code Stop hook: `scripts/stop-hook.mjs` (see SKILL.md § Never-stop mode) |
| Compaction re-prompt | the resume protocol — `.auto/` files are the source of truth |
| `autoresearch-finalize` command | the `autoresearch-finalize` skill + its `scripts/finalize.mjs` |

## Two directories, two owners

- **This skill's directory** holds the harness. Its install path differs per harness, so
  every command in SKILL.md is written against `<skill-base>` — the base directory the
  harness announces when the skill is invoked.
- **`.auto/` at the project root** holds session state: `prompt.md`, `measure.sh`,
  `log.jsonl`, plus optional `checks.sh`, `ideas.md`, `config.json`, `hooks/`. The scripts
  resolve it from the working directory, never from their own location. It survives
  reverts, restarts, and context compaction by design.

## Usage

```
/autoresearch make npm test 20% faster without changing baselines
/autoresearch status
/autoresearch export
/autoresearch off | clear
/autoresearch-finalize
```

Requirements: `node`, `git`, and `bash` on PATH (Git Bash on Windows). No npm
dependencies.

## Note for Pi users

Pi has the upstream original as a native extension with first-class tools and a dashboard
widget. Install [pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) there
instead of this adaptation — which is why `@winnorton/cairn-pi` omits these two skills.
