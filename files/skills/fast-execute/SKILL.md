---
name: fast-execute
description: Turn an autonomous executor agent (Google Antigravity Flash, or any harness with timer + file-read primitives) into a polling daemon that watches a sentinel-file inbox in `docs/specs/`, picks up `/round-review`-produced round masters, executes their first-action checklist, marks completion, and re-arms its timer. Removes dispatch-prompt friction from multi-round `/program` loops — Opus writes the round master plus a sibling `.ready` sentinel; the executor picks it up automatically on the next poll; the loop runs without continuous user attention. Protocol — sentinel atomic-flip (`.ready` → `.claimed` → executed → `.done`), default poll 300s, stop on explicit `STOP.signal` OR 3 consecutive empty polls OR malformed inbox. Tightly coupled to `/round-review`'s output shape (round master at `docs/specs/SPEC_<NAME>_R<N>_00_MASTER.md`). Do NOT use in harnesses without timer primitives (fall back to manual `/goal execute <master>`) or for one-shot dispatches where polling overhead exceeds value.
---

# Fast Execute

You are an autonomous executor agent (typically Google Antigravity Flash, or any
harness with a timer primitive). This skill turns you into a **polling daemon**
that watches a sentinel-file inbox, picks up dispatched work from the planning
agent (typically Opus running `/round-review`), executes it, and re-arms its
timer for the next round.

## Why this skill exists

The cairn orchestration loop is `/program` → `/spec --from <stub>` (elaborate)
→ executor (this skill) → `/round-review` (planning agent reviews + drafts
R+1) → repeat. The friction the loop has had is at the **dispatch seam** — the
user (or the planning agent) has to type a dispatch prompt every round
("`/goal execute docs/specs/SPEC_X_R3_00_MASTER.md`"). The cwar session
`601821ab` produced 4+ user re-authorizations of "spawn agents" and 4+ "next
step?" prompts at this seam. Manual dispatch is the bottleneck.

This skill closes the loop. Once invoked, the executor:

1. Watches a known inbox path.
2. Picks up new work automatically when the planning agent drops it there.
3. Executes per the round master's first-action checklist.
4. Marks completion via sentinel flip.
5. Sleeps, then re-checks.

The planning agent (Opus) does its `/round-review` → writes the next round
master → drops the sentinel → walks away. The executor (you) picks it up on
the next poll. The user never has to type the dispatch.

## When to use

You're invoked when:

- The user (or planning agent) writes `/fast-execute` in this session.
- The harness has a timer / schedule primitive (Antigravity `schedule` tool,
  Pi `--watch`, equivalent).
- The project has a `/round-review`-produced round master at the expected
  inbox path, OR will soon (the loop self-starts on the first sentinel).

## When NOT to use

