# /distillate-pipe — Skill Idea — Note

> **Filed:** 2026-06-09 · **By:** Claude Opus 4.7 (via fresh-agent `/session-distill` invocation on `docs/origin/748aff00-e737-45e3-b007-c4e5ab219e9b.jsonl`) · **Status:** open (gate-watch, 1/3 instances)

The fresh-agent distillation of cairn's foundational build session surfaced an unnamed pattern at L1700: the maintainer repurposed cairn's public `/feature` HTTP endpoint (built originally for the `/feedback` skill) as an ad-hoc inter-session message bus. Quote: *"i also had Fix ECS Component execute a /reflect. I had it submit its reflection to our feature end point. check it"* — then at L1735: *"Delete it after this. But first see if that agents use of reflection met our needs"* — a one-shot pipe from a parallel agent's reflection output into the build-session's input. The `/reflect` distillate became the message; the cairn endpoint became the wire; the maintainer became the router. This isn't `/bridge` (which is a structured handoff verb) and it isn't `/feedback` (which is meant for cairn-the-framework's own feedback). It's a third thing — *use existing shared infrastructure as an ephemeral message channel between sessions, then clean up* — and it foreshadows the distillate-shaped flow the research papers later credit `/reflect` Step 6 + downstream-consumer pattern for. **Candidate skill:** `/distillate-pipe` — explicit verb for "pipe N agent outputs through a shared endpoint to one consumer session, with explicit cleanup as part of the contract." 3-instance gate per `NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md` (now promoted to `/session-distill`): currently 1/3 — file as a watch item, propose only when two more instances surface in future distillations.

- **Source:** `docs/origin/748aff00-e737-45e3-b007-c4e5ab219e9b.jsonl` L1700 (the repurpose) + L1735 (the cleanup directive)
- **Why this isn't `/bridge`:** `/bridge` carries context between sessions via the human-as-bus pattern (read → judge → paste). This pattern uses an HTTP endpoint as the bus, eliminating the manual paste step for one-shot flows.
- **Why this isn't `/feedback`:** the endpoint was designed for cairn-the-framework's own issue tracking; the maintainer reused it because it happened to accept POST + return a URL — i.e. it was the available shared channel, not the right one.
- **Gate-watch signal:** if a future distillation surfaces a maintainer-reused-existing-endpoint-as-message-bus pattern OR a session where one agent's output is HTTP-piped to another's input via cairn-the-framework's infrastructure, count as +1 toward gate.

---

*Note — pre-emptive intent capture. If two more instances surface, promote via `/spec --from docs/notes/NOTE_DISTILLATE_PIPE_CANDIDATE_2026-06-09.md`.*
