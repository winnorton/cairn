> **Superseded** by [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](../SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md) on 2026-06-13 — re-architected under [LAW own-your-namespace]. Retained for its migration thinking; the 2026-06-13 revalidation findings are summarized at the master's §0 evidence table (not in this file — this body is the unmodified original draft, incl. its now-stale "13 skills" count and the cherry-apply Phase 4 that doc-churn made infeasible).

# v0.14.0 — agents/ umbrella + no-agent-writes-to-CLAUDE.md

> **Filed:** 2026-05-02 · **By:** Claude Opus 4.7 (1M context) · **Requested by:** maintainer
>
> **Promoted from:** [docs/notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md](../notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md)
>
> **Builds on prototype:** commit `345241a` (`feat: v0.14.0 — agents/ umbrella + git as memory bus`) — 15 files, 159+/116−, branch deleted but commit reachable. The prototype solved the *path* shift (memory + laws → `<project>/agents/`); this spec keeps that work and adds the *install-method* shift forced by the 2026-05 sandbox restriction on agent-config writes.

## Human Intent

**Verbatim original request (2026-05-02):**

> *"Claude has changed its permission structure. I think we are going to have to move all of our resources to the project directory […] proceed with plan 'no-agent-writes-to-CLAUDE.md', i think we need to get all of our assets out of the claude structure. Everything local to a project should be in that project folder."*

**Forcing function (the new fact since the prototype was parked).** In adoptions on 2026-05-02, the Claude Code sandbox began intermittently denying writes that combine *(curl external content) + (write to `CLAUDE.md` or `.claude/*` config path)*, classifying the pattern as "agent-config self-modification from external content." Denials are inconsistent — same source-and-target pattern is sometimes allowed, sometimes blocked — making cairn's curl-then-write adoption flow unreliable. Adding curl/Write permission allowlists fixes only the fetch half; the agent-config-write half is a separate rule we can't cleanly engineer around per-write.

**Scope.**

- *Move:* Memory + LAWS.md + cairn-version marker → `<project>/agents/` (project-local, non-vendor namespace). **Source:** prototype `345241a`.
- *New:* Stop having the agent write `<project>/CLAUDE.md` or any `.claude/*` config path *from external content*. The user adds the import line to their own `CLAUDE.md` manually; the agent reads but does not write config-shaped files. **Source:** this spec.
- *Migration:* Existing v0.13.x adopters can re-adopt to v0.14.0 without losing accumulated memory + laws content.

**Skills decision.** Skill files (`SKILL.md`) stay at `~/.claude/skills/` because Claude Code's loader requires that path. This is consistent with the maintainer's principle ("everything local to a project should be in the project folder") — skills are *user-local*, shared across projects, not project-local. The decision matches the parked prototype.

**Success criteria.**

1. A fresh `adopt cairn` completes with **zero agent writes** to any path inside `<project>/CLAUDE.md`, `<project>/.claude/*`, or `~/.claude/memory/*`. Skill writes to `~/.claude/skills/*` are the only permitted user-global writes.
2. The adopted project has `<project>/agents/{LAWS.md, CLAUDE.md, memory/MEMORY.md, memory/{user,feedback,project,reference}/README.md, cairn-version}`.
3. The adopted project's `<project>/CLAUDE.md` contains a *user-added* (not agent-added) `@./agents/CLAUDE.md` import line.
4. A re-adoption from v0.13.x to v0.14.0 cleanly migrates `<project>/.claude/LAWS.md` and `~/.claude/memory/<slug>/*` into the new structure without data loss.

**Out of scope.**

- Plugin packaging — deferred to v0.15.x or later (per `[MEM project/cairn-blend-strategy-pillars]`).
- Removing the curl-based manifest fetch. The agent still curls *the manifest* (parsed in memory, no disk write) — only file-content curl-then-write to config paths is dropped.
- Cross-project shared memory for cross-cutting feedback (collaboration style, general agent-behavior rules). The maintainer's existing pattern uses two slug-namespaced memory stores; v0.14.0 doesn't break that, but the long-term answer (per-project + a separately git-cloned shared `agents-memory` repo, OR plugin packaging) is a v0.15.x decision.

