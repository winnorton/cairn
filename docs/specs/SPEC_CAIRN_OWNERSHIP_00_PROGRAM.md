# SPEC_CAIRN_OWNERSHIP — program master

> **Filed:** 2026-06-13 · **By:** Claude Opus 4.8 (1M) · **Requested by:** maintainer
> **Production-status:** has-users (public repo, v0.13.1, real adopters) → migration in scope, but user-driven (documented steps), not automated tooling.
> **Supersedes:** [SPEC_AGENTS_UMBRELLA](_promoted/SPEC_AGENTS_UMBRELLA.md) (the parked v0.14 `agents/` draft — outdated premise + drifted anchors per the 2026-06-13 revalidation).
> **Governing law:** `[LAW own-your-namespace]` (cairn root `LAWS.md`, added this session). **Memory:** `[MEM feedback/own-namespace-no-vendor-folder-deps]`.
>
> **Revision history:** Drafted 2026-06-13 as a program (not a single spec) — see §11.

## §0 LEAD FINDING

**Cairn's install model hand-writes markdown into whatever vendor directory each harness owns, and names artifacts generically — both of which have already cost real breakage.** This program replaces that with a self-owned model.

| Evidence | Date | Failure class |
|---|---|---|
| `/review` silently shadowed by Claude Code's built-in until the `/peer-review` rename | v0.13.1 | namespace collision (shipped) |
| Old `agents/` umbrella draft would collide with `.agents/skills/` — hard-coded `{workspace}/.agents/skills` in the agy binary, claimed by Pi **and** agy loaders | 2026-06-13 | namespace collision (caught) |
| `404: Not Found` bodies written as `program/SKILL.md` + `round-review/SKILL.md` in `~/.pi/agent/skills/` — adopt curl-wrote into a vendor folder with no validation | 2026-06-11 | vendor-folder dependency (live breakage) |
| Stale pre-v0.12.1 flat-format skills + legacy `review/` rotting in agy's `~/.gemini/config/skills/` | 2026-06-13 | vendor-folder dependency (residue) |
| [SPEC_AGENTS_UMBRELLA](_promoted/SPEC_AGENTS_UMBRELLA.md) premise ("sandbox denies CLAUDE.md writes") now "I do not know if still live" | 2026-06-13 | design rested on transient vendor behavior |

**What this program replaces:** the curl-into-vendor-dirs install + generic folder/skill names — with: **state in `<project>/.cairn/`** (cairn-owned), **skills via cairn-named packages the vendor's own installer places**, and **one user-written import line** as the only vendor-file touch.

## §1 PROGRAM GOAL

**Deliverables (numbered, concrete):**

