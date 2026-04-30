# Agents/ umbrella + git as memory bus — Note

> **Filed:** 2026-04-30 · **By:** agent (per user request) · **Status:** open

The next major architectural bet: move cairn's persistent state out of vendor
namespaces (`.claude/`, `~/.claude/memory/`) into a cairn-controlled
`<project>/agents/` directory at the project root, making the git repo itself
the memory bus. `git push/pull` becomes cross-machine sync; `git log
agents/memory/` becomes the activity feed; conflicts resolve via merge. The
slug policy and HANDOFF.md `## Related memory paths` pointers retire — the
repo boundary IS the memory boundary. Skill files stay at `~/.claude/skills/`
because Claude Code's loader requires that path; only memory + laws relocate.

Parked at the note stage rather than shipped as v0.14.0 because the scope is
the largest semantic shift since v0.4.0 typed memory. Every existing adopter
would migrate `~/.claude/memory/<slug>/*` into `<project>/agents/memory/`, and
the per-project memory model is a substantial ergonomic shift (same machine,
two projects = two separate memory trees, no automatic crossover). Cross-
project sharing becomes git transport instead of slug pointers — different
mental model to internalize. Worth revisiting when there's appetite for a
breaking-change cycle and a clear answer for cross-cutting feedback that
genuinely applies across projects (collaboration style, agent-behavior rules).

- **Working prototype:** commit `345241a` on `claude/pedantic-benz-a31080`,
  15 files / 159+/116−. Renames template tree (`files/LAWS.md` →
  `files/agents/LAWS.md`, `files/memory/*` → `files/agents/memory/*`),
  repoints manifest dest paths, adds migration section to `adopt.md`, updates
  `resume`/`reflect`/`note` skill bodies to probe `agents/memory/` instead of
  slug paths. The diff is the spec if this gets promoted.
- **Motivation per [MEM project/cairn-blend-strategy-pillars]:** vendor
  folders are scope-creep buckets — Anthropic, Google, etc. decide what lands
  there; cairn doesn't control the semantics. `agents/` is cairn-controlled
  namespace.
- **Open questions to resolve before promoting:** (a) migration story for
  adopters with months of accumulated `~/.claude/memory/<slug>/` content?
  (b) does per-project memory break cross-cutting feedback that genuinely
  applies across projects, or is "git pull from a shared agents-memory repo"
  a workable answer? (c) is plugin packaging in v0.15.x the better
  longer-term solve and this only worth doing alongside that?

---

*Note — pre-emptive intent capture. If this becomes real work, promote to
`/spec --from docs/notes/NOTE_AGENTS_UMBRELLA_2026-04-30.md`.*
