# Changelog

One short entry per release, newest first. [`scripts/release.mjs`](scripts/release.mjs)
writes each entry from the commit subjects since the previous tag. The current version
is in [`VERSION`](VERSION).

<!-- release-entries -->

## Earlier releases

Prose entries moved here from `README.md` on 2026-11-19, unchanged.

v0.16.1 — **Authoring-loop hardening.** `spec`, `program`, `round-review`, and
`peer-review` close a set of state-machine gaps found by cold audit: a program completes
only when a round review writes zero stubs, leaves nothing unverified, and every program
row is complete; scheduled deferrals, Gate B approval, round numbering, and status-table
edits each have a named actor; `round-review` is half its former size. Also `lra` →
`lra-lite` (the engine-free fallback), `swarm` held or retired only on user approval, and
the `autoresearch-finalize` harvest step. 20 skills.

v0.16.0 — **The execution category.** `autoresearch` and `autoresearch-finalize`: an
autonomous measure-keep-revert optimization loop and its finalizer, the first cairn
skills that bundle runtime scripts. `fast-execute` removed. 20 skills.

v0.15.0 — **The interim slice, released.** Cuts a tag over the work that accumulated on
`main` since v0.14.0 while `VERSION` stayed pinned, which had left installed plugins with
no signal to update on: the skill-compression campaign, the `lra` skill pack, law-creation
discipline (`check-laws-shape.mjs` plus the gate-not-law and memory-first meta-rules), the
skill-size gate suite (`check-skill-budgets.mjs`, `check-prompt-register.mjs`), the new
`swarm` skill, and `prompt-evolve`'s cold-start mode, project-named coverage table, and
`ACTIVE`/`HELD` lifecycle state. 19 skills.

v0.14.0 — **Cairn ownership migration.** State moves out of vendor namespaces into a
cairn-owned `<project>/.cairn/` directory; skills distribute as cairn-named packages
the vendor's own installer places: the `cairn` Claude Code plugin
(`claude plugin marketplace add winnorton/cairn` + `claude plugin install cairn@cairn`),
`@winnorton/cairn-pi` (npm), and the native `packages/cairn-agy` agy plugin
(`agy plugin install https://github.com/winnorton/cairn/tree/main/packages/cairn-agy`). `adopt.md`
does zero agent writes to vendor dirs — the only vendor-file touch is one
user-written `@./.cairn/CLAUDE.md` import line. Adds the non-destructive
v0.13.x → `.cairn/` migration flow, install-integrity checks, the shared
`scripts/sync-skills.mjs` drift guard + CI, and codifies `[LAW own-your-namespace]`.
Program master: `docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`.

v0.13.1 — Renames `/review` to `/peer-review` to disambiguate from Claude Code's
built-in `/review` skill. The bare `/review` invocation in any Claude Code session
resolves to the built-in — the cairn skill was being silently shadowed for any cairn
adopter on Claude Code. Updates: skill subdirectory rename
(`files/skills/review/` → `files/skills/peer-review/`), frontmatter `name:` field,
manifest src/dest paths, install preview, citations across LAWS.md / HANDOFF.md /
README. New migration section in `adopt.md`: re-adopters from any version that
installed the legacy `~/.claude/skills/review/SKILL.md` get prompted by the agent
during re-adoption to clean up the legacy file. Posture going forward (per
`[MEM project/cairn-blend-strategy-pillars]`): vendor namespace collisions are real;
cairn claims distinct namespace per skill from here on.

v0.13.0 — Slug-only law identity (drops Law N numbering). Completes the v0.9.0 slug
migration — v0.9.0 added slugs as the citation form but never removed the competing
numeric form, leaving two valid-looking identities and a meta-rule trying to suppress
one of them. Numbers also implied blast-radius ordering the laws didn't honor in
practice. Fix: numeric prefixes removed from law headings in both `LAWS.md` and
`files/LAWS.md`; slug becomes the only identity; collection size moves to section
headers (`## Seed laws (6)`). Meta-rule 2 rewritten as "Slug is identity, count is
metadata." Plus connects the reflect↔resume loop in user-facing docs — README's new
"Cross-session continuity" subsection, tour Step 5 names both verbs, and a "Skill
pairings" section in `files/skills/README.md`. Fresh `/review` caught README body-text
drift the author missed (anchored on `LAWS.md`, didn't grep README's own usage-signal
section) — exact gap class `[LAW pre-merge-review]` is built for. Re-adopters with
legacy `[LAW N]` citations: see the migration note in `adopt.md`. The `/audit` skill
flags numeric citations as "legacy needing manual conversion" rather than auto-resolving
(the number-to-slug mapping no longer exists in source-of-truth).

