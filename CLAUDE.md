# cairn

This is a **skill authoring project**. The shipped artifact is a tree of agent skills
(plus supporting memory, laws, and context templates) that other projects adopt via
`adopt cairn`. Most edits target a skill under `files/skills/<name>/SKILL.md`.

**Full agent context is in [AGENTS.md](AGENTS.md)** — read it before working in this repo.
That file is canonical; this file exists so Claude Code's CLAUDE.md auto-discovery still
lands on the topline and the AGENTS.md pointer.

Key orientation pointers (all detailed in AGENTS.md):

- **Latest tag is v0.13.1**; v0.14.0 architectural shift is in-program at
  [`docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`](docs/specs/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
  — read it before touching `manifest.json`, `adopt.md`, or path conventions.
- **Design rationale lives in [docs/research/](docs/research/)** — 9 papers explaining
  *why* each architectural choice exists. Consult before adding/changing structure.
- **18 skills** under `files/skills/<name>/SKILL.md`. New skill = new subdirectory +
  matching entries in [AGENTS.md](AGENTS.md) and [files/skills/README.md](files/skills/README.md).
- **Hard rules** in [LAWS.md](LAWS.md); session handoff in [HANDOFF.md](HANDOFF.md)
  (must update in the same commit as `VERSION` per `[LAW handoff-stays-current]`).
