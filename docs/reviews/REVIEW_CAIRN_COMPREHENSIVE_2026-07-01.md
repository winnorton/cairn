# Comprehensive Review — cairn (2026-07-01)

**Reviewer:** external cold audit (did not author any of this repo). Report only — nothing fixed.
**Tree state reviewed:** working tree at `aaf2bd1` + uncommitted changes (lra skill added; machineprogram/machinespec deleted; manifest/adopt/AGENTS/HANDOFF/sync-configs modified). `VERSION` = 0.14.0; latest tag = `v0.14.0`.
**Method:** six parallel review passes (per-skill quality, consistency/drift, adopter experience, enforcement ratio, security, design coherence), each reading source files directly; every finding below was verified against the actual files (line numbers quoted from reads performed during this review), not against HANDOFF.md or other docs' claims about themselves. The repo's own gates were executed: `sync-skills.mjs --check` (green for all three packages, lockstep 0.14.0), `check-skill-budgets.mjs` (green, 4 near-cap), `check-prompt-register.mjs` (green).

Severity scale — **BLOCKER**: breaks the install contract or a live abuse surface. **MAJOR**: actively misleads agents/adopters, or violates one of the repo's own laws with real consequence. **MINOR**: drift or inconsistency with bounded blast radius. **NIT**: cosmetic.

---

## Executive summary — top 5 issues

1. **The essential seed file is not in the install manifest.** `manifest.json` `files[]` has **no entry for `files/.cairn/CLAUDE.md`** — the file the mandatory `@./.cairn/CLAUDE.md` import line points at. A manifest-driven adopt installs 10 state files, then tells the user to import a file that was never written. `--tier seed` ("the two-file minimum viable habitat") installs **one** file. The habitat lands silently non-functional — the exact failure the migration flow's check B4 exists to catch, and fresh installs never run it. (BLOCKER-1)

2. **The live feedback endpoint's only abuse defense is a no-op.** `server/feedback-endpoint/index.js:42-46` keys its 2-req/60s rate limit on the **leftmost, client-controlled** `X-Forwarded-For` element. A unique header value per request yields a fresh bucket every time, against an unauthenticated public endpoint that files issues into the maintainer's GitHub tracker. (BLOCKER-2)

3. **`agy plugin import claude` — a command the repo itself documents as returning "No claude extensions found" — is still presented as the live agy path on five current surfaces**, including `files/skills/README.md:7`, which ships inside every package. The migration flow's agy residue gate requires confirming the plugin was "imported via `agy plugin import claude`" — a check that can never pass, so agy residue cleanup is permanently skipped as written. (MAJOR-1)

4. **The Pi install contract fails three ways at once**: the manifest's `delivery` blocks promise `pi` delivery on 19 entries while `@winnorton/cairn-pi` ships 6 skills; HANDOFF.md records that cairn-pi **0.14.0 was never published to npm** while adopt.md instructs `pi install npm:@winnorton/cairn-pi` unconditionally and claims "version-locked to the cairn release"; and the post-install report ends "say `tour`" — Pi has no tour skill. (MAJOR-2)

5. **Governance is 100% prose.** 0 of 18 laws (11 dev + 7 seed) are mechanically enforced — ratio 0.00 against the repo's own 0.5+ target; zero harness hooks, zero git hooks; the only CI (sync-guard) enforces skill-distribution hygiene, is path-filtered so a PR touching only HANDOFF.md/LAWS.md runs zero checks, and its cairn-agy step exists only uncommitted. The predictable result is visible in this same review: the repo's entry-point docs are factually wrong about its own release state (CLAUDE.md:13 and AGENTS.md:18 say "latest tag is v0.13.1"; `git tag` says v0.14.0), and `docs/specs/` holds 27 shipped spec files still wearing `Status: READY FOR EXECUTOR` / `STUB` badges — the exact "status fields drift" failure the Design DNA predicts. (MAJOR-3/4/5)

---

## BLOCKER

### BLOCKER-1 — `files/.cairn/CLAUDE.md` missing from `manifest.json` `files[]`; installs produce a habitat whose import line points at nothing

**Evidence (all verified directly):**
- `grep -n 'CLAUDE.md' manifest.json` → only two prose hits ([manifest.json:17](../../manifest.json), [manifest.json:352](../../manifest.json)); **no `src: files/.cairn/CLAUDE.md` entry exists** in `files[]`, at HEAD or in the working tree. The source file exists on disk at `files/.cairn/CLAUDE.md`.
- [adopt.md:531](../../adopt.md) — Manifest-reference table row 1: `| files/.cairn/CLAUDE.md | .cairn/CLAUDE.md | essential | seed |`.
- [adopt.md:264](../../adopt.md) — Step 4b preview lists `.cairn/CLAUDE.md` first, under ESSENTIAL.
- [manifest.json:352](../../manifest.json) — `"seed": "Agent-neutral core: CLAUDE.md + memory/MEMORY.md … The two-file minimum viable habitat."` The seed tier's actual `files[]` content is **one** file (`memory/MEMORY.md`, manifest.json:24).
- [adopt.md:374](../../adopt.md) — Step 6 instructs the user to add `@./.cairn/CLAUDE.md` to their context file; [adopt.md:300](../../adopt.md) scopes Step 5 to "each file in the `.cairn/` state manifest", whose only machine-readable meaning is the `dest`-bearing manifest entries (10 files, CLAUDE.md not among them).
- [AGENTS.md:60-61](../../AGENTS.md) — "`manifest.json`; `files:` array is the canonical source-of-truth for what ships." By its own canon, `.cairn/CLAUDE.md` does not ship.

