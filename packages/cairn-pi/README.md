# @winnorton/cairn-pi

[cairn](https://github.com/winnorton/cairn)'s `/spec` + `/program`
authoring-and-orchestration loop, packaged natively for the
[Pi coding agent](https://pi.dev). Markdown skills only — no runtime code, no build step.

## Install

```
pi install npm:@winnorton/cairn-pi        # user-global (~/.pi/agent/npm/)
pi install -l npm:@winnorton/cairn-pi     # project-local (.pi/npm/, recorded in .pi/settings.json — team-shareable)
```

### Connect cairn state (one user step)

After installing the package, add one line to your project's `AGENTS.md` so Pi can read cairn's memory, laws, and context:

```
@./.cairn/CLAUDE.md
```

This line imports the cairn-generated context from `<project>/.cairn/CLAUDE.md` — the file produced by `adopt cairn`. Pi auto-loads `AGENTS.md` at session start; the import gives the agent access to project laws, typed memory, and cairn context. This is the only vendor-file touch cairn requests; the user adds it, not the agent.

**cairn state lives in `<project>/.cairn/`** (git-tracked, project-local). The layout:

```
<project>/.cairn/
├── CLAUDE.md         # imported by your AGENTS.md (see above)
├── LAWS.md           # project laws
├── memory/
│   ├── MEMORY.md     # index
│   └── user/ feedback/ project/ reference/
└── cairn-version     # version marker
```

If you haven't run `adopt cairn` yet, do that first to create the `.cairn/` tree. See [cairn README](https://github.com/winnorton/cairn) for the full adopt flow.

## What you get

The skill bodies say `/spec`, `/program`, `/peer-review` — the Claude Code invocation
form. In Pi the same skills answer to `/skill:spec`, `/skill:program`,
`/skill:peer-review`. The bodies are shared source across harnesses; read `/x` as
`/skill:x`. Trigger-phrase matching works identically in both.

## Pair with rpiv-todo

Cairn deliberately ships **no** todo/orchestration overlay. For multi-phase spec
execution, pair with
[`@juicesharp/rpiv-todo`](https://pi.dev/packages?name=todo) and prefix todos with the
spec phase identifier (e.g. `P1_05:`) for clean rollups at `/skill:round-review` time.

## Source of truth

`files/skills/<name>/SKILL.md` in the [cairn repo](https://github.com/winnorton/cairn)
is canonical. `skills/` here is a committed byte-identical copy enforced by
`scripts/sync-skills.mjs --check` (runs on `prepublishOnly`). Send PRs against the
source files, not these copies. When source prose changes, update and review the root
`scripts/skill-body-word-baseline.json`; package-local sync checks cover copy identity
and description caps, not the body-word ratchet. Any baseline increase requires explicit
review justification. Versions are lockstep with cairn releases.

## License

MIT
