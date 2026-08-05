# Handoff — cairn build session of 2026-04-24

**For the next agent picking up this work.** This file is the bridge across the session
boundary. Read it first. It exists because session boundaries are where signal goes to die
unless explicitly preserved.

> **Repo-root entry point (canonical, added 2026-06):** read [AGENTS.md](AGENTS.md) at
> the repo root. It's the cairn-itself agent context — layout, 20 skills, key laws by
> slug, design DNA, current state (v0.15.0 shipped). Claude Code auto-loads
> [CLAUDE.md](CLAUDE.md), which points at AGENTS.md. If you're a fresh agent landing
> in this repo, AGENTS.md is the orientation you want before anything else.

> **Entry point for prior-session inheritance:** read this file directly at session
> start, then probe memory at the project slugs declared under `## Related memory
> paths` below and recent git activity, and synthesize orientation from those.
> (The `/resume` skill that automated this probe was removed 2026-07-01 — unused by
> the maintainer, and its name collided with Claude Code's built-in `/resume`. The
> manual paths below are canonical.)

## Related memory paths

After the v0.10.2 slug-policy migration, cairn-native memory lives at **cairn's own
slug** and the cwar slug retains cross-cutting + cwar-native entries. Both are worth
probing when orienting in cairn's worktree:

- `~/.claude/projects/C--Users-winno-projects-cairn/memory/` — **cairn slug.**
  The local slug for sessions in cairn's worktree. Holds cairn-native memory:
  project state and feedback specific to cairn's own development, plus references
  to cairn artifacts. Probe for current contents — exact entry list shifts with
  each reflection cycle.

- `~/.claude/projects/C--Users-winno-projects-cwar-cwar-engine/memory/` — **cwar slug.**
  Reachable via this pointer. Holds cross-cutting feedback
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

- **Latest release:** v0.15.0 — **the interim slice, released**, shipped 2026-07-28
  (tag `v0.15.0`). Cuts a release over the 18 commits that had accumulated on `main`
  since v0.14.0 while `VERSION` stayed pinned at `0.14.0`: the skill-compression
  campaign, the `lra` skill pack, law-creation discipline, `swarm`, and the
  `prompt-evolve` cold-start/coverage-table/lifecycle-state change (`55026c9`).
  Cut because the pinned `VERSION` left every installed plugin stranded on the
  v0.14.0 skill set — the plugin manager had no version signal to update on, so an
  adopter's cache silently ran months-old skills. 19 skills; all six version files in
  lockstep. Detail on each change is in the section below, kept for provenance.