**Failure trace:** manifest-driven agent installs 10 files → writes version marker → shows import line → user adds `@./.cairn/CLAUDE.md` → import silently resolves to a nonexistent file → habitat is dead, install report says success. The migration flow treats a missing import target as a hard failure ("mandatory — not a warning", [adopt.md:836-849](../../adopt.md)); the fresh-install flow — the common path — has no equivalent check. Installs that work in practice do so only because Step 5's *example snippet* ([adopt.md:315](../../adopt.md)) happens to curl CLAUDE.md — meaning two reasonable agents produce different installs (see MINOR-1).

**Recommendation:** add the entry — `{"src": "files/.cairn/CLAUDE.md", "dest": "{projectRoot}/.cairn/CLAUDE.md", "mode": "create-if-absent", "role": "essential", "tier": "seed"}` — and add an install-completeness assertion (the existing `scripts/cairn-integrity.*` checks could be the post-install verification step adopt.md calls for). Add a CI check that every path in adopt.md's manifest-reference table exists in `files[]`.

### BLOCKER-2 — feedback endpoint rate limit is spoofable via `X-Forwarded-For`; in-memory map is per-instance

**Evidence:** [server/feedback-endpoint/index.js:42-46](../../server/feedback-endpoint/index.js) —

```js
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
}
```

The rate-limit key ([index.js:21-31](../../server/feedback-endpoint/index.js): `RATE_LIMIT_MAX = 2`, in-memory `Map`) is the **leftmost** `X-Forwarded-For` element — fully attacker-controlled. One spoofed header per request = unlimited fresh buckets. On Cloud Run the trustworthy hop is the rightmost entry appended by Google's front end, not the leftmost. Compounding: the `Map` is per-instance, so even a correct key multiplies by the instance count. The endpoint is deployed `--allow-unauthenticated` and its own README names rate limiting as *the* abuse defense ([server/feedback-endpoint/README.md:150-152](../../server/feedback-endpoint/README.md)). Combined with MAJOR-8 (no content neutralization) this permits unbounded spam/injection into the maintainer's issue tracker and burns the service token's API quota.

**Recommendation:** derive the client IP from the rightmost XFF hop (or set Express `trust proxy` appropriately and use `req.ip`); consider a durable rate-limit backing (or `--max-instances 1`) and a per-repo daily issue cap as a backstop.

---

## MAJOR

### MAJOR-1 — `agy plugin import claude` still documented as the live path on five surfaces; migration's agy gate is unsatisfiable

The repo's own note ([docs/notes/NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md:24](../../docs/notes/NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md)) and adopt.md Step 4a ([adopt.md:238-242](../../adopt.md)) establish that `import claude` does NOT pick up the cairn plugin; the native `packages/cairn-agy/` plugin is the supported path. Contradicted by (all verified by grep):

