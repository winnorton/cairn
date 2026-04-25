# Research notes

Short essays written during cairn's early development, studying the framework
from inside the habitat it creates. Several were updated when a Phase 2 transcript
(v0.7.0–v0.10.5) added new evidence — they're snapshots, not living documents,
but the snapshots got refreshed when more data landed.

## Entries

- **[agentic-habitat.md](agentic-habitat.md)** — What agents need to remember,
  ranked by what breaks first if removed. Four-layer map of cairn, the minimum
  viable habitat finding, citation asymmetry, gap-analysis paradigm bias.
  *Updated with Phase 2 evidence: cross-platform adoption results.*

- **[two-file-habitat.md](two-file-habitat.md)** — Two independent questions
  ("what's the least an agent needs?" and "what transfers across agents?")
  converge on the same answer: a context file and a memory index.

- **[feedback-velocity.md](feedback-velocity.md)** — Observations from shipping
  seven releases in one session driven by agent-filed feedback.

- **[habitat-transfer.md](habitat-transfer.md)** — Cross-session observation of
  cairn habitat working: a fresh agent in a different workspace and domain
  applied `[LAW 4]` to a real architectural decision. *Phase 2 added evidence
  from cross-platform tests across Cowork, Antigravity (Gemini Pro 3.1, Opus),
  and Claude Code.*

- **[collaboration-skills.md](collaboration-skills.md)** — The paper that led
  to cairn's collaboration-skills layer. Phase 1 surfaced 8 patterns and
  produced `/bridge`, `/advocate`, `/tempo`-as-plan-step. *Phase 2 added three
  more patterns (experimental design, bidirectional verification, agent-model
  correction), validated cross-platform skill transfer, and surfaced two new
  candidates: `/experiment` and `/verify` (the latter folded into `/bridge`
  Step 3.5 in v0.10.6).*

- **[human-interaction-patterns.md](human-interaction-patterns.md)** — The
  field notes behind `collaboration-skills.md`. All patterns enumerated with
  message-instance citations from both transcripts.

- **[open-questions.md](open-questions.md)** — Research questions still open
  after Phase 2. Includes "can the human be removed from the message bus?",
  "what happens when the human is wrong?", and the third-skill-category
  (coordination skills) hypothesis.

- **[distillate-to-production.md](distillate-to-production.md)** — The first
  end-to-end arc from research finding to shipped code. Six steps, four
  sessions, three platforms (Cowork → Antigravity → Claude Code), two repos.
  Per-step table of which cairn primitive each transition depended on, what's
  still manual, and what made the arc reproducible. Strongest cross-workspace
  validation cairn has received — code-level, not just artifact-level.

## The Phase 2 update (added 2026-04-25)

A second transcript covering v0.7.0 → v0.10.5 added cross-platform validation
data: Gemini Pro 3.1 and Opus both adopted cairn in Antigravity, ran skills
that originated from Phase 1 analysis (`/bridge`, `/reflect`, `/resume`),
and produced behaviors that confirmed and extended the original findings.
The most surprising finding: **bidirectional verification** — a Gemini session
corrected the human with timestamped tool-log evidence when the human
misremembered who initiated a `git clone`. The human isn't always the
authority; asking for evidence is how you discover it.

## Why these live here

Not under `files/` — that's the payload directory for cairn's installation;
those docs would end up in every user's habitat. These are about cairn, not
part of cairn. The repo hosts them so they're readable on GitHub without
polluting user installs.