- **Prior release:** v0.14.0 — **cairn ownership migration**, shipped 2026-06-14 (merged `62a0b68`, tag `v0.14.0`, pushed to `origin/main`). State moved out of vendor namespaces into a cairn-owned `<project>/.cairn/`; skills ship as cairn-named packages the vendor's own installer places — **all 3 harnesses validated end-to-end**: the `cairn` Claude Code plugin (`claude plugin marketplace add winnorton/cairn` + `claude plugin install cairn@cairn`), `@winnorton/cairn-pi` (npm), and `packages/cairn-agy` native agy plugin (`agy plugin install github:winnorton/cairn//packages/cairn-agy@main`). `adopt.md` does ZERO agent writes to vendor dirs; the only vendor-file touch is one user-written `@./.cairn/CLAUDE.md` import line. Non-destructive v0.13.x→.cairn migration + install-integrity check + committed fixture; shared `scripts/sync-skills.mjs` guard + CI. `[LAW own-your-namespace]` codified (11th dev law). Authored via `/program → /spec → code` with maximal fan-out + fresh-agent review at every gate (program review ×2, spec review ×2, a comprehensive pre-merge review that caught a real fixture-reproducibility blocker). Program master: [`docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md`](docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) (archived post-ship per folder-as-status). Open follow-ups: a `.gitattributes` to stop a local-Windows CRLF false-flag on the sync-guard; optional `npm publish` of cairn-pi 0.14.0.
- **Previous release:** v0.13.1 (Renames the `/review` skill to `/peer-review` to disambiguate from Claude Code's built-in `/review` skill. The bare `/review` was being silently shadowed for any cairn adopter on Claude Code — the cairn skill never fired. Updates: skill subdirectory rename (`files/skills/review/` → `files/skills/peer-review/`), frontmatter `name:` field, manifest src/dest paths, install preview, citations across LAWS.md / HANDOFF.md / README. New migration section in `adopt.md`: re-adopters from v0.12.1+ get prompted by the agent during re-adoption to remove the legacy `~/.claude/skills/review/SKILL.md` file. Posture going forward per `[MEM project/cairn-blend-strategy-pillars]`: vendor namespace collisions are real; cairn claims distinct namespace per skill.)
- **Earlier:** v0.13.0 (Slug-only law identity — drops Law N numbering. Completes the v0.9.0 slug migration; numeric prefixes in law headings removed, slug becomes the only identity, collection size moves to section headers. Meta-rule 2 rewritten as "Slug is identity, count is metadata." Plus connects the reflect↔resume loop in user-facing docs — README's new "Cross-session continuity" section, tour Step 5 names both verbs, `files/skills/README.md` Skill pairings. Migration note in `adopt.md` for re-adopters with `[LAW N]` citations.)
- **Earlier:** v0.12.3 (Doc patch — fixed v0.12.x consistency gaps that fresh `/peer-review` caught). v0.12.2 (install-report version strings). v0.12.1 (skill format migration to canonical subdir form + `/peer-review` skill + folder-as-state for `plans/`). v0.12.0 (`/note` + `/spec` artifact-creation skills). v0.11.3 (ephemeral-sandbox pre-flight in adopt.md).
- **Live feedback endpoint:** https://cairn.winnorton.com/feedback (canonical) and https://cairn-feedback-591252228833.us-central1.run.app/feedback (Cloud Run direct fallback).
- **Empirical confirmation 2026-04-27:** v0.13.0 fresh-perspective `/peer-review` caught README body-text drift the author missed (the v0.9.0-era citation explainer in README's "Usage signal (citations)" section — anchored on `LAWS.md`, didn't grep README's own usage-signal section). Validates `[LAW pre-merge-review]` — exactly the gap class `/peer-review` is built to catch.

## Unreleased since v0.16.0

- **autoresearch-finalize: two-part harvest step** (2026-08-05) — new procedure step 6
  "Harvest the map": (a) archive `.auto/prompt.md` verbatim into the project's
  planning/doc tree on trunk (experiment branches are ephemeral and get wiped), with a
  metadata header (objective, run ledger, shipped commits, closed directions); (b)
  distill portable findings (closed directions with ceiling numbers, portable perf
  facts, measurement-protocol lessons) into durable agent memory, citing run numbers
  from `.auto/log.jsonl`. Origin: the first real autoresearch campaign (cwar-engine
  runAll optimization) showed the prompt's map — a proven ~18s ceiling on an entire
  direction — outlived both the merged code and the branches; cwar archived it as
  `docs/planning/autoresearch/AUTORESEARCH_RUNALL_WALL_CLOCK.md` and the pattern
  generalized. Description updated to name the step; body word-baseline re-recorded
  (autoresearch-finalize 307→~490). Synced to cairn-claude + cairn-agy; all gates green
  at lockstep 0.16.0.

## Released as v0.16.0 (2026-08-05)

Released 2026-08-05: VERSION bump + lockstep across all six version files, cold
`/peer-review` completed per `[LAW pre-merge-review]` (fix-first verdict, both blockers
+ all findings fixed in `bc2057d` before merge `5bf10d1`).

- **Skill removed: `fast-execute`** (2026-08, `027b7b8`) — removed from `files/skills/`,
  all three package copies, both sync-configs, and `files/skills/README.md`. That commit
  left `manifest.json`, `AGENTS.md`, `README.md`, **and `adopt.md`** still advertising or
  naming it (a `/peer-review` on the `skills/autoresearch` branch caught `adopt.md`'s
  Pi-migration section still listing `fast-execute` in its six-skill prose and both
  removal loops — the earlier sweep's own residue-inventory was itself incomplete). The
  full sweep, `adopt.md` included, is completed in the `skills/autoresearch` change set
  below. Count 19 → 18.
- **New skill pack: `autoresearch` + `autoresearch-finalize`** (branch
  `skills/autoresearch`) — count 18 → 20. An autonomous measure-keep-revert optimization
  loop plus a finalizer that splits its kept commits into file-disjoint, independently
  mergeable review branches. Adapted from
  [pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) (MIT, © davebcn87);
  attribution carried in both `SKILL.md` frontmatter descriptions, both bodies, the
  skill README, and both manifest entries. Three structural firsts, each deliberate and
  named per `[LAW scope-explicit]`:
  1. **First cairn skills that bundle runtime code.** `scripts/experiment.mjs`,
     `scripts/stop-hook.mjs`, `scripts/finalize.mjs` — zero npm dependencies, run only on
     invocation. The markdown-only Design DNA bullet in `AGENTS.md` now names this as an
     enumerated exception, with the gate for any future one: the skill's contract is
     mechanical (metric parsing, MAD statistics, git side effects), so prose telling an
     agent to hand-roll it yields a different loop every run.
  2. **`scripts/sync-skills.mjs` now syncs whole skill directories**, not just
     `SKILL.md` — byte-checks every asset and flags stale copies with no source. Behavior
     for the 18 markdown-only skills is unchanged (they are 1-file skills).
  3. **New skill category: execution** — "run a measured loop against the codebase", the
     only category whose skills mutate and measure the tree rather than produce text.
     Mirrored across `AGENTS.md`, `files/skills/README.md`, `README.md`, and `tour`.
  Enrolled in `cairn-claude` + `cairn-agy`, **not** `cairn-pi` — Pi has the upstream
  `pi-autoresearch` extension natively, so duplicating it there would ship a strictly
  weaker Bash-driven harness and break that package's zero-runtime-code contract
  (`packages/cairn-pi/README.md` says so and points at upstream). `manifest.json` skill
  entries gained an optional `bundles` array for supporting files; `adopt.md` Step-5
  skip-rule updated to cover it.
- **Cold `/peer-review` fix round on `skills/autoresearch`** — 2 BLOCKERs + several
  should-fixes, all confirmed and fixed:
  1. **BLOCKER (data-loss guard).** `files/skills/autoresearch/scripts/experiment.mjs`
     synced byte-identical from the source-of-truth harness at cwar-engine (the sibling
     project where the same skill also ships): `init` now hard-fails on uncommitted
     tracked changes and on untracked files unless `--allow-dirty`, records
     `cleanAtInit` in `state.json`, and the revert path skips `git clean -fd` when the
     tree started dirty. `.auto/config.json`'s `{"gitVerify": true}` now opts keep-commits
     back into hooks (default stays `--no-verify`). `SKILL.md`'s Phase 1 states the
     invariant, the `--allow-dirty` tradeoff, and the `.auto/`-commits-by-design behavior
     in cairn's machine register.
  2. **BLOCKER (broken path).** `files/skills/autoresearch-finalize/SKILL.md` defined
     `<autoresearch-base>` as the full path TO `experiment.mjs`, then used it as a
     directory (`<autoresearch-base>/scripts/experiment.mjs` resolved to
     `.../experiment.mjs/scripts/experiment.mjs`). Redefined as the sibling skill's base
     directory so the usage line resolves correctly.
  3. `adopt.md`'s Pi-migration six-skill prose + both removal loops still named
     `fast-execute` — replaced with `swarm` (see the corrected `027b7b8` bullet above).
  4. `packages/cairn-agy/README.md`'s "Markdown skills only — no runtime code, no build
     step" line, `manifest.json`'s `swarm` entry missing a `pi` delivery key (present in
     `packages/cairn-pi/sync-config.json` since `aeb4eb2` — pi skill count now matches at
     6), `packages/cairn-pi/package.json`'s description enumerating 5 skills instead of
     6, and `docs/CROSS_REPO_LRA_CAIRN.md`'s stale "markdown skills only" quote — all
     fixed to match the autoresearch-era reality (§ Design DNA's named runtime-code
     exception).
  5. Windows path robustness: both `SKILL.md` files now instruct quoting the announced
     `<skill-base>` substitution (Git Bash mangles an unquoted backslashed absolute
     path) and flag the Never-stop `settings.json` snippet's need for escaped
     backslashes on Windows. `autoresearch/SKILL.md` also covers harnesses that don't
     announce a base directory (fall back to the harness's documented install root).
  6. Register-rewrite softenings restored: `--asi` is now stated as required in
     practice (every run, keep or discard), and `.auto/checks.sh` + `.auto/config.json`
     are now explicitly marked optional (the prior text read `config.json` as an
     unconditional setup step) — both phrased within `check-prompt-register.mjs`'s
     constraints (no "because", "make sure", "optionally", …).
  7. **New mechanical gate: `scripts/check-delivery-parity.mjs`**, wired into
     `sync-guard.yml`. The manifest↔sync-config drift class repeated three times in one
     review pass (findings 3/4/… above) — `[LAW gate-beats-instruction]`: an instruction
     to keep them in sync doesn't hold under a fresh author, so a mechanical check now
     fails when a skill in any `packages/*/sync-config.json` lacks the matching delivery
     key in `manifest.json`, or vice versa. Verified red against the pre-fix `swarm`
     state, green after restoring it.
  8. `scripts/sync-skills.mjs` gained an optional `--prune` flag: sync mode plus deletion
     of stale per-skill files and orphaned `skills/<name>/` copies that `--check` would
     otherwise only report.
  `scripts/skill-body-word-baseline.json` re-baselined for the `autoresearch` (+239) and
  `autoresearch-finalize` (+19) body-word growth from the register additions.

## Work shipped in v0.15.0 (was the interim slice; peer-review DONE, no blockers)

These changes accumulated on `main` between v0.14.0 and v0.15.0 and shipped in the 2026-07-28 release; the paragraph below is preserved from when they were unreleased.

These changes are committed to `main` but not yet in a tagged release — **VERSION held at 0.14.0** (package lockstep green), working tree clean. Kept here per `[LAW handoff-stays-current]`. A fresh-agent `/peer-review` (`[LAW pre-merge-review]`) ran on the earlier slice and returned **no blockers**; 4 findings absorbed — 3 doc/preview-consistency fixes (adopt.md install-preview + install-loop now name `overwrite`-mode behavior; the cross-repo doc's stale "remaining wiring" section rewritten) + 1 pre-existing NIT (added the missing `cairn-agy` step to the sync-guard CI). Remaining gates before ship: a version bump (+ lockstep + README `## Status`) and publish.

- **`prompt-evolve` cold-start + coverage table + lifecycle state** (2026-07-28, `55026c9`) — closed the "cold-start mode deferred" gap `REVIEW_CAIRN_COMPREHENSIVE_2026-07-01` flagged: `/prompt-evolve <NAME>` now authors from a five-input brief (source, target, data model, tools, coverage unit) instead of routing to `/spec`, which had been forcing throwaway specs authored purely to unlock the skill. Grounded in a survey of all 15 evolving prompts across cwar-engine + lra: **14 of 15 had independently grown a per-unit status table** under five different names (SCOREBOARD, PARTITION ANCHORS, PARTITION SPACE, CALIBRATION TABLE, COVERAGE LADDER), so the kernel mandates the structure and leaves the name project-local — mandatory, since lra's bootstraps are byte-synced immutable here and use COVERAGE LADDER. Seeding is conditional per lra (seed when the space enumerates, empty where the axis emerges). Also adds `ACTIVE`/`HELD` lifecycle state + a read-only inheritance boundary for loops spawned from a narrowed predecessor (generalizing the one `SPC_PRINCIPAX_FRONTIER_ACADEMY` hand-rolled), and **narrowing aperture** as a named stop mode — the dominant real-world exit, where a loop is held at micro-focus and a fresh loop spawns elsewhere. Fixed the placement text that called `docs/prompt-evolve/` legacy and its contents "frozen" (false — it is the primary active habitat). Body 702→1116 words, baseline updated deliberately.
- **New skill: `swarm`** (2026-07-26, `aeb4eb2`) — a living coordination surface for multi-workstream work that repeats over partitions and never archives: fan-out parallel stubs per wave, review, self-improve the master, fan out the next wave. Count 18→19. Boundary vs `prompt-evolve` is now stated on both sides (it was one-sided until `55026c9`): one file iterating over units is prompt-evolve; many stubs per wave that never archive is swarm.
- **New skill: `lra`** — a `prompt-evolve` specialization (the lra researcher/librarian prompts ARE prompt-evolve instances; lra is its 3rd worked example after fishing-agent + purduebb, and the source of cwar's `[LAW prompt-economy]`). Runs the lra research→library→application pipeline engine-free as project-local markdown an agent walks, via lra commands (`subject create` / `collection create` / `research run` / `app serve`). Wired: `files/skills/lra/SKILL.md`; 3 verbatim prompt masters + `PROVENANCE.md` delivered to `.cairn/context/lra/` (reserved `context/` dir per `§2.1`) with a **new `mode: overwrite`** — a cairn-owned refresh mode (added to the manifest modes block + adopt.md re-adoption Case 3) so the masters track upstream on re-adopt instead of going stale under `create-if-absent`; Artifact-category entries in AGENTS.md (count 18→19) + `files/skills/README.md`; enrolled in cairn-claude + cairn-agy `sync-config` (**not** cairn-pi — outside its authoring-loop curation), synced, sync-guard green. The two prompts are **byte-verbatim from the lra lab** (`engine/templates/`, commit `7ea2050`) — the researcher is immutable there; this pack delivers/runs them, never edits them. Cross-repo link doc `docs/CROSS_REPO_LRA_CAIRN.md` in **both** repos; provenance + md5 + re-sync protocol in `PROVENANCE.md`.
- **`prompt-evolve` kernel rewrite** (2026-07-09) — compressed the skill from 2,772 to 676 instructional words and replaced its rigid, miscounted "7-phase" identity with invariant behavior: inventory-before-write, coverage selection, stop/re-run semantics, verified mutation, mandatory absolute-path self-edit, CHANGELOG, and blocked-work capture. LRA's emergent partitions, live cells, role-specific phases, and fan-out now fit without exceptions; stable mechanical rules explicitly graduate to validators or tools. [MEM reference/prompt-economy]
- **Gate: `scripts/check-skill-budgets.mjs`** (wired into `.github/workflows/sync-guard.yml`) — checks every source skill regardless of package enrollment. Descriptions hard-fail over Pi's 1024-char cap and warn ≥900; exact instructional-body word counts live in `scripts/skill-body-word-baseline.json`, so any count change requires an explicit `--update-body-baseline` diff and any increase needs review justification. Added after the 2026-07-09 skill compression validated the two-gate model: static size/register gates plus cold semantic review. Current near-cap descriptions: fast-execute and round-review. [MEM reference/prompt-economy]
- **Skill-compression campaign** (2026-07-08/09) — beyond the `prompt-evolve` kernel rewrite above, five more source skills were compressed/ratcheted against the budget baseline in the same pass: `spec` (`11f42d8` description, `04b673f` body), `program` (`04b673f`), `reflect`/`note`/`peer-review` (`15e169a`), and `plan` (`ebaa475`). `scripts/skill-body-word-baseline.json` was re-baselined to match; catalogs and skill counts are unchanged (still 18). No behavior change — pure prompt-size reduction. [MEM reference/prompt-economy]
- **Comprehensive cold review + fixes** (2026-07-01) — external-auditor review at
  `docs/reviews/REVIEW_CAIRN_COMPREHENSIVE_2026-07-01.md` (2 BLOCKERs, 11 MAJORs).
  All fixable findings fixed in this change set: the missing `files/.cairn/CLAUDE.md`
  manifest entry (installs were writing an import line to a file that never landed),
  feedback-endpoint rate-limit XFF spoof + sanitizer hardening + lockfile, the
  `agy plugin import claude` purge (5 surfaces), Pi delivery contract honesty
  (manifest promised 19 skills, package ships 6), version/count staleness sweep,
  shipped-spec archival (25 specs → `docs/specs/archive/` per folder-as-status),
  fast-execute desc/body reconciliation, tour rewrite for the `.cairn/` layout,
  `/feedback` pre-send consent gate, v0.13.x migration-trigger fix in adopt.md,
  and two new mechanical gates: a release-guard CI job (VERSION ⇒ HANDOFF coupling,
  per `[LAW handoff-stays-current]`) + `scripts/check-namespace.mjs`
  (per `[LAW own-your-namespace]`). CI path filters removed — every push runs every gate.
- **`/spec` + `/program` upgraded from lra field practice** (2026-07-01) — lra
  (`..\lra`, the heaviest real user) evolved conventions the skills now carry:
  master sections matched by TITLE not §-number (lra's masters shift the numbering),
  a second `/spec` lifecycle (contract specs — permanent source of truth, 3-pass
  evidence-bearing status, spec-updates-before-code, never archived) alongside
  execution specs, adversarial verification baked into the ship gate (lra evidence:
  7/7 workstreams had a ship-blocking bug only that pass caught), `§ OPEN QUESTIONS`
  as the canonical non-blocking parking spot, and `/round-review`'s three-way triage
  (ship-blocking / spec-drift / subtle). `/program`'s deferral discipline consolidated
  to one canonical definition ("scheduled deferral", Step 5) per `[LAW prompt-economy]`.
- **Skill removed: `resume`** (2026-07-01) — the maintainer doesn't use it, and its
  name collided with Claude Code's built-in `/resume` (comprehensive-review finding
  MAJOR-9; the collision class that forced the v0.13.1 `/review` → `/peer-review`
  rename). Skill count 19 → 18. Removed from `files/skills/`, manifest, both
  sync-configs, both package copies, and all catalogs; HANDOFF's entry-point guidance
  now points at reading this file directly. Re-adopters keep any local copy per
  re-adoption Case 2 ("no longer part of cairn — your local copy is preserved").
- **Resolved 2026-07-01:** `files/skills/machineprogram/` + `machinespec/` (committed at `1b4579c`, never enrolled in manifest/catalogs/packages) were a maintainer test, not a skill promotion — deletion confirmed by the maintainer and committed with rationale. No 3-instance evidence existed; the comprehensive review (docs/reviews/REVIEW_CAIRN_COMPREHENSIVE_2026-07-01.md, MAJOR-10) flagged the churn as the observation gate being bypassed.

## HIVE_CONTEXT_SESSIONS program — shipped 2026-06-13

The cross-harness session corpus + ingestion pipeline is now live. `cairn-sessions`
(at `~/projects/cairn/cairn-sessions`) holds normalized envelopes from all three
harnesses (Claude Code, Pi, Antigravity) with a findings ledger and three JSON Schemas.
`cairn-mcp-server` v0.5.0 adds `gather`, `manifest`, and `corpus_status` MCP tools plus
the `normalizeAuto` / adapter / redaction pipeline, and extends `session_distill` with
an `envelope_path` branch that writes compounding findings to the ledger. A pre-commit
hook in `cairn-sessions/.githooks/pre-commit` blocks staging any secret-shaped content.
CI: `npm run validate-corpus` + `node test/*.mjs` + `.github/workflows/ci.yml`.
Program master: `docs/specs/archive/SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md` (archived post-ship).

## Interim work since v0.13.1 (post-release, pre-v0.14.0)

Captured here to keep `[LAW handoff-stays-current]` honest between releases. None of
this was tagged at the time of writing — it has since shipped inside **v0.14.0** (now the latest tag, 2026-06-14). Kept as the historical pre-v0.14.0 record.

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
- **v0.14.0 promoted to program** — the old `SPEC_AGENTS_UMBRELLA.md` umbrella draft
  (premise: `agents/` directory, forced by a 2026-05 sandbox restriction) was
  superseded and retired to `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`. Replaced
  by program
  [`SPEC_CAIRN_OWNERSHIP_00_PROGRAM`](docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
  (12 workstreams). Governing law: `[LAW own-your-namespace]`. State moves to
  `<project>/.cairn/`; skills distribute as cairn-named packages. Read the program
  master before touching `manifest.json`, `adopt.md`, or path conventions.
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
- **`/prompt-evolve` skill added** (2026-06-09; initial form superseded by the
  2026-07-09 kernel rewrite above). The artifact category grew from 15 to 16
  skills after fishing-agent and purduebb independently surfaced a durable prompt
  that executors improve after each pass. Its `--from` promotion has always kept
  the source spec in place because the prompt is only one spec deliverable.
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
  note** (commit `95da3b7`, 2026-06-09; the transcript has since moved to
  `docs/study_sessions/cairn_origin_748aff00-...jsonl`). The 9MB / 2287-line /
  ~9h cairn build session (2026-04-24/25, the corpus the research papers
  were written from) is committed for future `/session-distill` runs. Redacted in-place via sed: 7 occurrences of a dead GitHub PAT replaced
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
   `[MEM project/session_handoff_link_test]` and was codified in the `/resume`
   skill until that skill's removal on 2026-07-01. Reading this file directly is
   now the canonical way to load its context in a fresh session.
3. HANDOFF.md is the durable fallback if transcript ingestion isn't available.

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
  context for working on cairn itself — layout, 20 skills, key laws by slug, design
  DNA, current state. Then load this file (HANDOFF.md) for cross-session continuity,
  and `LAWS.md` for the full law set. Skip the v0.x plan artifacts unless you're
  digging into a specific release's design rationale — `docs/research/` is usually
  the better starting point for the "why" archive.
- **Check `gh issue list --repo winnorton/cairn --state open`** for the current
  untrimmed backlog.
- **If the next topic is v0.14.0**, read the program master at
  `docs/specs/archive/SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md` (12 workstreams, 0 deferrals)
  and the program §9.4 status table for current execution state. The old umbrella
  draft is retired at `docs/specs/_promoted/SPEC_AGENTS_UMBRELLA.md`.
- **If the next topic is cwar-engine adoption**, read `plans/archive/v0.9-law-slugs.md`
  for the citation-stability context, then the a la carte recommendation in this file.
- **Before any architectural change**, apply `[LAW load-meta-laws]` from cairn's own
  LAWS: load meta-laws for whatever project you're working in. For cairn-on-cairn that
  means AGENTS.md + the relevant `docs/research/` paper before touching structure.

---

_Originally written 2026-04-24 at session's end by the builder agent. Last updated
2026-07-28 (**v0.15.0 release**): cut a tag over the 18-commit interim slice that had
been sitting on `main` unreleased since v0.14.0, because the pinned `VERSION` left
installed plugins stranded on the v0.14.0 skill set with no signal to update on.
Logged the `swarm` skill and the `prompt-evolve` cold-start/coverage-table/lifecycle
change, and reframed the interim section as shipped. Prior refresh 2026-07-11
(documentation sweep): logged the 2026-07-08/09 skill-compression campaign and
corrected the interim-work framing. Prior refresh 2026-06-13 for the
SPEC_CAIRN_OWNERSHIP program (WS10 docs update): `.cairn/` state model, corrected
env-roles, removed false `.agents/` alignment text, redirected v0.14.0 pointer to
program master. Next refresh: at the next version tag per [LAW handoff-stays-current]._