1. A cairn-owned project-local state directory `<project>/.cairn/` holding memory, laws, context, and the version marker — nothing cairn writes lands in a vendor-owned dir.
2. Skills distributed as cairn-named packages: a `cairn` Claude Code plugin (authoring/review/maintenance skills), the existing `@winnorton/cairn-pi` npm package (Pi), and agy served by `agy plugin import claude` of the same Claude plugin. No skill is hand-curled into `~/.../skills/`.
3. A single user-written import line per harness (`@./.cairn/CLAUDE.md` in Claude Code's `CLAUDE.md`; the AGENTS.md equivalent for Pi/agy) — the only edit cairn asks a user to make to a vendor-owned file.
4. A reshaped `adopt.md` whose install path performs **zero agent writes to vendor-owned config/skill dirs**.
5. A documented, user-driven migration from any v0.13.x install (vendor-dir memory/laws + stale skill residue) to the `.cairn/` model.
6. A mechanical sync/drift guard so the one source of truth (`files/skills/`) stays byte-synced across every distribution package, and a namespace-collision audit enforcing `[LAW own-your-namespace]`.

**Headline success metric (user-experience anchored):** a fresh `adopt` and a v0.13.x re-adopt each complete with **zero agent writes to any vendor-owned path**, and the adopter's habitat is fully functional after adding **one** import line.

**Non-goals:** runtime telemetry (cairn ships markdown); rewriting skill *bodies'* logic (only their state *paths* change); a hosted cairn registry; changing the feedback endpoint; solving cross-project shared memory (a separate future thread).

## §2 CONTRACT SURFACES

Load-bearing cross-child contracts. Every workstream cites these; they freeze at Wave 0 exit.

**2.1 `.cairn/` directory layout (frozen by WS01).**
```
<project>/.cairn/
├── CLAUDE.md            # cairn-shaped context sections (imported by the user's CLAUDE.md/AGENTS.md)
├── LAWS.md              # laws template + the project's laws
├── memory/
│   ├── MEMORY.md        # index
│   └── {user,feedback,project,reference}/   # typed memory
├── context/             # (reserved) longer-form context the agent reads
└── cairn-version        # single-line version marker
```
All cairn state is git-tracked inside the adopter's repo. No `~/.claude`, `~/.gemini`, `~/.pi`, or `.agents/` path is ever a cairn write target.

**2.2 Import-line contract (frozen by WS02).** The bridge is exactly one user-written line:
- Claude Code: `@./.cairn/CLAUDE.md` appended to `<project>/CLAUDE.md`.
- Pi/agy: the AGENTS.md analog (Pi auto-loads `AGENTS.md`; the line points at `./.cairn/CLAUDE.md`).
The agent SHOWS the line; the user adds it. Cairn never writes it.

**2.3 Package naming (frozen by WS03).** Distribution artifacts are cairn-namespaced: `@winnorton/cairn-pi` (npm, shipped), `cairn` (Claude Code plugin), `cairn-agy` reserved if a native agy plugin is ever needed (import-claude is the default agy path). Skill names stay collision-checked per `[LAW own-your-namespace]`.

**2.4 Single source of truth (frozen by WS11).** `files/skills/<name>/SKILL.md` is canonical. Every package's skill copy is a byte-identical committed artifact regenerated by a sync script; `--check` (wired to `prepublishOnly`/CI) fails on drift, over-cap descriptions, and version-lockstep breaks. (Generalizes `packages/cairn-pi/scripts/sync-skills.mjs`.)

**2.5 Path-variable semantics (frozen by WS06).** `manifest.json` describes `.cairn/` state dests via `{projectRoot}/.cairn/...` and references packages for skills; the `userMemory` vendor-path variable is retired. `{projectRoot}` resolves per-harness to the adopter's repo root.

## §3 RESOLVED DESIGN DECISIONS (no deferrals)

| Decision | Resolution | Rationale |
|---|---|---|
| State folder name | `<project>/.cairn/` (dotted, cairn-named) | Owned + collision-free; dot keeps it out of `ls` clutter while staying project-local & git-tracked. NOT `agents/` (generic) or `.agents/` (vendor-contested). |
| Why move (the premise) | `[LAW own-your-namespace]` — own your folders | Durable; independent of the now-uncertain 2026-05 sandbox-denial. The law justifies the move regardless of vendor behavior. |
| Skill distribution | cairn-named PACKAGES installed by the vendor's own tooling | Removes hand-writes into vendor skill dirs; the package is the cairn-owned artifact. |
| One Claude plugin or three native packages? | One `cairn` Claude Code plugin, consumed by agy via `import claude` | agy `import claude` + GitHub-subpath install both confirmed 2026-06-13. Build once, serve Claude + agy. Pi keeps its npm package (different ecosystem). |
| Skill bodies localized per harness? | No — byte-identical across packages | One source of truth (§2.4). `/x` vs `/skill:x` is README documentation, not a body fork (precedent: cairn-pi). |
| Migration automation | User-driven documented steps; no shipped migration binary | has-users but small/maintainer-controlled; ownership boundary says the user moves their own files (precedent: old spec Phase 6). |
| Visibility of `.cairn/` | Hidden (dotted) accepted | Maintainer chose `.cairn/` explicitly 2026-06-13; collision/ownership beat visibility in current priorities. |
| Old spec disposition | Retire to `docs/specs/_promoted/` with breadcrumb | It's superseded, not deleted; its migration thinking + revalidation are inputs. |

*Executors do NOT need to revisit any of these.* **Deferrals: 0.**

## §4 HARD CONTRACT — Ownership (project-tailored)

The load-bearing invariant every workstream must hold, derived from `[LAW own-your-namespace]`:

1. **No cairn process writes to a vendor-owned path.** Forbidden write targets: `~/.claude/**`, `~/.gemini/**`, `~/.pi/**`, `<project>/.claude/**`, `<project>/.agents/**`, and `<project>/CLAUDE.md` / `AGENTS.md`. Cairn writes ONLY under `<project>/.cairn/**` and (for development) the repo's own tree.
2. **Skills reach vendor skill dirs only through a vendor-run package installer** — never an agent `curl`/`Write`.
3. **The sole vendor-file edit cairn requests is one user-written import line**, shown by the agent, applied by the user.
4. **Every cairn artifact name is collision-checked** against the target harness's built-ins before ship (WS12).

Any workstream step that violates 1–4 has the wrong shape — stop and re-derive. This contract is what a fresh reviewer checks first.

## §5 DEFINITION OF DONE (program-level, verifiable)

1. `rg -n "~/.claude|~/.gemini|~/.pi/agent|projectClaude}/LAWS|userMemory" adopt.md manifest.json files/` returns **zero** cairn-write targets (references inside migration *instructions* the user runs are allowed and tagged).
2. `<project>/.cairn/` layout (§2.1) is produced by a fresh `adopt`, verified by a fixture install.
3. The `cairn` Claude Code plugin installs in Claude Code; `agy plugin import claude` ingests it; `@winnorton/cairn-pi` still installs in Pi — all three validated (local install at minimum).
4. `adopt.md` performs zero writes to vendor paths; the import line is a Step the user executes (grep: the import line appears as user-action text, never in an agent write loop).
5. Migration section covers v0.13.x → `.cairn/` and the stale-residue cleanup (Pi 404s, agy flat-format), user-driven.
6. The sync drift-guard (`--check`) is green across all packages and wired to CI/`prepublishOnly`; deliberately corrupting one copy makes it red.
7. The namespace-collision audit (WS12) reports zero unresolved collisions; `[LAW own-your-namespace]` is cited in the closing commit.
8. Docs (README/AGENTS.md/HANDOFF) reflect `.cairn/` + package distribution + corrected env-roles (Antigravity primary coding, Claude specs/reviews); the false `.agents/` alignment lines are gone.
9. `VERSION` bumped (target `0.14.0`); `HANDOFF.md` updated in the same commit per `[LAW handoff-stays-current]`.

## §6 RISKS

| Risk | Mitigation | Child |
|---|---|---|
| Claude Code plugin format / loader specifics differ from assumption | WS03 verifies against a real Claude Code plugin install before downstream WSs depend on it | 03 |
| agy `import claude` doesn't ingest the plugin cleanly | WS04 validates empirically; fallback = reserved native `cairn-agy` plugin | 04 |
| Skill-body path sweep misses a probe (silent stale path) | WS07 uses programmatic `rg` counts, not hand lists; WS11 guard re-checks | 07, 11 |
| Migration loses adopter memory/laws | WS09 is copy-then-verify, user-driven, dry-run-first; fixture test in DoD #2/#5 | 09 |
| `.cairn/` import line forgotten by user → habitat silent | WS02 makes the agent SHOW the line + WS09 install-integrity check flags a missing import | 02, 09 |
| Multi-package drift (plugin vs cairn-pi vs source) | WS11 sync-guard wired to CI/prepublish | 11 |
| Program too large → cross-section inconsistency | this `/program` shape + Gate B peer-review + per-WS fresh-agent review | master |

No homeless risks.

## §7 WHY THIS SHAPE

- **State in `.cairn/`, not a vendor dir** — the only namespace cairn fully controls; survives vendor policy changes (the lesson of the 2026-05 sandbox premise).
- **One Claude plugin, imported by agy** — agy's `import claude` makes a second harness free; building a third bespoke package would violate DRY and widen the drift surface.
- **Byte-identical skills from one source** — the cairn-pi sync-guard already proved this; generalizing it is cheaper than per-package divergence.
- **User-written import line** — the minimal, honest vendor-file touch; re-justified by ownership, not a transient bug.
- **Program, not spec** — see §11.

## §8 OPERATIONAL POLICY

- **Sync-guard ratchet:** no package publishes/merges if `sync --check` is red. Wired to `prepublishOnly` (npm) and a repo CI check (plugin + sources).
- **Namespace-audit ratchet:** new skill/folder/package/command names pass the WS12 collision sweep before ship; collisions force a rename (precedent `/review`→`/peer-review`), never coexistence.
- **Pre-merge review:** this program's release-shaped commits get fresh-agent `/peer-review` per `[LAW pre-merge-review]` (the per-WS loop in §9.3 plus the Gate B master review).
- **Lockstep versioning:** package versions track `VERSION`; the guard enforces it.

## §9 PARALLELIZATION GRAPH + STATUS TABLE

### §9.1 Workstream registry
Full Goal/Scope/Depends-on/Parallel-safe/Files/Gate/Telemetry/Diagnostics/Rollback per stub file (see links in §9.4).

### §9.2 Dependency DAG (waves overlap, no barrier)
```
Wave 0 (contracts freeze):   01 .cairn-layout   02 import-bridge   12 namespace-audit
                                   │  │                │                  │
Wave 1 (build on contracts): 03 claude-plugin ─ 04 agy ─┐  05 pi-align   06 manifest   07 skill-paths   11 sync-guard
                                   │                     │     │             │             │              │
Wave 2 (integrate/close):    08 adopt-rewrite ── 09 migration+integrity ── 10 docs
```
- Wave 0: 01, 02, 12 (12 can start immediately — it's an audit).
- Wave 1: 03 (dep 01,02) → 04 (dep 03); 05 (dep 01); 06 (dep 01); 07 (dep 01); 11 (dep 03,05).
- Wave 2: 08 (dep 01,02,03,06); 09 (dep 01,06,08); 10 (dep most).

### §9.3 Parallel-execution protocol
1. **One worktree per workstream** (`git worktree add`), so parallel agents never share an index.
2. **Contracts freeze first:** 01/02/12 land + are reviewed before Wave 1 builds against §2.
3. **Per-WS loop:** `/spec --from <stub>` (elaborate, sonnet) → code (sonnet, in worktree) → cold `/peer-review` (fresh agent, opus, did NOT author) → absorb blockers → re-review **until a no-blocker pass** → ready.
4. **Integration serialized through main context** — worktrees merge one at a time; the §9.4 table is the single coordination surface; the master's §2 contracts win on conflict.
5. **Programmatic counts** (`rg -c`), never frozen numbers, when a child cites "every skill that references X".
6. **Model policy:** sonnet for elaborate + code (mechanical, markdown/JSON edits); opus for peer-review and contract-touching synthesis. Per `[MEM feedback/own-namespace-no-vendor-folder-deps]` workflow note.

### §9.4 Status table (orchestration state — the single source of execution truth)

| Phase | Spec | Status | Owner | Depends on |
|---|---|---|---|---|
| 01 | [`SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md`](SPEC_CAIRN_OWNERSHIP_01_CAIRN_STATE_LAYOUT.md) | OPEN | — | (foundational) |
| 02 | [`SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md`](SPEC_CAIRN_OWNERSHIP_02_IMPORT_BRIDGE.md) | OPEN | — | (foundational) |
| 03 | [`SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md`](SPEC_CAIRN_OWNERSHIP_03_CLAUDE_PLUGIN.md) | OPEN | — | 01, 02 |
| 04 | [`SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md`](SPEC_CAIRN_OWNERSHIP_04_AGY_DISTRIBUTION.md) | OPEN | — | 03 |
| 05 | [`SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT.md`](SPEC_CAIRN_OWNERSHIP_05_PI_ALIGNMENT.md) | OPEN | — | 01 |
| 06 | [`SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE.md`](SPEC_CAIRN_OWNERSHIP_06_MANIFEST_RESHAPE.md) | OPEN | — | 01 |
| 07 | [`SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS.md`](SPEC_CAIRN_OWNERSHIP_07_SKILL_BODY_PATHS.md) | OPEN | — | 01 |
| 08 | [`SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE.md`](SPEC_CAIRN_OWNERSHIP_08_ADOPT_REWRITE.md) | OPEN | — | 01, 02, 03, 06 |
| 09 | [`SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md`](SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md) | OPEN | — | 01, 06, 08 |
| 10 | [`SPEC_CAIRN_OWNERSHIP_10_DOCS.md`](SPEC_CAIRN_OWNERSHIP_10_DOCS.md) | OPEN | — | 01–09 |
| 11 | [`SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD.md`](SPEC_CAIRN_OWNERSHIP_11_SYNC_GUARD.md) | OPEN | — | 03, 05 |
| 12 | [`SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md`](SPEC_CAIRN_OWNERSHIP_12_NAMESPACE_AUDIT.md) | OPEN | — | (foundational) |

Executors claim a row (`Status: in-progress, Owner: <model/agent>`) and mark `COMPLETE` on merge.

## §10 FIRST-ACTION CHECKLIST

1. Read this master end-to-end, especially §2 (contracts), §3 (resolved), §4 (hard contract).
2. Confirm Wave 0 (01, 02, 12) is reviewed before starting Wave 1.
3. Claim a row in §9.4.
4. Read that row's stub; `/spec --from <stub>` to elaborate (sonnet); code in a dedicated worktree (sonnet).
5. Cold `/peer-review` by a fresh agent (opus) that did not author the code; absorb blockers; re-review until a no-blocker pass.
6. Hand the worktree back to main context for serialized integration; mark `COMPLETE`.

## §11 ARCHITECTURAL RATIONALE FOR THE PROGRAM SHAPE

This is a program, not a single spec, because: (a) it spans 12 workstreams with real cross-cutting contracts (the `.cairn/` layout, the import line, the single-source-of-truth sync) that multiple parallel executors must cite — exactly the contract-surface case `/program` exists for; (b) the maintainer asked for **maximal fan-out** (program→spec→code with fresh agents), which requires independently-claimable child specs; (c) precedent — `SPEC_CAIRN_PI_PACKAGE` proved the package-distribution pattern as one spec; generalizing it to three harnesses + state-migration + guards outgrew a single file (the same way the old umbrella spec's single-file form drifted). The master is the contract; the children are the parallel targets.