v0.12.3 — Doc patch: fix v0.12.x consistency gaps that a fresh `/review` session
caught after v0.12.2 shipped. (1) `adopt.md` tier counts and install preview were
missing `/spec` — agents installed 21 files but consent + report claimed 20.
(2) `README.md` "What you get" claimed three skill categories; cairn has four
(artifact added in v0.12.0). `/note` was miscategorized as maintenance.
(3) `/review` skill body itself still cited `cwar/.agents/workflows/execute-plan.md`
as the worked example — exactly the cwar-coupling regression v0.12.1 stripped from
`/note` and `/spec` but missed in `/review`. (4) cairn-slug `MEMORY.md` was missing
the index entry for `feedback/habitat-bootstrap-three-surfaces` (file existed; index
didn't list it). (5) `plans/v0.12-cairn-from-cwar-arc.md` still in `plans/` despite
all three v0.12.x releases shipping — moved to `plans/archive/`. The fact that
`/review` caught these in its own surrounding artifacts is the cleanest possible
self-validation of the skill.

v0.12.2 — Doc patch: fix install-report version strings. v0.12.1 shipped with `adopt.md`
hardcoded "v0.12.0" in the install preview, post-install report, and pinned-version
example URL — agents installing v0.12.1 reported "v0.12.0 installed" to users. Fixed
in v0.12.2 along with similar stale references in HANDOFF.md and `files/skills/README.md`.
Doc-only.

v0.12.1 — Skill format migration to canonical `~/.claude/skills/<name>/SKILL.md`
subdirs (Claude Code's official format). Flat `.md` skills don't reliably register
as slash commands; the new format fixes the bug. Adds `/review` (external-agent
review skill, catches inconsistency-class bugs the work-author missed because
they were "too close") — pairs with the v0.12.0 artifact skills. New fourth skill
category: **cross-perspective** (`resume`, `review`) — distinct from maintenance,
collaboration, and artifact. Plus folder-as-state for cairn's own `plans/` (shipped
plans now live in `plans/archive/`). Plus a `/note`-vs-cross-session-memory
disambiguation callout in `files/CLAUDE.md`. Plus `/note` and `/spec` cleaned up
to remove cwar-specific worked-example coupling and use generic `docs/notes/` /
`docs/specs/` paths. Re-adopters: see the migration note in adopt.md for cleanup
of old flat-format skill files.

v0.12.0 — Two new artifact-creation skills imported from a downstream project's
`/plan`-rework arc: `/note` (pre-emptive intent capture — single paragraph,
in-repo, ephemeral) and `/spec` (structured agent execution spec with phases,
steps, checkpoints, executor handoff). New "Artifact skills" category added to
the skill taxonomy alongside maintenance and collaboration. Distinct from cairn's
existing `/plan` (behavioral pre-action alignment, conversational, no file output).
v0.12.1 follows up with the format migration + /review + folder-as-state cleanup.

v0.11.3 — adopt.md gains a second pre-flight check: refuse install in ephemeral
sandboxes (claude.ai web/mobile chat, hosted notebooks, sandboxed evals) where
filesystem writes don't reach the user's machine. Filed after a Claude.ai chat
session walked Step 1, hit "Neither clear? → Ask the user", and surfaced the
spec gap unprompted — the right behavior, but only because the agent was careful;
a less-careful agent could have faked the install into `/home/claude`. The new
pre-flight closes that path explicitly. Doc-only.

v0.11.2 — Doc patch: category disambiguation. Added "What cairn is (and isn't)"
section between the description and Adopt — explicit IS/IS NOT framing because
agents (and search-grounded answers) keep mistaking cairn for a runtime, an
orchestrator, a CLI, or `cairn-dev/cairn`. Surfaced after a Gemini test
returned a peer-comparison list of agent runtimes (LangGraph, AG2, MetaGPT,
Devin) — every project on the list was a wrong-category peer because cairn is
a convention layer, not a runtime. Doc-only.

v0.11.1 — Doc patch: agent-side disambiguation + trigger-phrase callout.
Added a "For agents" block to README's Adopt section and to adopt.md's
top: lists the natural trigger phrases (`adopt cairn`, `carefully adopt
cairn`, `set up cairn`, `install cairn`), and explicitly warns against
substituting training-data references for fresh repo content. Surfaced
after a Gemini test answered from training data — describing an unrelated
`cairn-dev/cairn` background-agent system — without fetching the URL the
user gave it. Doc-only.

v0.11.0 — Project subdirs for cross-project user-global memory stores (#22).
Antigravity's `~/.gemini/antigravity/memory/` shares one tree across every
workspace, so entries from cwar-engine, cairn, and side-projects accumulated
flat under `project/`. New rule: cross-project user-global stores get a
`project/<projectname>/` layer; citation becomes
`[MEM project/<projectname>/<name>]`. Slug-separated stores (Claude Code's
per-slug `~/.claude/projects/<slug>/memory/`) stay flat — the slug already
separates. `/reflect`'s distillate-naming convention updated; the rule is
documented in `files/memory/project/README.md`. Migrated 5 existing
Antigravity entries into `project/cwar-engine/`.

v0.10.9 — Antigravity added to the canonical "Works in X" list (README, adopt.md,
manifest.json description). Validated empirically on 2026-04-25: a Gemini Pro 3.1
session adopted cairn cleanly into the Antigravity workspace, and a follow-up
Opus session ran `/bridge` + `/plan` end-to-end against cairn skills and produced
a shipped feature commit on cwar's main. Anecdotally Antigravity may be the
strongest of the three harnesses for cairn workflows — the agent-relay browser
panel pattern composes well with cairn's HANDOFF.md + memory_query story.
Doc-only release.

v0.10.8 — First end-to-end **distillate-to-production** arc documented. A
research finding from one workspace (game engine research, Cowork) became a
feature-flagged commit on a production codebase's main branch (cwar-engine,
Worker-based simulation Phase 1) — six steps, four sessions, three platforms
(Cowork → Antigravity → Claude Code), two repos. New research paper
[`docs/research/distillate-to-production.md`](./docs/research/distillate-to-production.md)
walks the arc step-by-step with evidence (commit hashes), shows what cairn
primitive each step depends on, and names what's still manual (cp transport,
partly addressed by v0.10.6). Doc-only release.

