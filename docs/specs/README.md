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

## Spec lifecycles and status

| Lifecycle | Active state (`docs/specs/`) | Shipped state |
|---|---|---|
| **Execution spec** (standalone default) | Folder-as-status — no `Status:` field. | `git mv` to `docs/specs/archive/`. |
| **Program child spec** (`/program` stub → `/spec --from`) | Carries `**Status:** STUB` (or `**Status:** DEFERRED (<trigger>)` until triggered), flipped to `**Status:** READY FOR EXECUTOR` on elaboration; stays in `docs/specs/` (governing master row marked `COMPLETE`) while its parent program is active. | `git mv` completed children to `docs/specs/archive/` with the program master on program completion (unbuilt scheduled-deferral specs stay live in `docs/specs/` with `archive/` on their program link and `../` in the archived master; when a deferred child later ships, `git mv` it to `archive/`, mark its archived master row `COMPLETE`, and restore sibling links). |
| **Round master & stubs** (`/round-review`) | Round master carries `**Status:** Drafted <date> by /round-review`; round stubs follow the program child lifecycle. | `git mv` to `docs/specs/archive/` together with the program master on program completion. |
| **Contract spec** (permanent source of truth) | Stays live in `docs/specs/` permanently; walks `**Status:** DRAFT (Pass 1 — design)` → `SHIPPED (Pass 2 — ...)` → `SHIPPED (Pass 3 — ...)` → `RECONCILED (...)`. | Never archived while current; `archive/` holds superseded contract specs only. |

| Folder | Meaning |
|---|---|
| `docs/specs/` (here) | Active execution specs, in-flight programs (master, children, round artifacts), unbuilt scheduled-deferral specs, and permanent contract specs. |
| `docs/specs/archive/` | Shipped standalone execution specs and completed programs. `git mv` is the ship signal. |
| `docs/specs/_promoted/` | Breadcrumbs for specs promoted upward (e.g. an oversized `/spec` promoted via `/program --from`). |

Move-on-ship: standalone execution specs `git mv` to `docs/specs/archive/` on verified ship; program masters, completed child specs, and round artifacts stay in `docs/specs/` while the program runs (so sibling links hold across parallel worktrees) and `git mv` together when `/round-review` exits with zero stubs (unbuilt scheduled-deferral specs remain live in `docs/specs/`).

## Lifecycle

```
/note (single paragraph)
  ↓  /spec --from <note>
/spec (single execution or permanent contract spec)
  ↓  /program --from <spec>   (when an execution spec outgrows one file)
/program master + N stubs
  ↓  Gate B (/peer-review on committed master + stubs)
  ↓  /spec --from <stub>      (per OPEN stub: STUB → READY FOR EXECUTOR)
elaborated child specs
  ↓  executor runs (marks child rows COMPLETE in master; files stay in docs/specs/)
landed work
  ↓  /round-review
R+1 round master + R+1 stubs (if gaps remain → /spec --from <stub> → next dispatch)
  ↓  loop exits when /round-review writes zero stubs
  ↓  git mv master + completed children + round artifacts to archive/ (scheduled-deferral specs stay live)
```

Each execution artifact stays in `docs/specs/` until standalone ship or program completion (scheduled-deferral specs stay live until built). Cite by markdown link in any status
output (see `/program`'s `Operating rules`).
