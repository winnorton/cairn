# /cairn-introspect — Skill Idea — Note

> **Filed:** 2026-04-26 · **By:** Claude Opus (cairn-side session) · **Status:** open

A candidate skill that produces a self-contained prompt the user pastes into a fresh
agent session to review a just-completed cairn-using session — specifically through
the cairn-improvement lens (gaps in skills, memory drift, missing forcing functions,
hollow taxonomy categories). Distinct from `/reflect` (which distills what was *learned*
in the work) and from `/feedback` (which files high-confidence structured issues to
the cairn repo). Output is the prompt itself, not direct distillate or filed feedback —
keeping the fresh-agent gate explicit and putting the user in the loop on whether the
introspection actually fires.

## Simplicity check before promoting to a spec

**User principle (2026-04-26):** *"doing fewer things very well is far better than
more things done okay. simplicity is key."* Adding a new skill is a tax on every
adopter — descriptions to read, name-collision risk, taxonomy bloat. The bar should
be high. Test whether existing skills compose the same outcome:

- `/reflect` with cairn declared as `## Downstream consumers` already produces
  cairn-shaped distillate (the upstream-downstream feature from v0.8). Does adding
  "spawn a fresh agent to review this distillate" as a downstream-consumer step
  cover most of the value without a new skill?
- The user can manually draft an introspection prompt — this session's drafted
  prompt for the cwar-cairn arc review is a worked example. Does the friction of
  doing it manually justify a dedicated skill? Or is the friction itself low enough
  that a documentation pattern (a "how to introspect cairn from a session" appendix
  in `files/skills/README.md`) is sufficient?
- A `/feedback` invocation with category `design` already routes structured signal
  to cairn — does that handle the high-confidence end of the same need?

## Promotion gate

Before `/spec --from <this-note>`, count concrete instances of the pattern firing.
If fewer than 3 sessions have wanted this, defer — the pattern isn't real yet, just
a hypothesis. If 3+, the pattern is real and the skill earns its surface. Per
[MEM feedback/audit-before-abstraction-gate], quantitative gate beats vague
"this could be useful."

## Worked example (this session)

Drafted a self-contained prompt for a fresh cairn-side session to review the
2026-04-26 cwar-cairn arc (cairn PRs #30/#31/#32 + cwar PRs #5/#7/#8/#9/#10/#11/#13
+ Antigravity adoption). User framing on whether to do it: *"may yield useful
information, or not."* That hesitation — *"this might be valuable but the prompt-
crafting friction is high enough I'm not sure"* — is exactly the situation
`/cairn-introspect` would target. If users hit that hesitation repeatedly, the skill
is justified. If most users only need this rarely, the documentation-pattern path is
the simpler win.

## What this is NOT

- Not for filing bugs (`/feedback` covers that).
- Not for distilling work-output for downstream consumers (`/reflect` covers that).
- Not for cross-session continuation (`/bridge` covers that).
- It's specifically: *route a session's cairn-relevant insight through a fresh
  external agent before that insight evaporates or gets banked half-formed.*

---

*Note — pre-emptive intent capture. If this becomes real work, promote to a `/spec`
via `/spec --from docs/notes/NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md`. The
breadcrumb in `docs/notes/_promoted/` will preserve this note's intent paragraph
even after the spec lands.*
