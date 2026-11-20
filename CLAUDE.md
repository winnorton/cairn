# cairn

This is a **skill authoring project**. The shipped artifact is a tree of agent skills
(plus supporting memory, laws, and context templates) that other projects adopt via
`adopt cairn`. Most edits target a skill under `files/skills/<name>/SKILL.md`.

**Full agent context is in [AGENTS.md](AGENTS.md)** — read it before working in this repo.
That file is canonical; this file exists so Claude Code's CLAUDE.md auto-discovery still
lands on the topline and the AGENTS.md pointer.

Key orientation pointers (all detailed in AGENTS.md):

- **Sole-maintainer repo.** Commit straight to `main` when asked to commit — no branch
  or PR unless asked. Release with `node scripts/release.mjs` (gates, version bump,
  changelog, tag, push, install refresh). Cold `/peer-review` is on request, not a merge
  gate. Details: AGENTS.md `## Working agreement`.
- **Version** is in [`VERSION`](VERSION); release history in [`CHANGELOG.md`](CHANGELOG.md).
  The v0.14.0 `.cairn/` ownership migration's program master is archived at
  [`docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`](docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
  — read it before touching `manifest.json`, `adopt.md`, or path conventions.
- **Design rationale lives in [docs/research/](docs/research/)** — 9 papers explaining
  *why* each architectural choice exists. Consult before adding/changing structure.
- **20 skills** under `files/skills/<name>/SKILL.md`. New skill = new subdirectory +
  matching entries in [AGENTS.md](AGENTS.md) and [files/skills/README.md](files/skills/README.md).
- **Hard rules** in [LAWS.md](LAWS.md); session handoff in [HANDOFF.md](HANDOFF.md).
