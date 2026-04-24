# Research notes

Short essays written during cairn's early development, studying the framework
from inside the habitat it creates. Most were drafted around v0.5.0–v0.6.3 —
snapshots of specific moments, not living documents.

## Entries

- **[agentic-habitat.md](agentic-habitat.md)** — What agents need to remember,
  ranked by what breaks first if removed. Four-layer map of cairn, the minimum
  viable habitat finding, citation asymmetry, and the "gap analysis has paradigm
  bias" observation.

- **[two-file-habitat.md](two-file-habitat.md)** — Two independent questions
  ("what's the least an agent needs?" and "what transfers across agents?")
  converge on the same answer: a context file and a memory index. When
  convergence happens on the same boundary, the boundary is real.

- **[feedback-velocity.md](feedback-velocity.md)** — Observations from shipping
  seven releases in one session driven by agent-filed feedback. Where the model
  works well (solo maintainers, early frameworks, low-stakes fixes) and where
  it doesn't.

- **[habitat-transfer.md](habitat-transfer.md)** — The first cross-session
  observation of cairn habitat working: a fresh agent instance in a different
  workspace and domain (game engine research) adopted cairn, read the laws, and
  applied `[LAW 4]` to a real architectural decision. Positive signal, with
  honest limitations named.

- **[cross-session-observation.md](cross-session-observation.md)** — The field
  notes behind `habitat-transfer.md`. What transferred (tour, laws, plan skill
  format), what couldn't be observed from outside the session, and the open
  questions the single citation raises.

- **[collaboration-skills.md](collaboration-skills.md)** — The paper that led to
  cairn's v0.7.0 collaboration skills. Transcript analysis of 60 human messages
  surfaced 8 interaction patterns; 3 pass formalization (`/bridge`, `/advocate`,
  and a `/plan` enhancement for timing). Introduces the maintenance-vs-collaboration
  taxonomy and names the design principle: "observe the collaboration first, then
  package what you see."

- **[human-interaction-patterns.md](human-interaction-patterns.md)** — The field
  notes behind `collaboration-skills.md`. All 8 patterns with instance counts,
  categorized by formalizability.

## Why these live here

Not under `files/` — that's the payload directory for cairn's installation;
those docs would end up in every user's habitat. These are about cairn, not
part of cairn. The repo hosts them so they're readable on GitHub without
polluting user installs.
