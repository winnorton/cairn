# cairn (Claude Code plugin)

[cairn](https://github.com/winnorton/cairn)'s full skill catalog packaged as a
Claude Code plugin. Markdown skills only — no runtime code, no build step.

## Install

### From the cairn marketplace (recommended)

```
claude plugin marketplace add winnorton/cairn
claude plugin install cairn@cairn
```

After install, confirm with:

```
claude plugin list
# expect: cairn  0.14.0  ...
```

### From a local clone

Add the repo as a local marketplace, then install:

```powershell
# PowerShell (Windows)
claude plugin marketplace add <absolute-path-to-repo>
claude plugin install cairn
```

```bash
# POSIX (macOS/Linux)
claude plugin marketplace add /path/to/cairn
claude plugin install cairn
```

Or for a one-session-only load (no install):

```
claude --plugin-dir /path/to/cairn/packages/cairn-claude
```

## What you get

All 18 cairn skills, invocable as `/skill-name` in Claude Code:

| Category | Skills |
|---|---|
| Maintenance | `/tour`, `/reflect`, `/plan`, `/prune`, `/audit`, `/feedback` |
| Collaboration | `/reframe`, `/bridge`, `/advocate` |
| Cross-perspective | `/peer-review`, `/session-distill` |
| Artifact | `/note`, `/spec`, `/program`, `/round-review`, `/fast-execute`, `/prompt-evolve`, `/lra` |

## Invocation note

After plugin install, skills are invoked as `/name` (e.g. `/spec`, `/peer-review`).
These are the same skill bodies as `files/skills/<name>/SKILL.md` in the cairn repo
— byte-identical copies, never Pi-localized. The `/skill:x` vs `/x` difference is
a harness invocation convention, not a body fork.

## agy (Antigravity CLI) users

agy has its own native plugin — `packages/cairn-agy/` — because `agy plugin import claude`
does not ingest marketplace plugins. Install via:

```
agy plugin install github:winnorton/cairn//packages/cairn-agy@main
```

## Marketplace model

Claude Code plugins are distributed through marketplaces. The cairn repo root contains
a `.claude-plugin/marketplace.json` that lists this plugin; `claude plugin marketplace add`
registers it, then `claude plugin install cairn` fetches the plugin from the declared source.

The plugin manifest lives at `packages/cairn-claude/.claude-plugin/plugin.json`.
The `skills/` directory at the package root is auto-discovered by the Claude Code harness.

## Source of truth

`files/skills/<name>/SKILL.md` in the
[cairn repo](https://github.com/winnorton/cairn) is canonical. `skills/` here is a
committed byte-identical copy enforced by `scripts/sync-skills.mjs --check`. Send
PRs against the source files, not these copies. Versions are lockstep with cairn
releases.

## License

MIT
