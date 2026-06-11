# NOTE: chained-imperative prompts are the "simple" orchestration target — preserve

> Filed: 2026-06-11 · By: agent (per /session-distill on `817c311b`) · Status: open · Gate watch

## The pattern

The user packs multiple orchestration verbs into one prompt. The agent should
execute the whole chain end-to-end without intermediate confirmation steps. The
chain IS the dispatch.

## Evidence

From session `817c311b` (fable_first, marked "went well" by user):

- 00:41 — *"commit and get peer review"* (commit + peer-review)
- 20:30 — *"yes. and write your law. get your law peer reviewed"* (approve + author law + peer-review)
- 01:08 — *"commit, push. give any execution guidance and stand by for completion"* (commit + push + handoff packet + standby state)

The Fable run executed all three chains end-to-end and the user marked the session
positive. 3+ instances confirmed in one session; the user explicitly articulated
this last turn — *"this skill need to be that simple for the user"*.

## Why this matters now

The standing instructions just added to `/program` and `/round-review` (commit
`5e2fb6e`) include *"close every output with the next dispatch line."* That's
correct for SINGLE-step responses, but **must not fragment chained-imperative
prompts** — if the user packs N steps into one prompt, the agent should NOT
break after step 1 to confirm before step 2.

The interpretation that holds: the next-dispatch line at the bottom of the response
refers to the *next chain*, not the next step within the current chain.

## What would close this

Either:
- Three more sessions where the agent correctly handles chained imperatives without
  fragmenting → no skill change needed; pattern is naturally supported.
- One session where the new "close with next dispatch" standing instruction
  causes the agent to break a chain → file a sub-rule clarifying chain-vs-step
  granularity.

Watch the next 3 sessions that exercise `/program` end-to-end. If chains are
fragmenting, promote to a `/program` standing instruction: *"When the user chains
imperatives in a single prompt, execute the whole chain end-to-end before
proposing the next dispatch line."*

## Related

- [files/skills/program/SKILL.md](../../files/skills/program/SKILL.md) — close-every-output standing instruction
- [files/skills/round-review/SKILL.md](../../files/skills/round-review/SKILL.md) — same
- Commit `5e2fb6e` — where the close-every-output rule shipped

---

*Note — pre-emptive intent capture. If this becomes real work, promote to `/spec --from`.*
