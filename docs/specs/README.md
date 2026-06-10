# Specs

Structured agent execution specs. Phases, steps, checkpoints, executor handoff. Produced
by [`/spec`](../../files/skills/spec/SKILL.md) and [`/program`](../../files/skills/program/SKILL.md);
verified by [`/round-review`](../../files/skills/round-review/SKILL.md) after each
executor round.

## Filename patterns

| Producer | Pattern |
|---|---|
| `/spec` (single) | `SPEC_<NAME>.md` |
| `/spec --from <note>` (promoted) | `SPEC_<NAME>.md` (same shape; breadcrumb in `docs/notes/_promoted/`) |
| `/program` master | `SPEC_<NAME>_00_PROGRAM.md` |
| `/program` workstream stub | `SPEC_<NAME>_<NN>_<TOPIC>.md` |
| `/round-review` round master | `SPEC_<NAME>_R<N>_00_MASTER.md` |
| `/round-review` round stub | `SPEC_<NAME>_R<N>_<NN>_<TOPIC>.md` |

## Folder-as-status (no `Status:` field)

| Folder | Meaning |
|---|---|
| `docs/specs/` (here) | Active — open spec or in-flight program. |
| `docs/specs/archive/` | Shipped. `git mv` is the ship signal. |
| `docs/specs/_promoted/` | (Optional) breadcrumbs for specs that got further promoted, e.g. a single `/spec` that grew into a `/program`. |

Move-on-ship: `git mv docs/specs/SPEC_X.md docs/specs/archive/SPEC_X.md` IS the ship
event. The mv shows up in the closing PR diff, the active folder shrinks back to live
work only, and `archive/` grows monotonically.

## Lifecycle

```
/note (single paragraph)
  ↓  /spec --from <note>
/spec (single, full phases)
  ↓  /program --from <spec>   (when spec outgrows one file)
/program master + N stubs
  ↓  /spec --from <stub>      (per stub)
elaborated child specs
  ↓  executor runs
landed work
  ↓  /round-review
R+1 round master + R+1 stubs (if gaps remain)
  ↓  next dispatch
loop exits when /round-review writes zero stubs
  ↓  git mv to archive/
```

Each artifact stays in `docs/specs/` until shipped. Cite by markdown link in any status
output (see `/program`'s Spec-link discipline standing instruction).
