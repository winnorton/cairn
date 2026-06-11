# @winnorton/cairn-pi

[cairn](https://github.com/winnorton/cairn)'s `/spec` + `/program`
authoring-and-orchestration loop, packaged natively for the
[Pi coding agent](https://pi.dev). Markdown skills only — no runtime code, no build step.

## Install

```
pi install npm:@winnorton/cairn-pi        # user-global (~/.pi/agent/npm/)
pi install -l npm:@winnorton/cairn-pi     # project-local (.pi/npm/, recorded in .pi/settings.json — team-shareable)
```

## What you get

| Skill | Invoke in Pi | Role in the loop |
|---|---|---|
| `spec` | `/skill:spec` | Research + write a structured execution spec in `docs/specs/` (phases, steps, checkpoints, executor handoff). `--from` elaborates `/program` stubs and promotes notes. |
| `program` | `/skill:program` | Program-of-specs: one master coordination doc + N workstream stubs for work that exceeds one spec. |
| `round-review` | `/skill:round-review` | Trust-but-verify one executor round against the program master's Definition of Done; drafts R+1 stubs + a self-contained round master. |
| `fast-execute` | `/skill:fast-execute` | Polling-daemon executor: watches a sentinel-file inbox in `docs/specs/`, executes dispatched specs, atomic-flips `.ready` → `.claimed` → `.done`. |
| `peer-review` | `/skill:peer-review` | Fresh-agent external review of a change set before merge — reads the diff plus adjacent unchanged files. |
| `note` | `/skill:note` | One-paragraph dated intent capture in `docs/notes/`; the promotion source for `/skill:spec --from`. |

## The loop

```
/skill:note ─► /skill:spec ─► /skill:program (master + stubs)
                                    │  /skill:spec --from <stub>  (elaborate each)
                                    ▼
                executor round (/skill:fast-execute, or read the spec manually)
                                    ▼
                /skill:round-review ─► R+1 stubs + round master ─► next dispatch
                                    ▼
                zero new stubs = done ─► git mv spec to docs/specs/archive/
```

## Invocation note

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
source files, not these copies. Versions are lockstep with cairn releases.

## License

MIT
