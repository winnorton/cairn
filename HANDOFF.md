# Handoff — cairn build session of 2026-04-24

**For the next agent picking up this work.** This file is the bridge across the session
boundary. Read it first. It exists because session boundaries are where signal goes to die
unless explicitly preserved.

> **Repo-root entry point (canonical, added 2026-06):** read [AGENTS.md](AGENTS.md) at
> the repo root. It's the cairn-itself agent context — layout, 15 skills, key laws by
> slug, design DNA, current state (v0.13.1 + v0.14.0 in flight). Claude Code auto-loads
> [CLAUDE.md](CLAUDE.md), which points at AGENTS.md. If you're a fresh agent landing
> in this repo, AGENTS.md is the orientation you want before anything else.

> **Recommended entry point for prior-session inheritance:** invoke `/resume` (cairn
> v0.10.1+) at session start. The skill probes HANDOFF.md, memory at multiple project
> slugs (worktree-aware AND any `## Related memory paths` declared below), transcript
> junctions, and recent git activity, then synthesizes orientation. If `/resume` isn't
> available in your habitat, read this file directly and follow the manual paths below.

## Related memory paths

After the v0.10.2 slug-policy migration, cairn-native memory lives at **cairn's own
slug** and the cwar slug retains cross-cutting + cwar-native entries. Both are reachable
to a `/resume` in cairn's worktree:

- `~/.claude/projects/C--Users-winno-projects-cairn/memory/` — **cairn slug.**
  Auto-loaded by `/resume` when running in cairn's worktree (it's the local slug).
  Holds cairn-native memory: project state and feedback specific to cairn's own
  development, plus references to cairn artifacts. `/resume` probes for current
  contents — exact entry list shifts with each reflection cycle.

- `~/.claude/projects/C--Users-winno-projects-cwar-cwar-engine/memory/` — **cwar slug.**
  `/resume` finds these via this pointer. Holds cross-cutting feedback
  (collaboration style, agent-behavior rules) that applies across both projects,
  plus cwar-engine-specific project and reference entries. Relevant when cairn
  work intersects cwar (re-adoption, cross-project patterns).

Per `[LAW choose-slug-by-scope]` in cairn's own `LAWS.md`, future memory writes
should go to the slug that matches the scope of the content — not the slug where the
session happens to be running.

## One-line context

Cairn is a portable agent-environment bootstrap — memory, laws, skills, context templates
that an agent installs into any project with one adopt prompt. Built from v0.1.0 → v0.9.1
in a single session on 2026-04-24. Live at https://github.com/winnorton/cairn.

## State at end of session

