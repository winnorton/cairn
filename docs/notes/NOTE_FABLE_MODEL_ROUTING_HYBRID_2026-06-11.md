# NOTE: Fable as planner+implementer hybrid — model-routing memory candidate

> Filed: 2026-06-11 · By: agent (per /session-distill on `817c311b`) · Status: open · Memory candidate watch

## Observation

First-run session on `claude-fable-5` (`817c311b`, ~11 hours, cwar-engine perf +
behavior-tree hardening) showed:

- **~10 tool calls per user prompt** (720 tool calls / 74 user prompts)
- vs **~4 tool calls per prompt** in `601821ab` (the comparable cwar-Opus session)
- Zero `stopReason: error`
- Only 1 compaction event despite ~11 hours
- Two `/reflect` invocations as natural bookends
- User marked it "went well"

The work spanned **both planning and implementation in one session**: performance
diagnosis, law authorship, peer-review absorption, /spec generation, commit/push,
external-executor handoff, doc sweep. The user's existing model-routing memory
([MEM feedback/model-routing-opus-spec-flash-execute]) routes Opus→Flash across
sessions. Fable may collapse this routing into a single session for medium-scope
work.

## Why this is memory-candidate (not yet memory)

A single positive session is not a routing decision. The user has run Opus and
Flash for months; Fable for one session. Need 2+ more Fable sessions across
different work types to validate before updating routing memory.

Specifically:
- Does Fable hold up on **larger** work (multi-day, multi-program scope)?
- Does Fable hold up on **adversarial** work (peer-reviewing its own output,
  catching its own discipline decay across compactions)?
- Does Fable's tool-call density translate to faster wall-clock completion, or
  just more tool calls per turn?

## What would close this

Two more Fable sessions in different work classes (e.g., one cairn-side skill
authoring session, one multi-program cwar session). If both go well:

Promote to `[MEM feedback/fable-fits-planner-implementer-hybrid-medium-scope]`:

> Fable model handles planner + implementer + reviewer roles in one session
> cleanly for medium-scope work (single program of specs, single feature flag,
> bounded subsystem). Discovered in session 817c311b on 2026-06-10. Distinct
> from Opus → Flash cross-session pattern which remains correct for large-scope
> work where parallel teams + handoff packet structure dominate.

## Related

- [MEM feedback/model-routing-opus-spec-flash-execute] — existing routing rule
  this would augment, not replace
- [docs/research/habitat-transfer.md](../research/habitat-transfer.md) — the
  cross-model adoption research; Fable adoption is one more data point for that
  thesis
- [docs/study_sessions/fable_first_817c311b-ce8b-460d-9f0d-eafbbe18ad02.jsonl](../study_sessions/fable_first_817c311b-ce8b-460d-9f0d-eafbbe18ad02.jsonl) — the source transcript

---

*Note — pre-emptive intent capture. If this becomes real work, promote to a
memory write or `/spec --from`.*