v0.10.7 — Research docs refreshed with Phase 2 evidence. Cairn-test session
analyzed a second transcript (v0.7.0 → v0.10.5, ~50 messages, cross-platform
testing in Antigravity + Cowork + Claude Code) and updated four research
papers + added `open-questions.md`. New findings: bidirectional verification
(an agent corrected the human with tool-log evidence), experimental design
as a distinct human pattern, ecosystem-coordination as a third candidate
skill category. Removed redundant `cross-session-observation.md`
(consolidated into `habitat-transfer.md`). Doc-only release.

v0.10.6 — Two bridge-test learnings codified. (1) `/reflect` Step 7 added: when consumer
path is locally writable, offer to copy distillate directly — eliminates the manual `cp`
step that's been cross-workspace friction. Cross-machine fallback documented (git transport,
or leave staged). (2) `/bridge` Step 3.5 added: verify load-bearing claims against current
state before integrating. Codifies the Opus agent's exemplary verify-then-integrate
behavior during the 2026-04-25 cross-workspace bridge test.

v0.10.5 — `/bridge` skill: ask direction before guessing. When the user invokes
`/bridge` without a clear direction signal, the skill now requires asking incoming-
or-outgoing first. Validated 2026-04-25: a Gemini Pro 3.1 session produced a
well-formed but wrong-direction outgoing bridge when the user wanted incoming.
Confirmation gate prevents this misfire pattern.