- [files/skills/README.md:7](../../files/skills/README.md) — "or `agy plugin import claude` for Antigravity" — **this file ships inside all three packages** (it's a manifest entry), so every adopter receives the dead instruction.
- [adopt.md:102](../../adopt.md) — "skills reach agy via `agy plugin import claude` (Step 4a)" — contradicts Step 4a itself, 130 lines later, and is the *first* agy install statement an agent reads.
- [adopt.md:662](../../adopt.md) — migration Prerequisites: "or `agy plugin import claude` for Antigravity."
- [adopt.md:876](../../adopt.md) — Phase C gate: "confirm `agy plugin list` shows the `cairn` plugin imported via `agy plugin import claude`" — **can never pass** for a correctly installed native plugin; per [adopt.md:878-879](../../adopt.md) the agent must then skip agy residue cleanup forever, leaving stale flat-format skills shadowing under `~/.gemini/config/skills/`.
- [README.md:87](../../README.md) — "or `agy plugin import claude` (agy)".
- [AGENTS.md:41](../../AGENTS.md) — "agy via `agy plugin import claude`" (inside the doubly stale "In flight as of v0.13.1" bullet — see MAJOR-4).

**Recommendation:** one sweep replacing all five with the native install command; rewrite the Phase C gate to check for the `cairn-agy` plugin by name.

### MAJOR-2 — Pi install contract: manifest over-promises 13 skills, package version unpublished, post-install instruction is a dead end

- **Over-promise:** manifest `delivery` blocks name `"pi": "@winnorton/cairn-pi (npm)"` on 19 entries (e.g. reflect [manifest.json:44](../../manifest.json), tour :216, prune :228, audit :240, feedback :252, session-distill :335), but [adopt.md:218-219](../../adopt.md) and the package itself (`packages/cairn-pi/skills/` — verified: exactly `fast-execute, note, peer-review, program, round-review, spec`) deliver **6**. A manifest-reading Pi agent reports 13 skills the user never gets.
- **Unpublished version:** [HANDOFF.md:225-226](../../HANDOFF.md) — "npm publish (Phase 6) still pending — the package is not yet installable from npm" (2026-06-11); [HANDOFF.md:49](../../HANDOFF.md) — v0.14.0 open follow-up: "optional `npm publish` of cairn-pi 0.14.0". Best-supported in-repo reading: v0.13.1 is on npm, 0.14.0 is not. [adopt.md:216](../../adopt.md) instructs `pi install npm:@winnorton/cairn-pi` unconditionally and [adopt.md:220-221](../../adopt.md) claims "Version-locked to the cairn release" — false at review time. Result: `.cairn/cairn-version` says 0.14.0 while skills are 0.13.1, and nothing detects the skew.
- **Dead end:** [adopt.md:398](../../adopt.md) — the install report for every harness ends "Next: say `tour`…" — tour is not in cairn-pi.

**Recommendation:** strip `pi` from the 13 non-shipped `delivery` blocks (or ship them); publish 0.14.0 or state the actual published version in adopt.md's Pi branch; make the report's "next" line harness-aware.

### MAJOR-3 — Enforcement ratio is 0.00 (0/18 laws); the laws' own proposed gates were never built; CI is path-filtered around the drift it should catch

Verified inventory: the only workflow is `.github/workflows/sync-guard.yml` (drift, budget, register, lockstep — all skill-distribution hygiene), path-filtered to `files/skills/**`, `packages/*`, `scripts/*.mjs`, `VERSION` — a PR touching only HANDOFF.md, LAWS.md, adopt.md, or README.md runs **zero checks**. No git hooks (`.git/hooks` samples only, no `core.hooksPath`), no harness hooks (`.claude/settings.local.json` has no `hooks` key). Classification of all 11 dev laws + 7 seed laws: **every one prompt-only** (full table in Appendix C). Two laws document their own unbuilt gates:

- `[LAW pre-merge-review]` ([LAWS.md:199-202](../../LAWS.md)) proposes "a pre-merge hook that checks for a `/peer-review`-shaped citation in the PR body" — never built, despite the law's Why citing **five misses across four v0.12.x releases**.
- `[LAW handoff-stays-current]` — trivially checkable (VERSION changed ⇒ HANDOFF.md changed and contains the new version) — and currently being violated at HEAD (see MAJOR-4).

The sync-guard header cites `[LAW prompt-economy]` / `[LAW gate-beats-instruction]` — laws that exist in *another repo*: cairn mechanically enforces borrowed laws and prompt-enforces all of its own.

**Recommendation (top 3 by incident-history × feasibility):** (1) release-guard CI job, unfiltered, enforcing VERSION⇒HANDOFF coupling + version-string presence; (2) peer-review-citation gate on release-shaped PRs, exactly as LAWS.md:199-202 already specifies; (3) gitleaks/trufflehog CI over the whole tree including `docs/study_sessions/*.jsonl` for `[LAW credentials-never-in-transcript]`'s artifact half. (4th/5th: namespace lint against a vendor-builtin denylist; commit-msg citation hook.) Appendix C sketches all five.

### MAJOR-4 — Entry-point docs are factually wrong about the repo's own release state (`[LAW handoff-stays-current]` violated at HEAD)

- [CLAUDE.md:13](../../CLAUDE.md) — "**Latest tag is v0.13.1**; v0.14.0 architectural shift is in-program" — `git tag` contains `v0.14.0` (created 2026-06-14 per HANDOFF.md:49). Auto-loaded by every Claude Code session; two weeks stale.
- [AGENTS.md:18](../../AGENTS.md) ("**Latest tag:** v0.13.1") and [AGENTS.md:36](../../AGENTS.md) ("**In flight as of v0.13.1:** v0.14.0…") — same false claim in the designated canonical orientation file. AGENTS.md **was edited in the current working tree** (18→19 skill count) and the stale tag lines were left standing.
- [README.md:332-334](../../README.md) — `## Status` top entry is **v0.13.1**; no v0.14.0 entry exists anywhere in README (`grep '^v0\.14' README.md` → none), despite `[LAW handoff-stays-current]`'s "One commit, one consistent view" naming README's status section explicitly ([LAWS.md:111-114](../../LAWS.md)).
- Stale counts, same class: "18 skills" / "All 18" at [CLAUDE.md:18](../../CLAUDE.md), [AGENTS.md:82](../../AGENTS.md), [HANDOFF.md:8](../../HANDOFF.md), [HANDOFF.md:288](../../HANDOFF.md), [adopt.md:233](../../adopt.md), [packages/cairn-claude/README.md:46](../../packages/cairn-claude/README.md), [packages/cairn-agy/README.md:34](../../packages/cairn-agy/README.md) — against 19 actual. [HANDOFF.md:62](../../HANDOFF.md)'s claim that the 19-count working tree is "self-consistent with the catalogs" is false on six surfaces.

**Recommendation:** one consistency commit fixing tag/status/counts, then the MAJOR-3 release-guard so this class can't recur silently.

### MAJOR-5 — Folder-as-status discipline has collapsed in `docs/specs/`

Design DNA ([AGENTS.md:184-187](../../AGENTS.md)): "Folder-as-status, not `Status:` fields … `git mv` is the ship signal." Verified: `docs/specs/` contains **27 spec files for two programs HANDOFF records as shipped** (CAIRN_OWNERSHIP ×13, shipped 2026-06-14; HIVE_CONTEXT_SESSIONS ×12, shipped 2026-06-13) plus the collision report; `docs/specs/archive/` contains exactly **one** file. 22 active-folder specs still carry `Status: READY FOR EXECUTOR` or `STUB` fields for merged work — the precise "status fields drift" failure the DNA predicts, in the repo that wrote the prediction. [AGENTS.md:44-45](../../AGENTS.md) compounds it by telling agents the shipped program is in-flight and must be read "before touching `manifest.json`". Contrast: `plans/` is clean (empty active, 9 archived) — the discipline works where practiced.

**Recommendation:** `git mv` both shipped program families to `docs/specs/archive/`; drop the `Status:` fields per the DNA; fix AGENTS.md:36-45 to past tense.

### MAJOR-6 — `/fast-execute` skill body contradicts its own description and has rotted internal step numbering — in the one skill that drives unattended execution

All verified in [files/skills/fast-execute/SKILL.md](../../files/skills/fast-execute/SKILL.md):
- **Description vs body:** frontmatter (line 3) lists "an unelaborated `/program` stub" as a **stop** condition; body line ~113 says flip to `.stub-rejected` "and **proceed to the next candidate**", and Step 7's stop-condition list does not include stubs. An agent trusting the description believes the daemon halts; it keeps polling.
- **Off-by-one step references (×5):** lines ~108/109/117/188/325 reference "STOP (Step 6)" / "schedule next poll (Step 5)" where stop conditions are Step 7 and scheduling is Step 6 — a step was inserted without renumbering.
- **Incomplete sentinel enum:** line ~253 "The sentinel suffix is always one of `.ready`, `.claimed`, `.done`, `.blocked`" — omits `.stub-rejected`, which the same file's Step 2 writes. An executor validating suffixes against the enum treats its own output as malformed.

**Recommendation:** reconcile stub semantics in the description, renumber, complete the enum; trim the description below 900 while in there (currently 996).

### MAJOR-7 — Shipped skills cite laws adopters don't have, reference maintainer-machine paths, and `tour` is stale on three axes

- [files/skills/plan/SKILL.md:75,80,118](../../files/skills/plan/SKILL.md) cites `[LAW scope-explicit]` (exists only in cairn's own root LAWS.md, not the shipped `files/.cairn/LAWS.md`) and `[LAW scope-ratchet]` (exists in **neither** — attributed to the external "cwar NEW_LAWS"). [files/skills/lra/SKILL.md:23](../../files/skills/lra/SKILL.md) tells agents to "honor" `[LAW prompt-economy]` — defined in no LAWS file in this repo. An adopter's `/audit` counts citations that resolve to nothing.
- [files/skills/prompt-evolve/SKILL.md:484-495](../../files/skills/prompt-evolve/SKILL.md) ships `C:\Users\winno\projects\fish\...` and `C:\Users\winno\projects\purduebb\...` as the reference examples, with line ~501 instructing agents to "look at the fishing live-evolved file" — unfollowable on any machine but the maintainer's. Same file also carries three different canonical output paths (frontmatter `<project>/prompt-evolve/` vs body's `docs/prompt-evolve/` vs `.cairn/prompt-evolve/`).
- [files/skills/tour/SKILL.md:35,55](../../files/skills/tour/SKILL.md) — "6 domain-agnostic seed laws" twice; the shipped template says **7** ([files/.cairn/LAWS.md:53](../../files/.cairn/LAWS.md)). Lines 39-44 enumerate 17 skills (missing `fast-execute` and `lra`), reference `files/skills/README.md` (a cairn-source path no adopter has), and describe the pre-v0.14 layout (bare `CLAUDE.md`/`LAWS.md`/`skills/` dir instead of `.cairn/` + plugin delivery). The onboarding skill gives fresh adopters a tour of a habitat that no longer exists. ([adopt.md:268](../../adopt.md) repeats the stale "6 seed laws".)

**Recommendation:** seed the cited laws into `files/.cairn/LAWS.md` or inline their rules; replace machine-local paths with in-repo/described references; rewrite tour's walk for the `.cairn/` layout and current skill set.

### MAJOR-8 — Feedback pipeline: egress before consent, no content neutralization on issue creation

- **Skill side** ([files/skills/feedback/SKILL.md:8](../../files/skills/feedback/SKILL.md) "Tell the user once it's filed, not before"; line 120 "Never file silently… Once, briefly, with a link"): the skill POSTs agent-composed, session-derived content to a remote endpoint that publishes it in a **public** GitHub issue, and the user learns **after** the data has left the machine. There is no show-payload-and-confirm gate; the only safeguards are the agent's judgment and the server's best-effort sanitizer.
- **Server side** ([server/feedback-endpoint/index.js:109-136](../../server/feedback-endpoint/index.js), [sanitize.js:5-17](../../server/feedback-endpoint/sanitize.js)): `sanitize()` strips emails/paths/token-shapes but does **not** neutralize markdown, `@username` GitHub mentions (the email regex requires a domain, so bare mentions pass), or links — unauthenticated notification-spam/phishing/prompt-injection into the maintainer's tracker, at unbounded volume given BLOCKER-2. `context` has **no explicit length cap** (only `body` is checked at 20 000; `context` is bounded only by the 100 kb JSON limit — [index.js:102-110](../../server/feedback-endpoint/index.js)).
- **Consumption side:** `/session-distill` ingests multi-MB transcripts and `/feedback`-derived corpora with no "treat analyzed content as data, not instructions" framing anywhere in [files/skills/session-distill/SKILL.md](../../files/skills/session-distill/SKILL.md) — a prompt-injection seam for maintainer-side agents.

**Recommendation:** add a pre-send payload preview + explicit user confirmation to `/feedback`; escape/strip `@`-mentions, autolinks, and HTML server-side; cap `context`; add a data-vs-instructions boundary note to corpus-ingesting skills. `/fast-execute` should likewise state that `docs/specs/` inbox writers must be as trusted as the executor (its path-rejection guards are correctness checks, not a trust boundary — [files/skills/fast-execute/SKILL.md:100-102](../../files/skills/fast-execute/SKILL.md)).

### MAJOR-9 — `/resume` collides with Claude Code's built-in `/resume` — the same failure class that forced the `/review` rename

The v0.13.1 release exists *because* a name collision silently shadowed a cairn skill ([LAWS.md:249-253](../../LAWS.md), `[LAW own-your-namespace]`: "On collision with a vendor name, rename — don't coexist"). Claude Code ships a built-in `/resume` (session picker) and `--resume` CLI flag; cairn's `resume` skill occupies the same name today. Secondary, lower-confidence collisions: `plan` (harness plan modes; "plan first" is a plan-mode activation phrase in some harnesses) and `feedback` (vendor bug-report commands — a user reporting a harness bug via `/feedback` files a GitHub issue against winnorton/cairn instead).

**Recommendation:** apply the repo's own precedent — evaluate renames (`resume` is the clear case), and add the namespace lint from MAJOR-3's candidate list so the next collision is caught mechanically.

### MAJOR-10 — The 3-instance observation gate is selectively enforced; machineprogram/machinespec churn is the proof

DNA ([AGENTS.md:179-183](../../AGENTS.md)): "New skill proposals should cite at least 3 observed instances before promotion." Verified per skill: `session-distill` passed exemplarily (6+ instances in durable output). But `prompt-evolve` shipped citing **two** instances (commit `cb3b5d8`; the third is claimed only retroactively by the uncommitted lra work); `program`/`round-review` shipped citing one observed arc; `fast-execute`'s introducing commit cites a single session **while holding `/standby` at the gate in the same commit message** — the gate applied to one skill and waived for the other in one breath; `lra` cites zero observed instances of adopter demand (its "third worked instance" evidence supports prompt-evolve, not a new skill). Worst case: `machineprogram`/`machinespec` landed at `1b4579c` (2026-06-30) with zero instance evidence, zero note, zero spec, no manifest/catalog/package enrollment (half-shipped by [AGENTS.md:127-130](../../AGENTS.md)'s own definition — AGENTS.md said "18" while the tree held 20 dirs), and were deleted ~a day later as an **unowned, uncommitted** working-tree change whose only durable trace is [HANDOFF.md:62](../../HANDOFF.md)'s "Noted, not mine". Introduce-then-delete-within-days is exactly the churn the gate exists to prevent.