## Pre-flight

All paths below are **relative to the cairn project root**. If the working tree has cairn nested as `<repo>/cairn/`, `cd cairn/` first.

```bash
git status                          # confirm clean working tree (or in a feature branch)
git log --oneline -1                # current HEAD
git show 345241a --stat             # confirm prototype reachable (15 files)
ls files/agents 2>/dev/null         # if exists, prototype already partially applied — start at Phase 2
test -f files/CLAUDE.md && echo "old layout" || echo "post-prototype"
```

If `files/agents/` already exists from a prior partial application of the prototype, skip Phase 1.

If the working tree's `files/` does not exist (e.g. cairn lives under a meta-monorepo `cairn/` subdir and you forgot to `cd`), abort and `cd` to the cairn project root.

## Phase 1 — Template tree relocation

Goal: physically move template files from `files/` to `files/agents/`. Mirror the parked prototype's structural moves.

### STEP 1.1 — Move LAWS template

```bash
git mv files/LAWS.md files/agents/LAWS.md
```

### STEP 1.2 — Move memory templates

```bash
git mv files/memory files/agents/memory
```

This moves all five files: `MEMORY.md`, `feedback/README.md`, `project/README.md`, `reference/README.md`, `user/README.md`.

### STEP 1.3 — Move CLAUDE.md template

This is **new beyond the prototype** — the prototype kept `files/CLAUDE.md` because it still wrote to `<project>/CLAUDE.md`. We don't.

```bash
git mv files/CLAUDE.md files/agents/CLAUDE.md
```

The renamed `files/agents/CLAUDE.md` becomes the source for `<project>/agents/CLAUDE.md` — the file the user's `<project>/CLAUDE.md` will import via `@./agents/CLAUDE.md`.

**CHECKPOINT 1**

```bash
ls files/agents/                    # expect: CLAUDE.md, LAWS.md, memory/
ls files/agents/memory/             # expect: MEMORY.md, feedback/, project/, reference/, user/
test ! -f files/CLAUDE.md && echo OK   # files/CLAUDE.md must be gone
test ! -f files/LAWS.md && echo OK     # files/LAWS.md must be gone
```

If files are missing, the prototype diff is the source of truth: `git show 345241a -- files/`.

## Phase 2 — manifest.json paths and version

Goal: repoint dest paths to `{projectRoot}/agents/...`, drop `userMemory` from `pathVariables`, bump version to `0.14.0`.

### STEP 2.1 — Bump version

In `manifest.json`:

CURRENT:
```json
"version": "0.13.1",
```

REPLACEMENT:
```json
"version": "0.14.0",
```

WHY: cairn convention — semver-shaped, bump minor for non-breaking semantic shifts; this is breaking for adopters (re-adoption requires migration), so minor-bump documents the shift in `HANDOFF.md`/release notes.

### STEP 2.2 — Drop `userMemory` from `pathVariables`

The variable becomes unused after Phase 2.3. Leaving it stale is a future-confusion source.

CURRENT (lines 15–24 of `manifest.json` per current HEAD):
```json
    "userMemory": {
      "description": "Persistent cross-session memory root. […]",
      "claude-code": { […] },
      "cowork": "{userClaude}/memory"
    },
```

REPLACEMENT: delete the entire block.

### STEP 2.3 — Repoint dest paths

For each of the seven entries in the `files` array, update the `dest` field:

| `src` | OLD `dest` | NEW `dest` |
|---|---|---|
| `files/agents/CLAUDE.md` *(was `files/CLAUDE.md`)* | `{projectRoot}/CLAUDE.md` | `{projectRoot}/agents/CLAUDE.md` |
| `files/agents/memory/MEMORY.md` *(was `files/memory/MEMORY.md`)* | `{userMemory}/MEMORY.md` | `{projectRoot}/agents/memory/MEMORY.md` |
| `files/agents/LAWS.md` *(was `files/LAWS.md`)* | `{projectClaude}/LAWS.md` | `{projectRoot}/agents/LAWS.md` |
| `files/agents/memory/user/README.md` *(was `files/memory/...`)* | `{userMemory}/user/README.md` | `{projectRoot}/agents/memory/user/README.md` |
| `files/agents/memory/feedback/README.md` | `{userMemory}/feedback/README.md` | `{projectRoot}/agents/memory/feedback/README.md` |
| `files/agents/memory/project/README.md` | `{userMemory}/project/README.md` | `{projectRoot}/agents/memory/project/README.md` |
| `files/agents/memory/reference/README.md` | `{userMemory}/reference/README.md` | `{projectRoot}/agents/memory/reference/README.md` |

The `src` paths also update because of Phase 1 moves — every memory entry gets `files/agents/memory/...` as src.

WHY: `{projectRoot}/agents/...` is the cairn-controlled namespace (vs. `.claude/`, an Anthropic-controlled vendor namespace). The folder name encodes scope: anything not for agents shouldn't land there.

### STEP 2.4 — Skill entries unchanged

The 13 skill entries (`{userSkills}/<name>/SKILL.md`) keep their dests — Claude Code's loader requires `~/.claude/skills/`. Only the seven non-skill entries move.

### STEP 2.5 — cairn-version marker

The marker is written by `adopt.md` Step 6 (per current HEAD) at `{projectClaude}/cairn-version`. Phase 3 will move that write to `{projectRoot}/agents/cairn-version`.

**CHECKPOINT 2**

```bash
node -e "const m = JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('version:', m.version); console.log('userMemory present:', 'userMemory' in m.pathVariables); console.log('agents/ dests:', m.files.filter(f => f.dest.includes('agents/')).length);"
# expect:
# version: 0.14.0
# userMemory present: false
# agents/ dests: 7
```

If counts diverge, reconcile against `git show 345241a:manifest.json` (the prototype) plus this spec's STEP 2.3 (the CLAUDE.md addition not in the prototype).

## Phase 3 — adopt.md install-method shift (the new design)

Goal: restructure `adopt.md` so the agent never writes `<project>/CLAUDE.md` from external content. The agent fetches the manifest (read-only), fetches each file's content (in memory or to `<project>/agents/*`), then **prompts the user to add a one-line import** to `<project>/CLAUDE.md` themselves. This is the substantive new design beyond the prototype.

### STEP 3.1 — Drop `<project>/CLAUDE.md` from agent-written files in adopt.md

Current `adopt.md` Step 4 ("Preview the plan") shows `<project>/CLAUDE.md` as the first ESSENTIAL line. Step 5 ("Install") then writes it via curl. Both must change.

In `adopt.md` Step 4, the install preview groups files by role. Move the `<project>/CLAUDE.md` line out of the file-write list and into a new "User-action follow-up" sub-section. Replace it in the ESSENTIAL list with the new `<project>/agents/CLAUDE.md` line.

CURRENT preview header (representative):
```
ESSENTIAL — load-bearing from day one (seed tier):
  <project>/CLAUDE.md                        — project context (read every session)
  <project>/agents/memory/MEMORY.md          — memory lookup entry point (git-tracked)
```

REPLACEMENT:
```
ESSENTIAL — load-bearing from day one (seed tier):
  <project>/agents/CLAUDE.md                 — cairn-shaped CLAUDE.md sections (imported by user)
  <project>/agents/memory/MEMORY.md          — memory lookup entry point (git-tracked)
```

WHY: the agent owns `<project>/agents/*`; the user owns `<project>/CLAUDE.md`. Clean ownership boundary. The user-action that bridges them is moved to its own step (3.2 below).

### STEP 3.2 — Add Step 7 ("User-action: add the cairn import line") to adopt.md

After Step 6 ("Write the cairn-version marker"), insert:

```markdown
### Step 7 — User-action: add the cairn import line

Cairn no longer writes to `<project>/CLAUDE.md`. The install is complete; one
last step is yours, not the agent's.

**If `<project>/CLAUDE.md` already exists:** add this line to the bottom (or
wherever your project structure puts third-party imports):

    @./agents/CLAUDE.md

**If `<project>/CLAUDE.md` does not exist:** create it with that single line
plus your project's own context (name, what it is, hard rules pointer, etc.
— see `agents/CLAUDE.md` for the cairn-shipped sections).

The agent will not run this command for you. The new sandbox treats
external-content writes to `CLAUDE.md` (and other `.claude/*` config paths)
as agent-config self-modification and may deny them inconsistently. Removing
the agent's role from this write surface eliminates the failure mode entirely.
Your edit isn't agent-self-modification — it's you setting up your own agent
context, the same way you'd add an import to any config file.

The agent SHOULD show you the exact line to paste. The agent should NOT use
`Write` or `Edit` to add it for you, even if the sandbox would allow it on
your specific machine — uniformity matters more than convenience.
```

WHY (for executor): the new sandbox's CLAUDE.md-write rule is content-pattern + path heuristic, fired inconsistently. Even on machines where the write would succeed today, taking the dependency makes the install fragile across the user fleet. Better to bake user-action into the flow uniformly.

### STEP 3.3 — Update adopt.md Step 5 ("Install") loop

Two small adjustments:

(a) Remove the `<project>/CLAUDE.md` curl + Write from the install loop. It's no longer in the manifest's `files` array (per Phase 2.3, replaced by `<project>/agents/CLAUDE.md`).

(b) Add an end-of-step instruction: *"After the install loop completes, do NOT proceed to write `<project>/CLAUDE.md`. Instead, advance to Step 7 and present the user-action."*

### STEP 3.4 — Update adopt.md Step 6 ("Write the cairn-version marker")

CURRENT: marker written at `{projectClaude}/cairn-version`.

REPLACEMENT: marker written at `{projectRoot}/agents/cairn-version`.

WHY: matches the namespace shift. The fast-path check in Step 2 (re-adoption fast-path) reads from the same path; update it too.

**CHECKPOINT 3**

Walk `adopt.md` from Step 1 to the (new) Step 7 and verify:

```bash
grep -c 'projectRoot}/CLAUDE\.md' adopt.md             # expect: 0
grep -c 'projectClaude}/LAWS\.md' adopt.md             # expect: 0
grep -c 'projectClaude}/cairn-version' adopt.md        # expect: 0
grep -c 'projectRoot}/agents/' adopt.md                # expect: ≥5
grep -c '@./agents/CLAUDE.md' adopt.md                 # expect: ≥1 (Step 7)
```

If any expect-0 grep returns non-zero, that location is stale prose still pointing at the old layout. Fix in place.

## Phase 4 — Skill body updates (apply prototype)

Goal: update `resume`, `reflect`, `note` skill bodies to probe `agents/memory/` instead of slug paths. The prototype already did this; apply directly.

### STEP 4.1 — Cherry-apply prototype skill diffs

```bash
git show 345241a -- files/skills/resume/SKILL.md  | git apply --3way
git show 345241a -- files/skills/reflect/SKILL.md | git apply --3way
git show 345241a -- files/skills/note/SKILL.md    | git apply --3way
```

If any `--3way` apply fails (because the current files have diverged from the prototype's pre-image), the prototype's intent is:

- **`resume`**: drop the slug-policy probe; new probe is `<project>/agents/memory/MEMORY.md` + `git log --oneline -20 -- agents/memory/` for recent activity.
- **`reflect`**: update the references to `files/memory/project/README.md` → `files/agents/memory/project/README.md`.
- **`note`**: rewrite the "Filing destination" table — both `/note` and cross-session memory now write to the project repo; the distinction is *shape* (single-paragraph file-bound observation vs. typed entries that shape future reasoning) not *destination*.

Reconcile manually if conflicts; the prototype's full diff for these files is at `git show 345241a -- files/skills/{resume,reflect,note}/`.

**CHECKPOINT 4**

```bash
grep -l '~/.claude/projects' files/skills/{resume,reflect,note}/SKILL.md   # expect: empty
grep -l 'agents/memory' files/skills/{resume,reflect,note}/SKILL.md        # expect: all three
```

## Phase 5 — Documentation updates (apply prototype)

Goal: prose in `README.md`, `HANDOFF.md`, root `LAWS.md`, `files/agents/memory/MEMORY.md`, `files/agents/memory/project/README.md` reflects the new layout. Mostly already done in the prototype.

### STEP 5.1 — Apply prototype prose diffs

```bash
git show 345241a -- README.md                            | git apply --3way
git show 345241a -- HANDOFF.md                           | git apply --3way
git show 345241a -- LAWS.md                              | git apply --3way
git show 345241a -- files/memory/MEMORY.md               | git apply --3way   # path was old; reconcile
git show 345241a -- files/memory/project/README.md       | git apply --3way   # path was old; reconcile
```

The last two paths are pre-Phase-1; after Phase 1, the files are at `files/agents/memory/...`. If the apply fails on path, hand-port the diff to the new location.

### STEP 5.2 — Update files/agents/CLAUDE.md hard-rules ref

CURRENT (in the file moved by Phase 1.3, line ~38):
```markdown
See [LAWS.md](.claude/LAWS.md) for the non-negotiable rules for this effort.
```

REPLACEMENT:
```markdown
See [LAWS.md](agents/LAWS.md) for the non-negotiable rules for this effort.
```

WHY: matches the new layout; the user's `<project>/CLAUDE.md` imports `agents/CLAUDE.md`, so the relative reference resolves correctly when read from the project root.

### STEP 5.3 — Update files/agents/CLAUDE.md "Notes vs cross-session memory" section

Per the prototype (`git show 345241a -- files/CLAUDE.md`):

CURRENT:
```markdown
- **Cross-session memory** writes to `~/.claude/memory/` in *user-space*. Not in version
  control, not visible to cloners, agent-only. […]

When in doubt, prefer `/note` — repo-visible recovers cheaply; user-space-buried doesn't.
```

REPLACEMENT:
```markdown
- **Cross-session memory** writes to `agents/memory/` in *this repo* (typed: `user/`,
  `feedback/`, `project/`, `reference/`). Git-tracked, visible to anyone who clones,
  agent-readable across sessions. […] Cross-machine sync comes free with `git push`/`git pull`.

Both destinations are repo-tracked. The distinction is *file-bound observation*
(`/note`) vs *facts that shape future reasoning* (memory).
```

**CHECKPOINT 5**

```bash
grep -rn '\.claude/LAWS\|\.claude/memory\|userMemory\|projectClaude}/LAWS\|~/.claude/memory' \
    files/ README.md HANDOFF.md adopt.md manifest.json
# expect: empty (no stragglers reference the retired structure)
```

If matches, fix each in place — drift here means agents will load stale guidance.

## Phase 6 — Migration helper for v0.13.x adopters

Goal: re-adoption from v0.13.x to v0.14.0 cleanly migrates accumulated content without data loss.

### STEP 6.1 — Add migration section to adopt.md

In `adopt.md`, after Step 7, add:

```markdown
## Migration — v0.13.x → v0.14.0

Adopters with an existing v0.13.x install will have:

- `<project>/.claude/LAWS.md`            — project laws (now at `<project>/agents/LAWS.md`)
- `<project>/.claude/cairn-version`      — version marker (now at `<project>/agents/cairn-version`)
- `~/.claude/memory/<slug>/MEMORY.md`     — memory index (now at `<project>/agents/memory/MEMORY.md`)
- `~/.claude/memory/<slug>/{user,feedback,project,reference}/*.md` — typed entries (now at `<project>/agents/memory/<type>/*.md`)

The agent **does not move these for you** (same reasoning as Step 7 — uniform
ownership boundary). Run these commands yourself, after re-adoption installs the
v0.14.0 templates:

\`\`\`bash
# From <project> root.
SLUG="<your-project-slug>"   # e.g. C--Users-winno-projects-foo

# Laws — preserve your customizations, drop the template if cairn already
# wrote one to agents/LAWS.md.
mv .claude/LAWS.md agents/LAWS.md.user-laws-v013
# Inspect both, manually merge the diff into agents/LAWS.md, then:
# rm agents/LAWS.md.user-laws-v013

# Memory — bulk-copy the typed entries (skip MEMORY.md if cairn re-wrote it):
for type in user feedback project reference; do
  cp -n ~/.claude/memory/$SLUG/$type/*.md agents/memory/$type/ 2>/dev/null || true
done

# MEMORY.md (your index) — same merge story as LAWS.md.
cp -n ~/.claude/memory/$SLUG/MEMORY.md agents/memory/MEMORY.md.user-index-v013
# Inspect both, merge entries into agents/memory/MEMORY.md.

# When confident:
# rm -rf .claude/LAWS.md ~/.claude/memory/$SLUG/
\`\`\`

The skill files at `~/.claude/skills/` need no migration — they stay at
user-global per the v0.14.0 design.
```

### STEP 6.2 — Optional: shipped migration script

Add `scripts/migrate-v0.13-to-v0.14.sh` as an opt-in, idempotent, dry-run-by-default helper. Out of scope for the minimum spec; flag as a v0.14.x ergonomic follow-up if not done at ship.

**CHECKPOINT 6**

Smoke-test the migration text against a fixture v0.13.x install (or against the maintainer's own — whoever's iterating the spec):

```bash
# From a project that has both .claude/LAWS.md and ~/.claude/memory/<slug>/
# Walk the migration steps mentally and confirm:
# - All paths in the migration text are correct.
# - No step writes from external content (only `mv`, `cp` of files already on disk).
# - The user is the actor; the agent only displays the steps.
```

## Post-flight

```bash
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))"   # JSON valid
git status                                                                  # changes look right
git diff HEAD                                                               # final review
```

Commit message:

```
feat: v0.14.0 — agents/ umbrella + no-agent-writes-to-CLAUDE.md

Memory + laws + cairn-version + cairn-shaped CLAUDE.md sections move out of
vendor namespaces (.claude/, ~/.claude/memory/) into a cairn-controlled
agents/ directory at the project root. Skill files stay at ~/.claude/skills/
(loader requirement).

Beyond the parked prototype 345241a: the agent no longer writes to
<project>/CLAUDE.md from external content. The user adds the @./agents/CLAUDE.md
import line manually. Forced by the 2026-05 sandbox restriction on
agent-config writes that combine curl-fetched external content with config
paths — the rule fires inconsistently across machines, so taking the
dependency makes adoption fragile.

Migration: re-adopters move <project>/.claude/LAWS.md → agents/LAWS.md and
~/.claude/memory/<slug>/* → agents/memory/* manually. Skills unchanged.

Co-Authored-By: <author-and-model>
```

After ship verified:

```bash
git mv docs/specs/SPEC_AGENTS_UMBRELLA.md docs/specs/archive/SPEC_AGENTS_UMBRELLA.md
```

## Executor handoff

**Critical files to read first:**

1. **The promoted note** — [docs/notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md](../notes/_promoted/NOTE_AGENTS_UMBRELLA_2026-04-30.md). Design intent for the path shift.
2. **The prototype commit** — `git show 345241a`. 80% of phases 1-5 are already specified there as code; this spec extends it.
3. **`manifest.json`** — the canonical destination map.
4. **`adopt.md` (current)** — the install flow you're rewriting in Phase 3.

**Key constraint (do not violate):** zero agent writes to `<project>/CLAUDE.md` or any `<project>/.claude/*` path. If any phase asks the agent to write there, that phase has the wrong shape — re-read Phase 3.

**Common failure modes & recovery:**

- *Skipping STEP 1.3 (move `files/CLAUDE.md` → `files/agents/CLAUDE.md`)* because the prototype kept the old path. The prototype's install model was different; this spec changes ownership of `<project>/CLAUDE.md` from agent to user, and the source file moves accordingly.
- *Forgetting STEP 2.2 (drop `userMemory` from `pathVariables`)* leaves a stale variable that future installs may silently reference. Recovery: re-read STEP 2.2 and delete the entry.
- *Applying prototype prose diffs in Phase 5 against post-Phase-1 paths*. The prototype's `files/memory/...` paths are at `files/agents/memory/...` after Phase 1. If `git apply --3way` fails on path, hand-port the diff content.
- *Treating Phase 6 migration as agent-driven*. It is **not**. The migration text instructs the user; the agent shows it but doesn't run it. Same reasoning as Phase 3's user-action requirement.

**Pre-existing branch state.** The prototype's branch (`claude/pedantic-benz-a31080`) was deleted during the v0.13.1 cleanup; the commit (`345241a`) remains reachable as a dangling commit. Treat it as read-only reference — do **not** try to check out the branch.

**Tree-state caveat.** At spec-write time the cairn project root may live under `<repo>/cairn/` in a meta-monorepo restructure (sibling to `cairn-mcp-server/`, `cairn-sessions/`). All paths in this spec are relative to the cairn project root — `cd cairn/` first if applicable.

## Review checklist

- [ ] `manifest.json` validates as JSON; `version: "0.14.0"`.
- [ ] `userMemory` is gone from `manifest.json` `pathVariables`.
- [ ] No file in `files/` references `~/.claude/memory`, `.claude/LAWS.md`, or `userMemory`.
- [ ] `adopt.md` Step 7 is present and explicit about the `@./agents/CLAUDE.md` import line being a user-action.
- [ ] `<project>/CLAUDE.md` is *never* a write target in `manifest.json` or in `adopt.md`.
- [ ] `files/agents/CLAUDE.md` exists (renamed from `files/CLAUDE.md`).
- [ ] Migration section in `adopt.md` covers v0.13.x → v0.14.0 paths and is user-driven.
- [ ] Skill bodies (`resume`, `reflect`, `note`) reference `agents/memory/`; no slug-path stragglers.
- [ ] `README.md`, `HANDOFF.md`, root `LAWS.md` reflect v0.14.0 layout.
- [ ] Pre-flight commands run cleanly on a v0.13.x fixture.
- [ ] Post-flight grep (`grep -rn '\.claude/LAWS\|\.claude/memory\|userMemory'`) returns empty across the install surface.

## Known open questions (defer or revisit at release-readiness)

1. **Cross-cutting feedback that genuinely applies across projects** (collaboration style, agent-behavior rules) — the maintainer's existing pattern has a cwar slug holding cross-cutting feedback that the cairn slug references. Per-project `agents/memory/` doesn't break that today (the existing slug paths still resolve via HANDOFF.md `## Related memory paths`), but the long-term direction is unclear. Two options: (a) keep slug-pointers as a vestigial sub-system for cross-project memory, (b) introduce a separately git-cloned shared `agents-memory` repo that adopters clone alongside their projects. (b) is cleaner but bigger; defer to v0.15.x.

2. **Plugin packaging** — would consolidate cairn into a single installable artifact and might solve the install-method problem more elegantly than the user-action import line. Per `[MEM project/cairn-blend-strategy-pillars]`, deferred to v0.15.x. Worth re-asking whether the v0.14.0 work is *worth* shipping standalone or is better bundled into v0.15.x's plugin work.

3. **Forked-project memory divergence** — when a v0.14.0 adopter forks their project, do typed-memory entries merge cleanly across forks, or pile up CHANGELOG-style? Defer until first reported instance.

4. **`/prune` authority on shared memory** — when memory is git-tracked and multiple humans collaborate, what's the etiquette for one human pruning another's entries? Defer until first multi-human cairn project.