v0.10.4 — Doc fix: don't `git clone` cairn during adopt. `adopt.md` Step 5 gains
an explicit pre-flight forbidding `git clone` of the cairn repo into the workspace.
Adopt fetches manifest-declared files via HTTP — it does NOT pull the framework's
entire source. Validated 2026-04-24 by Gemini Pro 3.1 in Antigravity: the agent's
first instinct on `adopt URL` (no flag) was to `git clone https://github.com/winnorton/cairn .`
— tool-log entry timestamped at 2026-04-25T01:35:24Z. Defensive doc grounded in real
non-Claude-agent behavior, not speculation.

v0.10.3 — Doc fix: don't adopt cairn into cairn. README adopt section gains a warning
+ workaround (copy individual files from `files/skills/` to `.claude/skills/` for
cairn-internal development). `adopt.md` Step 1 has a pre-flight check that detects
cairn's own repo (via `manifest.json` name field or `LAWS.md` title) and stops before
install. Surfaced when the maintainer realized the recursive "adopt cairn into cairn"
case is plausible — and dangerous (would create duplicate `LAWS.md`, `CLAUDE.md`, etc).

v0.10.2 — Slug policy formalized after the second `/resume` validation surfaced the
question: where SHOULD memory live in multi-project workflows? Files that are scope-
local stay at one slug; cross-cutting agent-meta-knowledge picks one slug + declares
a pointer in HANDOFF.md. New `[LAW choose-slug-by-scope]` in cairn's own LAWS.md
codifies this. `files/memory/MEMORY.md` template gains a "Where memory should live"
section. Cairn-native memory entries migrated from cwar's slug to cairn's slug.

v0.10.1 — `/resume` validation surfaced two gaps; both fixed. (1) HANDOFF.md drifted
within one release cycle ("v0.9.1" inside HANDOFF.md while main was on v0.10.0) — new
seed law `handoff-stays-current` in cairn's own `LAWS.md` requires HANDOFF.md to update
in the same commit as VERSION/manifest/README. (2) `/resume` couldn't find memory
written under a different project's slug — extended the skill to read a `## Related
memory paths` section from HANDOFF.md and probe those paths too. cairn's HANDOFF.md
now declares cwar's memory slug explicitly, so a fresh `/resume` in cairn finds the
session's memory entries.

v0.10.0 — `/resume` skill for session-to-session handoff. The first link test (a fresh
session opening in a different worktree, asking "where were we?") FAILED to auto-discover
prior context because: (1) memory is namespaced per-worktree; (2) `HANDOFF.md` requires
explicit knowledge of where to look; (3) transcript junctions are ad-hoc. `/resume`
codifies the probe — checks HANDOFF.md at common paths, memory at multiple project slugs
(worktree-aware), transcript junctions, and recent git activity, then synthesizes a
compact orientation. Agents now have a named protocol for "pick up where we left off."
See `plans/v0.10-session-handoff.md`.

v0.9.1 — Session-close release: cairn's own LAWS.md (at repo root — framework eats its
own dog food), LAWS.md template credit note pointing at `NEW_LAWS_OF_AI_AGENT_ENGINEERING`
as the meta-disciplinary source, `HANDOFF.md` for session-to-session bridging, and #15
closed (userSkills dual-scope path detection parallel to #6's memory fix).

v0.9.0 — Slug-based law identity (#18). Laws now cite by stable slug (`[LAW plan]`,
`[LAW cadence]`) instead of drift-prone numbers. Numbers initially remained as
display-order markers (removed entirely in v0.13.0); `/audit` matched both forms
during the transition. Evidence: cwar's AGENTS.md renumbered
26→22→13 rules in one day, leaving citation debt in ESLint comments and cross-file
references — cairn preempts the same pattern. See `plans/v0.9-law-slugs.md`.

v0.8.0 — Reflection cadence + upstream/downstream distillation (closes #14 + #17).
`/reflect` now triggers proactively at natural checkpoints (not only on explicit user
request) and produces distillate for declared downstream consumer habitats. New
optional `## Downstream consumers` section in `CLAUDE.md` template. Sixth seed law
added: "Pause to reflect at natural checkpoints." Addresses the root cause observed
when a research agent produced 1,600+ lines of work and zero memory entries —
reflection wasn't firing. See `plans/v0.8-upstream-downstream.md`.