**Recommendation:** commit the deletion deliberately with a rationale note (per the repo's own breadcrumb ethic), and make the gate a checklist item in the skill-authoring section of `files/skills/README.md` — "cite 3 instances in the introducing commit body" is auditable by the MAJOR-3 citation hook.

### MAJOR-11 — v0.13.x re-adopters are silently stranded: the migration trigger can never fire

Step 3's fast-path probes only `{cairnRoot}/cairn-version` = `.cairn/cairn-version` ([adopt.md:171-174](../../adopt.md)). A v0.13.x install's marker is at `<project>/.claude/cairn-version` ([adopt.md:650-653](../../adopt.md)). No step in the fresh-install flow probes the old path, so the migration section's own trigger — "Step 2's fast-path finds `<project>/.claude/cairn-version`" ([adopt.md:650](../../adopt.md)) — is unreachable: the agent sees "not found → fresh install" and writes new seed files while the user's accumulated laws/memory sit invisible in the old locations. (The trigger also mislabels the fast-path as "Step 2" — it lives in Step 3; same mislabel at adopt.md:1055.)

**Recommendation:** add an old-marker probe to Step 3's fast-path (three `test -f` lines) that routes to the migration flow.

---

## MINOR

**MINOR-1 — Step 5's install set is an undefined term; `delivery`-typed entries never explained.** [adopt.md:121-122](../../adopt.md) describes `files[]` entries as having "`src`, `dest`, `mode`…" — 19 of 29 entries have `delivery` and no `dest`/`mode`, and adopt.md never says what to do with them (correct answer — skip, they arrived in Step 4a — is only inferable). [adopt.md:300](../../adopt.md)'s prose parenthetical "(CLAUDE.md, LAWS.md, memory tree)" also omits the four `context/lra` files the manifest does install. Two reasonable agents produce different installs.

**MINOR-2 — Step 4b preview omits the four `mode: overwrite` lra files** ([manifest.json:167-198](../../manifest.json)) — the *only* files a re-adopt overwrites without prompting are the ones never previewed, against the Safety rule "Show the plan before writing" ([adopt.md:409-410](../../adopt.md)); the preview meanwhile lists phantom `.cairn/CLAUDE.md` (BLOCKER-1). adopt.md's reference table also says the lra masters are "installed by the `lra` skill" ([adopt.md:541-543](../../adopt.md)) while the manifest ships them at tier `full` via adopt — two owners claimed.

**MINOR-3 — Dangling references in the standalone adopt.md:** "PF-6" at [adopt.md:922](../../adopt.md) and [adopt.md:975](../../adopt.md) is defined only in `docs/specs/SPEC_CAIRN_OWNERSHIP_09_MIGRATION_INTEGRITY.md` — a file adopters never fetch — at the exact moment the agent is deciding what to `rm -rf`; "WS08's adopt.md fast-path" at [adopt.md:1057](../../adopt.md) is program-internal jargon. Cowork shell-fallback pointers ([adopt.md:348-349](../../adopt.md), [adopt.md:414-416](../../adopt.md)) cite "see Step 3", which contains no mount path or shell fallback since the v0.14 rewrite.

**MINOR-4 — Fresh install never verifies the import line.** Step 6 waits for the user to say `done` and reports success unchecked ([adopt.md:378-396](../../adopt.md)); migration B4 treats the same condition as mandatory-fail ([adopt.md:836-849](../../adopt.md)). One grep would close the gap.

**MINOR-5 — Re-adopt semantics are three-way inconsistent for existing `create-if-absent` files:** skip ([adopt.md:330-331](../../adopt.md)), skip-if-in-doubt ([adopt.md:407](../../adopt.md)), vs diff-and-ask-per-file (Case 3, [adopt.md:507-511](../../adopt.md)) — nothing says whether the upgrade diff pass replaces Step 5's skip rule.

**MINOR-6 — Migration Phase C's `rm -rf` loops don't encode their own preconditions.** The prose requires confirming the package replacement is loadable before deleting ([adopt.md:899](../../adopt.md)); the runnable block ([adopt.md:903-909](../../adopt.md)) is an unconditional `rm -rf` over six skill dirs — if cairn-pi 0.14.0 is indeed unpublished (MAJOR-2), a copy-paste run deletes the user's only working copies. The agy gate in the same phase is unsatisfiable (MAJOR-1).

**MINOR-7 — Stale pre-v0.14 paths in canonical docs:** [AGENTS.md:55](../../AGENTS.md) and [AGENTS.md:58](../../AGENTS.md) reference `files/LAWS.md`, `files/CLAUDE.md`, `files/memory/` — none exist (actual: `files/.cairn/…`); same at [LAWS.md:6](../../LAWS.md) and [LAWS.md:28](../../LAWS.md). Six files still cite `docs/origin/` (verified nonexistent; transcripts live at `docs/study_sessions/`): HANDOFF.md, LAWS.md, **the shipped template [files/.cairn/LAWS.md](../../files/.cairn/LAWS.md)**, and three notes.

**MINOR-8 — "Cairn ships markdown, not code" exception list undercounts the code tree ~2×.** DNA names two exceptions ([AGENTS.md:197-199](../../AGENTS.md)); actual: root `scripts/` (6 files, ~680 lines — the largest code location, invisible to the DNA), delegate shims in `packages/cairn-claude/scripts/` and `packages/cairn-agy/scripts/` (which git-based plugin installs DO deliver to adopters, inert), plus test fixtures and CI. The practiced rule (shipped payload is markdown; dev gates are code) holds — `packages/cairn-pi/package.json` `files:` ships no scripts — but the stated rule is stale.

**MINOR-9 — lra cross-repo coupling is documented but unguarded on cairn's side.** The pack's heart is two prompts "authored and gated in the jointly-owned lra repo" ([docs/CROSS_REPO_LRA_CAIRN.md:3-5](../../docs/CROSS_REPO_LRA_CAIRN.md)) that cairn is forbidden to edit ([files/.cairn/context/lra/PROVENANCE.md:8-11](../../files/.cairn/context/lra/PROVENANCE.md)). The md5 pin's verification loop runs only from the lra repo and hard-codes a machine-relative path (PROVENANCE.md:33,38); cairn's CI never checks the fingerprints. `[LAW own-your-namespace]`'s named-deviation clause is satisfied, but the drift guard the pin implies doesn't exist here. A new manifest mode (`overwrite`) and a second adopter-side top-level dir (`research/`) were added for this one skill with no observed-breakage evidence — the DNA's bar for new layers ([AGENTS.md:176-178](../../AGENTS.md)).

**MINOR-10 — lra is half-shipped on user-facing catalogs:** absent from README.md entirely (zero matches), from both package README skill tables ("All 18…"), and from tour's list — while present in AGENTS.md, files/skills/README.md, manifest, sync-configs, and both packages. Its intentional cairn-pi exclusion is documented only in the manifest blob and the cross-repo doc, not in any catalog a Pi-side reader would consult.

**MINOR-11 — CI at HEAD does not guard cairn-agy.** The sync-guard step for `packages/cairn-agy` exists only in the uncommitted working tree (verified via `git diff .github/workflows/sync-guard.yml`); at HEAD, agy package copies can drift with green CI. Known and staged (HANDOFF.md:58) — needs to land.

**MINOR-12 — Cross-skill seam defects (each verified):** `/spec` tells stub-elaborators to read "§5 Parallel Execution Protocol" of the program master ([files/skills/spec/SKILL.md:100-101](../../files/skills/spec/SKILL.md)) — in `/program`'s normative section map §5 is the Definition of Done and the protocol is §9.3 ([files/skills/program/SKILL.md:495](../../files/skills/program/SKILL.md)); `/program`'s status templates archive to `docs/specs/_archive/` while `/spec`, `/round-review`, and `/fast-execute`'s guards standardize on `archive/`; `/round-review` cites "master §5.12", a numbered position `/program` doesn't guarantee; `/session-distill` cites the pre-promotion note path its own line 49 says no longer exists; `/reflect` line 99 and `/audit` line 60 use cairn-source (`files/…`) or pre-`.cairn/` paths.

**MINOR-13 — Trigger-overlap gaps:** `prompt-evolve`'s description ("process in batches and learn as we go", body task-class "Research synthesis") squarely covers `/lra`'s territory and never mentions lra — a subject-research request plausibly routes wrong; `peer-review`'s description claims the phrase "review this PR", which is the built-in `/review`'s exact use case, and is silent about `/round-review` for program rounds.

**MINOR-14 — Endpoint hygiene:** no `package-lock.json` in `server/feedback-endpoint/` (verified by listing) with `^`-ranged deps — non-reproducible deploys on a live service; sanitizer misses Slack tokens/JWTs/PEM/password-assignments (best-effort by design, but the reliance should be louder given MAJOR-8). *(Correction post-review: the `.env.example` the README references DOES exist — it's a dotfile the review's directory listing missed; that sub-finding was a false positive.)*

**MINOR-15 — Manifest dead schema and gaps:** modes `merge-append` and `overwrite-with-backup` defined ([manifest.json:360-361](../../manifest.json)) but used by zero entries; `pathVariables.projectRoot` has no `agy` key ([manifest.json:10-15](../../manifest.json)); hardcoded `v0.14.0` strings in adopt.md preview/report templates will silently stale next release.

---

## NIT

- **N1** — HANDOFF.md numeric claims off: round-review description is 1012 chars, not "1021 — 3 under the limit" ([HANDOFF.md:61](../../HANDOFF.md)); the near-cap list is 4 skills now, not 2.
- **N2** — `files/.cairn/` ships `sessions/` and a `cairn-version` template that no manifest entry delivers; anything expecting `.cairn/sessions/` on a fresh habitat fails.
- **N3** — GCP project number `591252228833` visible across the tree — inherent to the public Cloud Run URL; noting only.
- **N4** — No CORS on the endpoint — fine (curl needs no browser), but worth a deliberate decision comment.
- **N5** — [adopt.md:146](../../adopt.md) tier table equates `seed` with "essential only", conflating the orthogonal role/tier axes (the equivalence holds only by the BLOCKER-1 accident).
- **N6** — AGENTS.md calls `docs/research/` "9 papers" while counting README and open-questions as papers; arithmetic holds (7 essays + 2), phrasing is loose.

---

## What is healthy (for calibration)

- **No live secrets anywhere.** The claimed PAT redaction verifiably held: the earliest committed blob of the origin transcript (`git show 95da3b7:docs/origin/748aff00-….jsonl`) already contains the 7 `<github_pat_REDACTED>` markers and zero live token patterns — the token was never committed. The two `ghp_0123…` strings in SPEC_HIVE…06b are planted scrubber test vectors. Server-side token handling is correct (Secret Manager → env var; generic error bodies).
- **The machine-checked surfaces are clean.** Sync-configs = package copies = manifest skill entries = 19 (claude/agy) and 6 (pi); all five version files at 0.14.0; budgets and register gates green. Every mismatch found in this review lives in unguarded prose — which is itself the MAJOR-3 argument.
- **The gate machinery works when used:** session-distill's promotion (note at 1/3 → gate-watch → promoted at 6+ with instances enumerated in durable output) is a model of the repo's own methodology; gate-watch notes actively track candidate counts; `plans/` folder-as-status is clean; the `aaf2bd1` commit cites four laws by slug.
- The lra provenance discipline (verbatim masters, md5 fingerprints, re-sync protocol, never-edit rule) is unusually careful for a cross-repo asset — it just needs a cairn-side mechanical check (MINOR-9).

---

## Appendix A — Per-skill scorecard

All 19 frontmatter blocks parse as YAML; all `name:` fields match their directory; all have `description:`. Cap 1024 hard / 900 warn (per `check-skill-budgets.mjs`, run during this review).

| skill | desc chars | trigger? | anti-trigger? | body matches desc? | issues |
|---|---|---|---|---|---|
| advocate | 617 | yes | yes | yes | none |
| audit | 541 | yes | yes | yes | bare `LAWS.md` path (pre-`.cairn/`) — MINOR-12 |
| bridge | 669 | yes | yes | yes | none |
| fast-execute | 996 ⚠ | yes | yes | **no** | desc/body stub contradiction; 5 off-by-one step refs; incomplete sentinel enum — MAJOR-6 |
| feedback | 522 | yes | yes | yes | egress-before-consent design — MAJOR-8; endpoint URLs verified consistent with manifest |
| lra | 634 | yes | weak | yes | dangling `[LAW prompt-economy]`; cairn-repo-only doc ref — MAJOR-7, MINOR-9 |
| note | 891 | yes | yes | yes | none |
| peer-review | 898 | yes | yes | yes | trigger phrase "review this PR" overlaps built-in `/review` — MINOR-13 |
| plan | 376 | yes | yes | yes | cites 2 laws absent from adopter template — MAJOR-7; name adjacent to harness plan modes — MAJOR-9 |
| program | 726 | yes | yes | yes | `_archive/` vs `archive/` drift — MINOR-12 |
| prompt-evolve | 929 ⚠ | yes | yes | **partial** | 3 conflicting canonical paths; maintainer-machine absolute paths — MAJOR-7; cold-start mode deferred |
| prune | 488 | yes | yes | yes | none |
| reflect | 643 | yes | yes | yes | `files/`-prefixed source-path leak — MINOR-12 |
| reframe | 490 | yes | yes | yes | none |
| resume | 500 | yes | yes | yes | **name collides with Claude Code built-in `/resume`** — MAJOR-9 |
| round-review | 1012 ⚠ | yes | yes | yes | 12 chars under hard cap; over-specific `§5.12` cross-ref — MINOR-12 |
| session-distill | 927 ⚠ | yes | yes | yes | heavy cairn-repo-only path load; self-inconsistent note path; no data-vs-instructions guard — MAJOR-8, MINOR-12 |
| spec | 787 | yes | yes | yes | wrong master section ref (§5 vs §9.3) — MINOR-12 |
| tour | 391 | yes | yes | **no** | 6-vs-7 seed laws; 17/19 skills; pre-v0.14 layout — MAJOR-7 |

Trigger-overlap verdicts: plan↔spec, reflect↔session-distill, note↔reflect, plan↔program — sufficient disambiguation; peer-review↔round-review — marginal (one-sided); prompt-evolve↔lra — **insufficient** (MINOR-13).

## Appendix B — Cross-reference matrix (working tree)

Y = present · — = absent · int = intentionally absent

| Skill | files/skills/ | skills README | AGENTS.md | manifest | sync-cfg claude/agy | sync-cfg pi | pkg claude/agy | pkg pi | README.md taxonomy | pkg READMEs | tour list |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 13 core skills* | Y | Y | Y | Y | Y | int/Y† | Y | int/Y† | Y | Y | Y |
| fast-execute | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | **—** |
| lra | Y | Y | Y | Y | Y | int | Y | int | **—** | **—** | **—** |
| machineprogram / machinespec | HEAD only, deleted uncommitted | — | — | — | — | — | — | — | — | — | — |

\* advocate, audit, bridge, feedback, note, peer-review, plan, program, prompt-evolve, prune, reflect, reframe, resume, round-review, session-distill, spec, tour (17 rows collapsed; all consistent except as noted). † pi ships only note, peer-review, program, round-review, spec, fast-execute.

Counts: dir 19 = AGENTS.md 19 = skills-README 19 = manifest 19 = claude/agy configs & copies 19; pi 6 = 6 = 6. All five version files 0.14.0.

## Appendix C — Enforcement classification

**Root LAWS.md (11 dev laws):** load-meta-laws, scope-explicit, commit-cite, borrow-adjacent, session-end-reflect, handoff-stays-current, choose-slug-by-scope, survey-tools-by-verb, pre-merge-review, credentials-never-in-transcript, own-your-namespace — **all PROMPT-ONLY** (0/11). Nearest mechanical relative: `sync-skills.mjs` name-format regex, which checks format, not collision — not credited.

**files/.cairn/LAWS.md (7 seed laws):** plan, confirm, assumptions, prefer-edit, root-cause, cadence, credentials-never-in-transcript — **all PROMPT-ONLY** (0/7). The template ships with no enforcement scaffold (no hook templates, no CI snippet).

**Existing mechanical checks** (sync-guard.yml → sync-skills/check-skill-budgets/check-prompt-register; prepublishOnly on cairn-pi only) all enforce distribution hygiene and cite laws from another repo. `cairn-integrity.*` and `smoke-test-migration.ps1` are manual-only. Zero git hooks; zero harness hooks.

**Top mechanical-enforcement candidates (ranked):**
1. **pre-merge-review** — the gate LAWS.md:199-202 already specifies: unfiltered CI job on PRs; if diff touches VERSION or ≥3 user-facing files, require a `/peer-review`-shaped citation in PR body or last commit message. Incident history: 5 documented misses.
2. **handoff-stays-current** — CI: VERSION changed ⇒ HANDOFF.md changed ∧ contains `v$(cat VERSION)`; plus a tag-triggered assertion job. Currently being violated at HEAD (MAJOR-4). Highest feasibility.
3. **credentials-never-in-transcript (artifact half)** — gitleaks/trufflehog over the full tree incl. `docs/study_sessions/*.jsonl` and fixtures, allowlisting the redaction markers. Would have caught the 6-week PAT exposure on day 1.
4. **own-your-namespace** — `check-namespace.mjs`: skill-name denylist of vendor built-ins (would have flagged `resume` today, MAJOR-9) + grep templates for hand-written vendor paths.
5. **commit-cite** — versioned `.githooks/commit-msg` (activate via `core.hooksPath`) requiring `[LAW …]`/`[MEM …]` when the diff touches LAWS/memory surfaces; feeds `/audit`'s citation signal.

---

## What this review could NOT verify, and why

1. **npm registry state of `@winnorton/cairn-pi`** — no network probe of npm was performed. The finding that 0.14.0 is unpublished rests on the repo's own contradictory records (HANDOFF.md:49, :225-226 vs COLLISION_REPORT's "Published at v0.13.1"); the registry itself was not queried.
2. **The deployed feedback endpoint** — the code in `server/feedback-endpoint/` was reviewed, but the live Cloud Run service was not probed; deployed revision may differ from source, and `--max-instances`, secret wiring, and the domain mapping are asserted by the README only. BLOCKER-2 is a source-code finding.
3. **The claimed fresh-agent `/peer-review` of the staged lra work** (HANDOFF.md:58 "no blockers, 4 findings absorbed") — no durable artifact of that review exists in the tree; the claim is unverifiable and was treated as a claim.
4. **GitHub-side configuration** — whether sync-guard is actually a required status check (its path filters make "required" semantics load-bearing), branch protection, and open-issue backlog were not checked (no `gh` calls made).
5. **Harness binary behaviors** — agy 1.0.7's hard-coded `.agents/skills` path, `agy plugin validate` passing, the Claude Code marketplace install round-trip, Pi's `/skill:` invocation, and Cowork's claimed use of the Claude Code harness are all asserted in docs from past validations; none are reproducible from this machine in this review.
6. **Full git-history secret forensics** — only the origin transcript's two committed blobs were checked (both clean). A full scan of all refs/blobs (e.g. gitleaks over history) was not run.
7. **The lra lab repo** — the md5 fingerprints in PROVENANCE.md against lab commit `7ea2050` could not be checked without the external repo; byte-verbatim provenance was taken as claimed (the cairn-side absence of any mechanical check is itself MINOR-9).
8. **Referenced external sessions/corpora** — session IDs `019eaed6`, `601821ab`, the cairn-sessions corpus, and cairn-mcp-server v0.5.0 live outside this repo and were not audited.
