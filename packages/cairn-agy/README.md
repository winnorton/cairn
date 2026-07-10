# cairn (agy plugin)

[cairn](https://github.com/winnorton/cairn)'s full skill catalog packaged as an
Antigravity CLI (agy) native plugin. Markdown skills only — no runtime code, no build step.

## Install

### From GitHub (recommended)

```
agy plugin install github:winnorton/cairn//packages/cairn-agy@main
```

agy resolves GitHub subpaths with branch resolution directly — no tarball or
intermediate step needed.

After install, confirm with:

```
agy plugin list
# expect: cairn  0.14.0  ...
```

### From a local clone

```
agy plugin install /path/to/cairn/packages/cairn-agy
```

`install` accepts a local directory path.

## What you get

All 18 cairn skills, invocable as `/skill-name` in Antigravity:

| Category | Skills |
|---|---|
| Maintenance | `/tour`, `/reflect`, `/plan`, `/prune`, `/audit`, `/feedback` |
| Collaboration | `/reframe`, `/bridge`, `/advocate` |
| Cross-perspective | `/peer-review`, `/session-distill` |
| Artifact | `/note`, `/spec`, `/program`, `/round-review`, `/fast-execute`, `/prompt-evolve`, `/lra` |

## Where state lands

Agent state lives in `<project>/.cairn/` (per AGENTS.md). Skills are loaded from
this plugin — skills are not stored in `.cairn/`.

## Invocation note

After plugin install, skills are invocable as `/name` (e.g. `/spec`, `/peer-review`).
These are the same skill bodies as `files/skills/<name>/SKILL.md` in the cairn repo
— byte-identical copies, never locally modified. The skill bodies work identically
across agy, Claude Code (via cairn-claude), and Pi (via cairn-pi).

## Source of truth

`files/skills/<name>/SKILL.md` in the
[cairn repo](https://github.com/winnorton/cairn) is canonical. `skills/` here is a
committed byte-identical copy enforced by `scripts/sync-skills.mjs --check`. Send
PRs against the source files, not these copies. When source prose changes, update and
review the root `scripts/skill-body-word-baseline.json`; package-local sync checks cover
copy identity and description caps, not the body-word ratchet. Any baseline increase
requires explicit review justification. Versions are lockstep with cairn releases.

## License

MIT