v0.7.0 — Collaboration skills + taxonomy (#16). Systematic analysis of the cairn build
transcript surfaced three more skills that serve the human-agent pair: `/bridge`
(cross-session relay), `/advocate` (end-user perspective), and a `/plan` enhancement
for timing awareness. Introduces the maintenance-vs-collaboration taxonomy explicitly
in README and skills/README. Adds `collaboration-skills.md` and `human-interaction-patterns.md`
to `docs/research/`. See `plans/v0.7-collaboration-skills.md`.

v0.6.4 — Cite in durable output, not just in conversation (#13). First cross-session
habitat transfer observation revealed that `[LAW prefer-edit]` (formerly `[LAW 4]`) fired in live transcript but
left no trace on disk — `/audit` was blind despite the habitat actively shaping
behavior. LAWS.md meta-rule 5, memory type READMEs, and audit.md now specify
citations must appear in files/notes/commits to feed the audit loop. Adds
`habitat-transfer.md` and `cross-session-observation.md` to `docs/research/`.

v0.6.3 — Install must fetch files via HTTP, not heredoc inline (#12). adopt.md
Step 5 now explicitly rules out `cat > file << EOF ... EOF` patterns and mandates
`curl -sL {rawBase}/{src} > {dest}` (or equivalent). Adoption time drops from
minutes to seconds when agents follow the correct path.

v0.6.2 — adopt.md no longer invites agents to render a tier picker (#11). First-time
install is default-full with a single y/n confirmation; tier flags documented as
invocation-only forms.

v0.6.1 — Feedback endpoint live + multi-URL fallback. Deployed to Cloud Run;
manifest now lists both the Cloud Run direct URL and `cairn.winnorton.com` (custom
domain, pending CNAME propagation) so agents always have a working primary. Skill
tries URLs in array order, falls through on DNS/network/5xx.

v0.6.0 — Hosted feedback endpoint (cairn-side wiring). Handler code + Cloud Run
deployment guide in `server/feedback-endpoint/`. See `plans/v0.6-feedback-endpoint.md`.

v0.5.1 — `/reframe` skill + "Who cairn serves" framing (#9). Cairn now directly
supports the user's reframing job (not just context provision). Skill generates 2–4
alternative framings on request — helps humans rotate the solution space when
convergent thinking is stuck.

v0.5.0 — Graduated tiers (#8). Every installed file tagged with a `tier` alongside
`role`. Four tiers: `seed` (two-file minimum viable = maximally portable habitat),
`grow` (adds laws + process skills), `structure` (adds typed memory + hygiene),
`full` (adds cairn-ecosystem integration). Default install unchanged (full); users who
want portable minimal now have `--tier seed`. See `plans/v0.5-graduated-tiers.md`.

v0.4.3 — Roles: every installed file tagged `essential | scaffolding | optional` (#7).
Install preview groups by role; README's Design notes explains what matters vs what
helps.

v0.4.2 — Memory path dual-scope detection (#6). `adopt.md` Step 1 and `manifest.json`
now document that Claude Code has two memory conventions (user-global vs project-scoped)
and require probing before installing. Silent-failure gap closed.

v0.4.1 — Agent-driven migration as a first-class path (#5). `adopt.md` now documents the
migration flow (detect → plan → execute → verify) including index-tombstoning for
environments without deletion support. Cowork Step 3 also distinguishes bash mount from
memory store with per-layer tool guidance.

v0.4.0 — Typed memory (#4). Memory splits into `user/`, `feedback/`, `project/`, and
`reference/` subdirectories with per-type citation conventions. `/audit` and `/prune`
are per-type aware. See `plans/v0.4-typed-memory.md`.

v0.3.3 — Version marker + re-adoption fast-path (#3).
v0.3.2 — Explicit doc-only re-adoption case (#2).
v0.3.1 — Cowork `.claude/` write protection + shell fallback (#1).
v0.3.0 — citation convention, `audit`, `feedback`.
