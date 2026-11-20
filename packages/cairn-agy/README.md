# cairn (agy plugin)

[cairn](https://github.com/winnorton/cairn)'s full skill catalog packaged as an
Antigravity CLI (agy) native plugin. Markdown skills, plus the `autoresearch` pack's
bundled Node harness — no build step either way.

## Install

### From GitHub (recommended)

```
agy plugin install https://github.com/winnorton/cairn/tree/main/packages/cairn-agy
```

agy fetches the subfolder from the GitHub tree URL directly — no tarball or
intermediate step needed. Replace `main` with a tag to pin a version. Validated on
agy 1.4.6; agy 1.0.x took `github:winnorton/cairn//packages/cairn-agy@main`, which
1.4.6 rejects with "install target must be a directory".

After install, confirm with:

```
agy plugin list
# expect: cairn  0.16.1  ...
```

### From a local clone

```
agy plugin install /path/to/cairn/packages/cairn-agy
```

`install` accepts a local directory path.

## What you get

All 20 cairn skills, invocable as `/skill-name` in Antigravity:

| Category | Skills |
|---|---|
| Maintenance | `/tour`, `/reflect`, `/plan`, `/prune`, `/audit`, `/feedback` |
| Collaboration | `/reframe`, `/bridge`, `/advocate` |
| Cross-perspective | `/peer-review`, `/session-distill` |
| Artifact | `/note`, `/spec`, `/program`, `/round-review`, `/prompt-evolve`, `/lra-lite`, `/swarm` |
| Execution | `/autoresearch`, `/autoresearch-finalize` |

Markdown skills, with one exception: the `autoresearch` pack bundles a zero-dependency
Node harness under `skills/autoresearch{,-finalize}/scripts/`. Those scripts run only
when the skill is invoked, and they need `node`, `git`, and `bash` on PATH. Every command
in those two skills resolves its script path from the base directory the harness announces
at invocation; session state lands in `.auto/` at the project root.

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
