# NOTE: formalize the "stand by for completion" external-executor handoff state

> Filed: 2026-06-11 · By: agent (per /session-distill on `817c311b`) · Status: open · Gate watch (2/3)

## The pattern

When the user signals an explicit handoff to an external executor and asks the
agent to wait for return ("stand by for completion", "stand by", "coder is on
it"), there's a recognizable state with three obligations:

1. **Acknowledge the dispatch** — name what was committed/pushed/dispatched.
2. **Name the return-check criteria** — what to verify when "coder finished"
   comes back (DoD gates, test runs, baseline ratchet, etc.).
3. **Name the expected artifacts** — what files, commits, or measurements
   should exist on return.

Currently this state is implicit. The agent acknowledges the handoff but doesn't
consistently produce the standby packet.

## Evidence (2/3 toward gate)

1. `601821ab` (cwar session) — implicit external-executor handoff via Opus →
   Antigravity Flash pattern; the user dropped through 95 prompts partly because
   no formal standby packet existed.
2. `817c311b` (fable_first) at 01:08 — *"commit, push. give any execution
   guidance and stand by for completion"* — explicit standby request. Agent
   handled but no formalized packet pattern.

Need 1 more instance to promote to a standing instruction or skill change.

## What it would look like if formalized

Either:

- **As a `/program` or `/round-review` standing instruction:** *"When the user
  signals an external-executor handoff with 'stand by' / 'coder is on it' /
  similar, produce a standby packet — what was dispatched, return-check
  criteria, expected artifacts — in the same response. Then wait."*

- **As a tiny `/standby` skill:** invoked explicitly or auto-recognized; produces
  the packet, persists it in the program master's status section, and signals
  the agent's wait state.

## What would close this

Watch the next 3 cwar sessions that involve external-executor handoff. If a 3rd
instance surfaces where the agent's standby handling is rough — missing return
criteria, no artifact list, user has to re-feed context — promote to a standing
instruction. Prefer the standing-instruction path over a new skill (less surface
to maintain).

## Related

- `[MEM project/cwar_opus_planner_flash_executor_pattern]` — the cross-session
  routing pattern that creates the standby need
- [files/skills/program/SKILL.md](../../files/skills/program/SKILL.md) — natural
  location for the standing instruction when promoted

---

*Note — pre-emptive intent capture. If this becomes real work, promote to `/spec --from`.*