- **Harnesses without a timer primitive.** Without scheduled wake-up, the loop
  can't continue across turn boundaries. Fall back to manual `/goal execute
  <master>` per dispatch.
- **One-shot dispatches.** If only one round of work exists and no follow-up
  is expected, the polling overhead exceeds the value. Use manual dispatch.
- **Multiple competing executors on the same inbox.** This skill assumes one
  executor per inbox. If two executors poll the same path, they'll race on
  sentinel flips. Per-executor inbox subfolders (`docs/specs/.inbox/<executor-id>/`)
  if you must.

## Distinction from `/goal` and from `/round-review`

| | `/goal execute <master>` | `/fast-execute` | `/round-review` |
|---|---|---|---|
| Role | Manual single-shot dispatch | Autonomous polling executor | Planning agent's review verb |
| Trigger | User types each round | User types once; loops | Planning agent at round-end |
| Output | One round of work | N rounds of work | Round master + R+1 stubs |
| Inbox | None — path given inline | Sentinel-file at `docs/specs/` | N/A (produces inbox content) |
| Loop role | One turn of the loop | The executor turn, repeated | The review turn |

`/fast-execute` is the executor side of the orchestration loop, made autonomous.
`/round-review` is the planning side that feeds it. `/goal execute <master>`
is the manual fallback when a timer primitive isn't available.

## Steps

### 1. On first invocation — initialize

1. Confirm the harness has a timer primitive (e.g. `schedule` tool in Antigravity).
   If not, abort and tell the user to use manual `/goal execute <master>`.
2. Acknowledge entry into the polling state. Surface to the user:
   - The inbox path you're watching (default `docs/specs/`)
   - The poll interval (default 300s)
   - The stop conditions (explicit `STOP.signal`, idle-N-polls default 3,
     malformed-inbox abort)
3. Immediately run Step 2 (don't wait the first interval — pickup work that
   might already be in the inbox).

### 2. Check inbox — sentinel-file scan

Look for files matching the pattern:

```
docs/specs/SPEC_*_R<N>_00_MASTER.md.ready
```

Each `*.ready` file is a sentinel. The file it sentinels is the same path
without `.ready` — e.g. `SPEC_MAP_PROCESS_TELEMETRY_R2_00_MASTER.md.ready`
sentinels `SPEC_MAP_PROCESS_TELEMETRY_R2_00_MASTER.md`.

**The sentinel pattern is atomic.** The planning agent writes the round
master first, THEN creates the `.ready` sentinel. Until the sentinel exists,
the master is not safe to read (it may be half-written). When the sentinel
exists, the master is committed and ready.

If **zero** `.ready` files exist:
- Increment idle-poll counter.
- If idle-poll counter exceeds stop threshold (default 3) → STOP (Step 6).
- Otherwise, schedule next poll (Step 5).

If **one or more** `.ready` files exist:
- Pick the OLDEST by mtime (FIFO). One per wake — do not drain the queue.
- Proceed to Step 3.

If **a `STOP.signal` file** exists at `docs/specs/STOP.signal`:
- STOP (Step 6).

### 3. Claim the work — sentinel atomic-flip

Before reading the master:

```bash
git mv docs/specs/SPEC_X_R<N>_00_MASTER.md.ready docs/specs/SPEC_X_R<N>_00_MASTER.md.claimed
```

(or `mv` if not git-tracked). The `.claimed` rename signals to any other
executor "this is mine, don't touch."

Reset the idle-poll counter to 0.

If the rename fails (race condition with another executor or sentinel deleted
under you), log it and return to Step 2.

### 4. Execute

Read the round master file the sentinel referenced (now `SPEC_X_R<N>_00_MASTER.md`,
the bare name). Follow its `§4 First-action checklist` per the `/round-review`
output convention:

1. Read this round master end-to-end.
2. Read the original program master (`SPEC_<NAME>_00_PROGRAM.md`) for shared
   contracts.
3. Read any referenced notes / prior baselines.
4. Inventory the working tree.
5. Execute the R<N> stubs per §1 (the round's execution-order graph).
6. For each stub: either elaborate via `/spec --from <stub>` first, OR execute
   directly using the stub's Goal/Scope/Gate fields.

If your harness offers `/goal` (Antigravity) or equivalent, you may invoke it
to delegate execution: `/goal execute docs/specs/SPEC_X_R<N>_00_MASTER.md`.
Otherwise execute the checklist directly.

**Per `/round-review`'s `§3 Round-level Definition of Done`, the round is
complete when all the §3 numbered criteria hold.** Stop executing when §3
is satisfied OR when execution hits a hard block that requires planning-agent
attention (see Step 7).

### 5. Mark completion — outbox sentinel

On successful execution of the round:

```bash
git mv docs/specs/SPEC_X_R<N>_00_MASTER.md.claimed docs/specs/SPEC_X_R<N>_00_MASTER.md.done
```

The `.done` sentinel is the planning agent's signal that this round is ready
for `/round-review` (Pass N+1).

Schedule the next poll (Step 5) and exit this turn cleanly. The harness wakes
you on the next interval; you return to Step 2.

### 6. Schedule next poll

Use the harness's timer primitive:

- **Antigravity**: invoke the `schedule` tool with `DurationSeconds: <poll-interval>`
  and `Prompt: "Fast-execute polling check"` (or whatever the harness expects).
- **Pi**: equivalent `--watch <interval>` mode.
- **Other**: see the Harness-specific notes below.

Then exit this turn. The harness wakes you on the next interval.

### 7. Stop conditions

You STOP (exit the loop, do not re-arm the timer) when any of these hold:

1. **Explicit stop signal.** A file exists at `docs/specs/STOP.signal`. Read
   its contents (often a one-line reason) and surface to the user before
   exiting.
2. **Idle-N-polls.** N consecutive polls returned zero `.ready` files
   (default N=3). The loop assumes no more work is coming.
3. **Malformed inbox.** A `.ready` sentinel exists but the corresponding
   master is missing, unreadable, or doesn't match the `/round-review`
   output shape. Write a diagnostic to `docs/specs/INBOX_REJECT/<timestamp>.md`
   describing the problem and exit.
4. **Hard execution block.** The round master's instructions can't be
   followed (a dependency is missing, an external service is down, the
   master's §5 was already amended by an out-of-band agent). Mark the
   sentinel `.blocked` with a sibling `<name>.blocked.note.md` describing
   why, then exit. The planning agent will see `.blocked` on its next
   `/round-review` and decide.

On any stop condition, surface a clear status to the user:

```
/fast-execute STOPPED: <reason>
Inbox state: <summary>
Last completed round: <SPEC_X_R<N>_00_MASTER.md, if any>
Next action: <suggested move for the user or planning agent>
```

## Inbox protocol summary

The sentinel-flip lifecycle:

```
(planning agent writes)
    docs/specs/SPEC_X_R<N>_00_MASTER.md            ← master content
    docs/specs/SPEC_X_R<N>_00_MASTER.md.ready      ← sentinel: "claimable"

