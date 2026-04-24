# Research notes

Short essays written during cairn's early development, studying the framework
from inside the habitat it creates. All three were drafted around the v0.5.0
release — they're snapshots of a specific moment, not living documents.

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

## Why these live here

Not under `files/` — that's the payload directory for cairn's installation;
those docs would end up in every user's habitat. These are about cairn, not
part of cairn. The repo hosts them so they're readable on GitHub without
polluting user installs.