- **Latest release:** v0.13.1 (Renames the `/review` skill to `/peer-review` to disambiguate from Claude Code's built-in `/review` skill. The bare `/review` was being silently shadowed for any cairn adopter on Claude Code — the cairn skill never fired. Updates: skill subdirectory rename (`files/skills/review/` → `files/skills/peer-review/`), frontmatter `name:` field, manifest src/dest paths, install preview, citations across LAWS.md / HANDOFF.md / README. New migration section in `adopt.md`: re-adopters from v0.12.1+ get prompted by the agent during re-adoption to remove the legacy `~/.claude/skills/review/SKILL.md` file. Posture going forward per `[MEM project/cairn-blend-strategy-pillars]`: vendor namespace collisions are real; cairn claims distinct namespace per skill.)
- **Previous release:** v0.13.0 (Slug-only law identity — drops Law N numbering. Completes the v0.9.0 slug migration; numeric prefixes in law headings removed, slug becomes the only identity, collection size moves to section headers. Meta-rule 2 rewritten as "Slug is identity, count is metadata." Plus connects the reflect↔resume loop in user-facing docs — README's new "Cross-session continuity" section, tour Step 5 names both verbs, `files/skills/README.md` Skill pairings. Migration note in `adopt.md` for re-adopters with `[LAW N]` citations.)
- **Earlier:** v0.12.3 (Doc patch — fixed v0.12.x consistency gaps that fresh `/peer-review` caught). v0.12.2 (install-report version strings). v0.12.1 (skill format migration to canonical subdir form + `/peer-review` skill + folder-as-state for `plans/`). v0.12.0 (`/note` + `/spec` artifact-creation skills). v0.11.3 (ephemeral-sandbox pre-flight in adopt.md).
- **Live feedback endpoint:** https://cairn.winnorton.com/feedback (canonical) and https://cairn-feedback-591252228833.us-central1.run.app/feedback (Cloud Run direct fallback).
- **Empirical confirmation 2026-04-27:** v0.13.0 fresh-perspective `/peer-review` caught README body-text drift the author missed (the v0.9.0-era citation explainer in README's "Usage signal (citations)" section — anchored on `LAWS.md`, didn't grep README's own usage-signal section). Validates `[LAW pre-merge-review]` — exactly the gap class `/peer-review` is built to catch.

## Interim work since v0.13.1 (post-release, pre-v0.14.0)

Captured here to keep `[LAW handoff-stays-current]` honest between releases. None of
this is shipped as a tagged version yet; v0.13.1 is still the latest tag.

- **Design notes filed** (`docs/notes/`, all `Status: open`):
  - `NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md` — `/cairn-introspect` skill candidate,
    gate at 3+ observed instances (currently 1).
  - `NOTE_SUPERVISOR_PATTERN_2026-04-26.md` — generic supervisor analogue to cwar's
    `agent-supervisor.ts`. Deferred awaiting empirical signal from cwar's autoSubmit
    experiment.
  - `NOTE_INREPO_MEMORY_TIER_2026-04-27.md` — in-repo memory tier for multi-dev
    scenarios. Addressed incidentally by v0.14.0's `agents/` move.
  - `NOTE_V0.13.0_FOLLOWUPS_2026-04-27.md` — small follow-up items (tour skill format
    drift was real at filing time; folded in during this interim along with the
    artifact-category expansion to include `/program` + `/round-review`).
- **v0.14.0 spec drafted** at `docs/specs/SPEC_AGENTS_UMBRELLA.md` (untracked at this
  write). Promoted via `/spec --from` from `NOTE_AGENTS_UMBRELLA_2026-04-30.md`
  (now at `docs/notes/_promoted/`). Major architectural shift: state moves out of
  vendor namespaces (`~/.claude/memory/`, `<project>/.claude/`) into a cairn-controlled
  `<project>/agents/` directory at the project root. Forced by 2026-05 Claude Code
  sandbox restrictions on writes combining curl-fetched content + `.claude/*` paths.
  Skill files stay at `~/.claude/skills/` (loader requirement). Read the spec before
  touching `manifest.json`, `adopt.md`, or path conventions.
- **`/program` skill enhanced** (commit `8530390`, 2026-06-09) — added Status reporting
  templates section + Spec-link discipline standing instruction + §9 status-table link
  example. Driven by a session where executor status reports kept producing unlinked
  spec mentions despite repeat user feedback; the discipline is now baked in.
- **Repo-root agent context added** (commit `6193436`, 2026-06-09) — new `AGENTS.md`
  and `CLAUDE.md` at the repo root. Cairn-itself meta (distinct from `files/CLAUDE.md`,
  the template shipped to adopters). Names the load-bearing laws by slug, lists all 15
  skills with links, surfaces design DNA + current state to fresh agents.
- **Skill catalog drift swept** (this interim) — `files/skills/README.md` and
  `tour/SKILL.md` artifact category now include `/program` and `/round-review`.
  Previously stale by 1–2 skills.
- **Pi (pi.dev) added as first-class environment** (2026-06-09). `manifest.json`
  gains `pi:` resolutions for all five `pathVariables`. `adopt.md` Step 1 detection
  adds a Pi branch; Step 3 documents Pi-specific path resolution + the AGENTS.md
  auto-load convention + the rpiv-todo orchestration substrate cairn does NOT
  duplicate. README headline triplet now reads "Claude Code, Antigravity, and Pi"
  (Cowork demoted but still present in pathVariables for backward compat). Pi's
  primary role is as the executor for `/spec` and `/program` artifacts authored in
  Claude Code or Antigravity; the cairn skill format (`<name>/SKILL.md` subdir) is
  identical to Claude Code's, so existing skill files install unchanged. Validation
  evidence: Pi session `019eaed6` executed `SPEC_VAST_TERRAIN_P1_05_WORKER_STAGE_RUNNER`
  cleanly (83 tool calls, zero errors, write > edit ratio) with zero cairn skills
  installed — the spec format itself is the executor contract.
- **`/prompt-evolve` skill added** (2026-06-09). New artifact-category skill —
  total skills goes 15 → 16. Authors a self-improving, version-controlled prompt
  for tough tasks done in many iterative passes over partitions (corpus mining,
  codebase refactor sweeps, doc backfill, bug triage, audits — any task where
  work doesn't fit one execution, partitions are obvious, each pass produces
  output AND insight, and the insight would otherwise be lost between passes).
  Primary mode is `--from <SPEC>` — promotes the evolving-prompt deliverable
  embedded in a `/spec` into a standalone artifact at
  `<docs|project/agents>/prompt-evolve/<NAME>_PROMPT.md`. Enforces a 7-phase
  scaffold (Pre-flight → Inventory → Extract → Write → Verify → Report →
  **Self-Improvement**) with 5 non-negotiable items: Phase 6 absolute-path
  inline, CHANGELOG format, fallback matrix scaffold, Pending Re-run staging,
  idempotence statement. Promotion semantics differ from `/spec --from <note>`
  and `/program --from <spec>`: the source spec STAYS IN PLACE (covers more
  than the prompt). Pattern surfaced from two real instances: fishing-agent's
  `data-pop-prompt` (Gmail → SQLite, by year, 7 CHANGELOG versions v1→v3.6)
  and purduebb's `MINING_PROMPT.md` (web → JSON, by season XOR topic).
  Generalizes to 8 task classes documented in the skill body.
- **`/session-distill` skill added** (2026-06-09). New cross-perspective-category
  skill — total skills goes 16 → 17. **Formalizes cairn's foundational
  methodology** — the transcript-analysis loop documented in
  `docs/research/collaboration-skills.md` and `human-interaction-patterns.md`,
  the same loop that produced `/reframe`, `/bridge`, `/advocate`, and most of
  the collaboration-skills taxonomy. Reads a past agent session JSONL
  transcript (Pi or Claude Code format, auto-detected) cold and produces a
  structured analysis of cairn-improvement findings — patterns recognized
  against a seeded catalog, skill candidates with 3-instance gate check, law
  candidates, memory candidates, environment-support gaps. Reports by default;
  never auto-applies changes; user-side "do it" gates any cairn-side change.
  Promoted from `docs/notes/_promoted/NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md`
  after the 3-instance gate was met in a single session (6+ instances observed
  on 2026-06-09: Pi struggling cwar cleanup; Pi clean vast-terrain execution;
  Claude Code cairn build session 601821ab; the foundational 748aff00 build
  session; fishing-agent; purduebb). The proposed `/cairn-introspect` name was
  renamed to `/session-distill` for namespace safety per
  `[MEM project/cairn-blend-strategy-pillars]` — cairn-prefixed names are
  fragile; the `/session-distill` compound pairs cleanly with cairn's existing
  "distillate" vocabulary from `/reflect`. The seeded pattern catalog lists 8+
  previously-named patterns (cross-session relay → /bridge, reframing →
  /reframe, etc.) so new findings get matched against history rather than
  re-invented. Forms a self-improvement triangle with `/reflect` (in-session
  pair) and `/resume` (consumer of improved habitat).
- **First real `/session-distill` invocation validates skill design** (2026-06-09).
  Spawned a fresh general-purpose agent to run `/session-distill` on Claude Code
  session `601821ab` — the same session that originally produced `/program`'s
  Spec-link discipline. **The skill found a pattern the manual distillation
  missed:** the same user feedback ("always link to the spec being mentioned")
  fired TWICE in that session, at L1096 *and* L1948, separated by an
  auto-compaction. The first instance produced the discipline; the second
  proved the discipline didn't survive the context reset. Result: added a
  **compaction-survival sub-rule** to `/program`'s Spec-link discipline
  standing instruction — when an auto-compaction summary fires, the next
  assistant turn MUST re-state the discipline before resuming status output.
  Generalization (also documented in `/program`): every Standing Instruction
  shipped to a skill needs explicit post-compaction reinforcement, not just
  session-load. Also updated `/session-distill`'s catalog entry for
  status-report-without-spec-links to note the L1948 recurrence, and added
  "executor-overreach-with-overclaim" as a 2/3-instance open candidate based
  on the same fresh-agent finding. Validates the skill's design intent — the
  methodology produced a finding the manual loop missed because the fresh
  agent read the whole transcript end-to-end, including a section the manual
  review had skipped.
- **Foundational session committed to `docs/origin/` + distillate-pipe gate-watch
  note** (commit `95da3b7`, 2026-06-09). The 9MB / 2287-line / ~9h cairn build
  session (`748aff00-...jsonl`, 2026-04-24/25, the corpus the research papers
  were written from) is now in `docs/origin/` for future `/session-distill`
  runs. Redacted in-place via sed: 7 occurrences of a dead GitHub PAT replaced
  with `<github_pat_REDACTED>`. JSONL integrity verified (all 2287 lines parse
  as valid JSON). Plus `docs/notes/NOTE_DISTILLATE_PIPE_CANDIDATE_2026-06-09.md`
  — 1/3 gate-watch on the L1700 "repurpose-shared-endpoint-as-message-bus"
  pattern surfaced by the first fresh-agent distillation.
- **Second fresh-agent `/session-distill` on foundational session — lens-shifted
  via NEW_LAWS_OF_AI_AGENT_ENGINEERING.md** (2026-06-09). Re-ran the skill on
  the redacted foundational session with `cwar/docs/NEW_LAWS_OF_AI_AGENT_ENGINEERING.md`
  as the analytical lens. The NEW_LAWS lens surfaced 6 patterns the original
  research papers and the first distillation didn't name — most importantly:
  **the agent OFFERED the credential-in-chat path at L912.** The PAT in the
  transcript wasn't user error; it was a `[LAW confidence-competence-inversion]`
  failure where the agent operationalized training-data deploy-shortcut
  confidence over context-awareness that chat transcripts are durable. The
  L912/L922 incident co-occurred with `[LAW scope-ratchet]` — the `/feedback`
  scope expanded ~10× from "agents can file feedback" to "operate production
  cloud infra" in one continuous arc, and that expansion brought the agent
  into the GCP-deploy territory where it offered the shortcut. Response: new
  **`[LAW credentials-never-in-transcript]`** added to BOTH cairn root
  `LAWS.md` (10th cairn dev law) AND `files/LAWS.md` (7th seed law for
  adopters — broadly applicable, dog-food posture per `[LAW handoff-stays-current]`'s
  ethic). `/plan` extended with two new steps: Step 6 (credential-durability
  flag — keep-secret-out-of-chat MUST be the default proposal; in-chat-paste
  tagged explicitly) and Step 7 (scope-checkpoint trigger — re-invoke `/plan`
  when crossing tool boundaries like file-edits → network → deploy).
- **`packages/cairn-pi/` npm package authored** (2026-06-11) — ships the six-skill
  authoring loop (`spec`, `program`, `round-review`, `fast-execute`, `peer-review`,
  `note`) to Pi as a native pi package (`pi install npm:@winnorton/cairn-pi`),
  extending Pi from executor-only to a full authoring environment. Skill copies are
  byte-identical to `files/skills/` — sync + drift guard in
  `packages/cairn-pi/scripts/sync-skills.mjs`, wired to `prepublishOnly`, with
  VERSION lockstep and the 1024-char description cap enforced mechanically. Fixed
  `round-review`'s frontmatter description over the canonical cap at source
  (1051 → 1021 chars). Pull-forward of the Pi slice of the v0.15.x "plugin
  packaging" thread per `SPEC_AGENTS_UMBRELLA.md` open question 2. Local-path
  `pi install` validated 2026-06-11 (registers in `pi list`, removes cleanly);
  **npm publish (Phase 6) still pending — the package is not yet installable
  from npm.** Spec: `docs/specs/archive/SPEC_CAIRN_PI_PACKAGE.md`.

## What's durable

- **Repo:** every release, plan artifact, skill file, research doc.
- **Plans directory:** `plans/archive/` holds shipped plans (v0.3 through v0.12) per
  the v0.12.1 folder-as-state convention; `plans/` itself stays empty until a new
  plan is active.
- **Research directory:** `docs/research/` has 7 essays + `open-questions.md` —
  agentic-habitat, two-file-habitat, feedback-velocity, habitat-transfer,
  collaboration-skills, human-interaction-patterns, distillate-to-production.
  (`cross-session-observation` was consolidated into `habitat-transfer` in v0.10.7.)
- **Feedback endpoint:** deployed to Cloud Run, tested.
- **Memory (in this session's agent habitat):** `project/cairn`, `reference/cairn`, `reference/cairn_build_transcript`, `feedback/collaboration_style`, `feedback/reframing_as_human_function`.

## Open work

| Item | State |
|---|---|
| ~~GoDaddy CNAME for `cairn.winnorton.com`~~ | **DONE 2026-04-25.** Domain resolves and serves the cairn-feedback-endpoint service JSON at root. TLS cert active. POST /feedback works; GET /feedback returns 404 (correct — POST-only). |
| ~~cwar-engine cairn adoption~~ | **DONE 2026-04-26** per `[MEM project/re-adoption-flow-validated]`. v0.11.x → v0.12.2 a la carte adoption by Antigravity-Opus into cwar-engine via 3-stage review chain — 11 installed / 10 skipped, 16/16 checks pass. |
| cwar worktree commit (not pushed) | Stale 2026-04-24 entry on branch `claude/nice-curran-91ed55` (deletes `docs/LAWS_OF_ENGINEERING.md`, cleans up `AGENTS.md` references, adds three cairn-derived laws to `docs/NEW_LAWS_OF_AI_AGENT_ENGINEERING.md`). State unverified; user to confirm whether merged or abandoned. |

## Critical insight from the session

**Cairn's own development violated 4 of 7 NEW_LAWS_OF_AI_AGENT_ENGINEERING laws** because
I didn't read that file until late in the session — despite it living in `cwar/docs/`
(visible context). Specifically: Stateless Collaborator (built without full context), Amnesia
Tax (rediscovered concepts the user had already captured), Confidence-Competence Inversion
(confidently applied generic "laws" pattern without checking local prior art), and Scope
Ratchet (session expanded from "export bootstrap" to "multi-release framework" without
explicit scope-expansion gates).

Cairn's own `LAWS.md` (at repo root, added v0.9.1) now encodes this as
`[LAW load-meta-laws]`: **Load the project's meta-laws before making architectural decisions.**

## Session-to-session protocol (validated)

1. This session's transcript is accessible via a directory junction at
   `C:\Users\winno\Documents\Claude\Projects\cairn test\cairn_link\` — pointing at this
   session's JSONL transcript in `~/.claude/projects/`. Used as a research corpus
   for the human-interaction-patterns and collaboration-skills essays.
2. The handoff mechanism was validated post-v0.10.1 per
   `[MEM project/session_handoff_link_test]` and codified in the `/resume` skill,
   which is the canonical way to load this file's context in a fresh session.
3. HANDOFF.md is the durable fallback if transcript ingestion isn't available.
   `/resume` reads both.

## Things I (the builder agent) would do differently

1. Invoke `/reflect` at natural checkpoints from the start, not at the end. I demonstrated
   issue #14 throughout the session — all findings conversational, none written to durable
   memory unprompted.
2. Load cwar's meta-laws as context BEFORE designing cairn's LAWS. Four violations of
   NEW_LAWS I would have avoided.
3. Name scope expansion explicitly. The session grew scope roughly 10x from the initial
   "export bootstrap" ask. User consented, but the expansion was never surfaced as a
   boundary decision.

## For the next agent

- **Start with [AGENTS.md](AGENTS.md) at the repo root.** It's the canonical agent
  context for working on cairn itself — layout, 15 skills, key laws by slug, design
  DNA, current state. Then load this file (HANDOFF.md) for cross-session continuity,
  and `LAWS.md` for the full law set. Skip the v0.x plan artifacts unless you're
  digging into a specific release's design rationale — `docs/research/` is usually
  the better starting point for the "why" archive.
- **Check `gh issue list --repo winnorton/cairn --state open`** for the current
  untrimmed backlog.
- **If the next topic is v0.14.0**, read `docs/specs/SPEC_AGENTS_UMBRELLA.md` (the
  in-flight spec) and the promoted breadcrumb at
  `docs/notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md`. The spec extends a parked
  prototype at commit `345241a`.
- **If the next topic is cwar-engine adoption**, read `plans/archive/v0.9-law-slugs.md`
  for the citation-stability context, then the a la carte recommendation in this file.
- **Before any architectural change**, apply `[LAW load-meta-laws]` from cairn's own
  LAWS: load meta-laws for whatever project you're working in. For cairn-on-cairn that
  means AGENTS.md + the relevant `docs/research/` paper before touching structure.

---

_Originally written 2026-04-24 at session's end by the builder agent. Last updated
2026-06-09 for the interim work since v0.13.1 (notes filed, v0.14.0 spec drafted,
`/program` enhancements, repo-root AGENTS.md + CLAUDE.md added, skill-catalog drift
swept). Next refresh: at v0.14.0 tag time per [LAW handoff-stays-current]._