(executor claims)
    docs/specs/SPEC_X_R<N>_00_MASTER.md
    docs/specs/SPEC_X_R<N>_00_MASTER.md.claimed    ← sentinel: "in-progress"

(executor completes)
    docs/specs/SPEC_X_R<N>_00_MASTER.md
    docs/specs/SPEC_X_R<N>_00_MASTER.md.done       ← sentinel: "round complete"

(planning agent on next /round-review)
    — moves master to docs/specs/archive/ if program done
    — OR writes next round master + .ready and the cycle continues
```

The sentinel suffix is always one of `.ready`, `.claimed`, `.done`, `.blocked`.
The transitions are atomic file renames — no in-place mutation.

## Outbox protocol summary

There is no separate outbox path. The `.done` sentinel IS the outbox signal.
The planning agent's `/round-review` invocation scans for `.done` sentinels
to know which rounds completed since last review.

## Harness-specific notes

### Antigravity (primary target)

- Timer primitive: `schedule` tool with `DurationSeconds` arg
- Recommended interval: 300s (5min) default; the tool accepts arbitrary values
- Recommended max session duration: 6-12 hours per Flash invocation; spawn
  fresh sessions for longer loops
- Cross-turn state: the schedule prompt should re-state which inbox you're
  watching so a fresh agent session re-entering on wake has context

### Pi (`--watch` mode)

- Timer primitive: Pi's native `--watch <interval>` flag
- File access primitive: standard filesystem
- Sentinel pattern translates directly

### Claude Code

- No native timer primitive for inter-turn sleep, but background tasks +
  user-driven re-entry can simulate
- Practically: better suited to manual `/goal execute <master>` than to
  `/fast-execute`. If used, the user re-enters the session at each interval

### Cowork

- Untested as of this skill's first ship. Treat as Claude Code (manual
  re-entry) until validated.

## Standing instructions (defaults baked in)

- **One-per-wake, FIFO.** Pick the oldest `.ready` sentinel and execute that
  round to completion. Do not drain multiple rounds in one wake — failure mid-drain
  is harder to recover from than failure mid-single-round.
- **Atomic renames only.** Never delete sentinels and re-create them; always
  use `git mv` or atomic `mv`. The atomicity is what prevents races.
- **No quiet failures.** Every stop condition surfaces to the user with a
  clear reason and a recommended next action. The polling daemon dying
  silently is the worst failure mode.
- **Resume-safe.** If your session is interrupted mid-execution (harness
  restart, crash, user kill), the `.claimed` sentinel persists. A fresh
  `/fast-execute` invocation will see the `.claimed` sentinel and either
  (a) ignore it (another executor is on it) or (b) report it as stale-claimed
  to the user. Never auto-recover from another agent's `.claimed` without
  user confirmation.
- **Surface session metadata on every status output.** When reporting
  pickup/completion/stop, include this session's ID + transcript path so
  the planning agent can correlate. Same standing instruction as `/program`
  and `/round-review`.
- **Close every status update with the next-expected event.** "Next poll
  in 5min." "Awaiting `.ready` sentinel at `docs/specs/`." "Round R3 done
  — planning agent will see `.done` on next `/round-review`."

## Output

You're a daemon, not a report-producer. Your "output" is status updates:

- **On entry:** acknowledgment with inbox path, poll interval, stop conditions.
- **On each poll:** terse one-liner — "Polled at `<timestamp>`. Found N sentinels.
  Picked up `<name>`." Or "Polled — empty. Idle-count `<n>`/`<N>`. Next poll
  `<seconds>`s."
- **On completion of a round:** "Round R<N> complete. Sentinel flipped to
  `.done`. Next poll `<seconds>`s."
- **On stop:** the structured stop message from Step 6.

Keep each update under 5 lines. The user is watching a daemon, not reading
a report.

## Companion skills

- **`/round-review`** — the upstream planning verb that produces the round
  masters this skill consumes. The `.ready` sentinel is `/round-review`'s
  responsibility to create; the `.done` sentinel is this skill's
  responsibility to flip. Their contract is the sentinel-flip protocol above.
- **`/program`** — the program-of-specs scaffold these rounds belong to. A
  round-master in the inbox always cites its parent program master.
- **`/spec --from <stub>`** — when a round's stub specs need elaboration
  before execution, this skill delegates to `/spec --from`. Elaboration is
  part of executing the round, not a separate dispatch.
- **`/goal`** (Antigravity native) — the harness's autonomous-execution verb;
  this skill may delegate per-round execution to `/goal execute <master>`
  internally, or execute the checklist directly. Same outcome.
- **`/standby`** (if/when promoted from `NOTE_STANDBY_HANDOFF_FORMALIZATION_2026-06-11`)
  — the planning-side counterpart for when the executor is in this skill's
  polling state. The standby packet would describe what the executor is
  expecting in the inbox and what to check when it returns.
