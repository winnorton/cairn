# Laws — cairn

Non-negotiable rules for developing cairn itself. Violating one will break the project
or the workflow.

This file is cairn's own LAWS, distinct from `files/LAWS.md` (which is the *template*
shipped to adopters). It was added in v0.9.1 after the maintainer observed that cairn
shipped a LAWS.md template for others without having one itself — the framework wasn't
eating its own dog food.

Cite by slug in durable output: `[LAW load-meta-laws]`, `[LAW scope-explicit]`, etc.
The slug is each law's only identity — no numbers, no positional references.

---

## How to write a law

Every law in this file follows the same shape:

```
### <Rule> *(slug: <short-slug>)*

**Why:** <motivation — often a past incident or constraint>

**How to apply:** <when the rule kicks in>
```

The five meta-rules from `files/LAWS.md` apply here too: observable not vibes, slug-is-
identity, Why + How to apply mandatory, laws expire, cite in durable output.

---

## Cairn's development laws (9)

### Load the project's meta-laws before making architectural decisions *(slug: load-meta-laws)*

**Why:** When an agent enters an AI-agent-engineering project, that project's
meta-discipline documents (laws-of-*.md, PRINCIPLES.md, NEW_LAWS_OF_*.md, or equivalents)
are *load-bearing context*, not reference material. Skipping them and building from
scratch is how the Amnesia Tax (NEW_LAWS law 3) gets paid at full cost. Cairn's own
v0.1–v0.6 development is the evidence: four of seven NEW_LAWS were violated because
the agent (me) didn't read `docs/NEW_LAWS_OF_AI_AGENT_ENGINEERING.md` until law 4 of
cairn's own LAWS.md had already been shipped.

**How to apply:** At session start, before touching architecture:
1. Search the project for files matching `*LAWS*`, `*PRINCIPLES*`, `docs/*engineering*`,
   `docs/*AGENT*`, or `AGENTS.md`.
2. Read every such file. Note which laws/principles could apply to the current work.
3. If no such document exists in a project that looks like agent-infrastructure, flag
   that absence explicitly — propose creating one or confirm it's intentional.

### Name scope expansion explicitly at decision points *(slug: scope-explicit)*

**Why:** Cairn expanded from "export a bootstrap" to "multi-release framework with
typed memory, tiers, slugs, collaboration skills, feedback endpoint, etc." over a
single session. Each expansion had user consent but none were named as scope
expansions at the moment they happened. The Scope Ratchet (NEW_LAWS law 5) fires
whether or not the human notices — naming it surfaces it for deliberate choice.

**How to apply:** Before a version that adds a new conceptual dimension (not just a
bug fix or small feature), explicitly name what scope is expanding and ask "is this
still within the current effort, or is this a new effort?" Example prompt: *"This
would add Y as a new concept cairn addresses — stay in scope or fork?"*

### Cite in the commit message, not just in the code *(slug: commit-cite)*

**Why:** The cite-in-durable-output meta-rule says citations must reach files — but files
are often workspace-local. Commit messages ARE durable output that travels with the
code. Citing laws/memories/issues in the commit message means the citation survives
even if the work is copied, submoduled, or inherited into another habitat.

**How to apply:** When a commit implements a law's directive or responds to a
memory's guidance, cite the source in the commit message body, not just inline in
code comments. Example: *"(per [LAW cadence]: reflect at natural checkpoints)"* in
the commit body.

### When a pattern you want already exists in an adjacent part of your system, borrow it *(slug: borrow-adjacent)*

**Why:** Memories used slugs; laws used numbers. Inconsistency primed drift. Fixing
it took five minutes once spotted — but spotting it required the active move of
asking *"does something in this system already solve this?"* Not every problem
needs a from-scratch solution. The v0.9 slug migration is the canonical case.

**How to apply:** When designing a new convention (identity, citation, trigger,
format), check whether an adjacent part of your system already established a
pattern for it. Prefer consistency unless there's a specific reason to diverge.

### Reflect before the session boundary, not after *(slug: session-end-reflect)*

**Why:** The whole point of a habitat is cross-session coherence. If the reflection
fires *after* the session ends (e.g., the user comes back and asks "what happened
last time?"), the signal is lost. Reflection must complete while the agent is still
in-context, while the nuance is still retrievable.

**How to apply:** When the user signals an impending session boundary ("let's wrap
up", "move to the next session", "come back here for analysis"), stop accepting new
work and invoke `/reflect`. Produce memory candidates, law candidates, and a
HANDOFF.md before the boundary — not after.

### Update HANDOFF.md before tagging a release *(slug: handoff-stays-current)*

**Why:** HANDOFF.md is the bridge document the next session reads. If it drifts
behind the actual release, it actively misleads — telling the next agent "we're at
v0.9.1" when main is on v0.10.0. The first `/resume` validation surfaced this
exact drift: HANDOFF.md said v0.9.1 minutes after v0.10.0 shipped because the
release commit didn't update it. The bridge document rotted faster than the
bridge.

**How to apply:** Before any `git tag -a vX.Y.Z` on cairn (or any project where
HANDOFF.md is canonical), verify HANDOFF.md reflects the version about to ship.
Specifically check: the version line, the "State at end of session" section, and
any "open work" entries that may now be closed. Bundle the HANDOFF.md update into
the same commit as the release artifacts (VERSION, manifest version, README
status). One commit, one consistent view.

### Choose memory slug by content scope, not session location *(slug: choose-slug-by-scope)*

**Why:** Memory's slug determines which sessions can load it. Naive "write where
the session is running" works for single-project setups but fragments across
projects in multi-project workflows. The cairn build session's habit of writing
all memory to cwar's slug (because that's where the session was running) made
everything invisible to subsequent cairn-side sessions until the v0.10.1
cross-project pointer landed and the v0.10.2 migration moved cairn-native entries
to cairn's own slug. The slug should match the SCOPE of what's being remembered,
not the SESSION's cwd. Otherwise you build up debt that has to be paid in
migration work later.

**How to apply:** Before writing memory, ask:
1. Is this fact specific to one project's state? → write at that project's slug.
2. Is this cross-cutting agent-meta-knowledge that applies across all projects?
   → pick one slug (usually where the insight first emerged) and declare a
   pointer in `HANDOFF.md`'s `## Related memory paths` so others find it.
3. Is this genuinely worktree-scoped? → only when necessary; usually the parent
   project's slug is correct.

Avoid duplicating across slugs. When uncertain, default to the project where the
work artifact is being produced.

### Survey available tools by verb in their description, not by name prefix *(slug: survey-tools-by-verb)*

**Why:** Agents underestimate the applicability of tools whose names carry a
project prefix that doesn't match the current task. A tool named
`cwar_browser_eval` works on any browser the agent can reach — the prefix is a
registration detail, not a scope constraint. But agents read the prefix as
scope and filter the tool out as "off-topic," reaching for universal-but-slower
alternatives instead. Observed empirically on 2026-04-25: an Antigravity Opus
session debugging a cwar Worker migration burned roughly an hour of human
wall-clock time on a screenshot-paste loop with the human when
`cwar_browser_eval` was registered in the same MCP and would have read the
same data in ~3 seconds per call without human involvement. The bias is
invisible because the agent doesn't notice the tools they didn't reach for;
the wall-clock cost is paid in a dimension the agent can't see.

**How to apply:** At the start of any task that involves a verb the current
toolset might support (read, eval, screenshot, click, search, audit, inspect,
trace):
1. List available tools by **verb-in-description**, not by name prefix. Treat
   the prefix as a label, not a gate.
2. When wall-clock cost spikes during a task (manual screenshots, repeated
   greps, sub-agent browser orchestration), re-survey — the cost itself is
   the signal that a faster tool was probably skipped.
3. If a general-purpose tool sits under another project's namespace, surface
   that as a finding — consider proposing it be aliased at a more universal
   name, or document its cross-project applicability in its description.

Companion to cwar's NEW_LAWS Law 13 (Serialization Boundary), which captures
the technical-content layer of the same episode. This law captures the
process-meta layer.

### Route release-shaped PRs through `/peer-review` by a fresh-perspective agent before merge *(slug: pre-merge-review)*

**Why:** Single-pass review by the work-author re-confirms the author's mental
model rather than challenging it. The author looks where they expect problems —
the files they touched. The blind-spot class lives in *adjacent unchanged files*
the author didn't touch this session. v0.12.x produced the canonical evidence:
five separate misses across four releases, every one in the adjacent-files
class, every one caught only by a fresh `/peer-review` session. v0.12.0/.1 missed
adopt.md install-template version strings (user caught), v0.12.1 missed
`/spec`'s docs propagation, `/peer-review`'s own cwar coupling, the cairn-slug
MEMORY.md index entry, and the plan-archival step (fresh `/peer-review` caught all
four). The same release that introduced `/peer-review` shipped with the exact
gap-class `/peer-review` is meant to catch — five times. The law forces the gate
the skill alone doesn't enforce.

**How to apply:** Before merging any PR on cairn that ships a release version
(`feat: vX.Y.Z`, `fix: vX.Y.Z`) or touches multiple user-facing files
(`README.md` + `adopt.md` + `manifest.json` together; or any 3+ files):

1. Open the PR.
2. Spawn a **fresh agent session** — different session, no shared context with
   the PR's author. The fresh agent must not have been in the build.
3. Have the fresh agent invoke `/peer-review` against the PR (the skill's anti-trigger
   prevents author-self-review; that's the point).
4. Address findings before merge, or document why they're deferred.
5. Merge only after the chain completes.

This is for cairn's *own* dev discipline, not for adopters' habits. (Adopters
ship `/peer-review` as a skill they invoke ad-hoc; cairn's release process treats it
as mandatory.) If the law fires often enough that compliance becomes routine,
escalate to a mechanical gate per `[MEM cwar feedback/escalate-rule-to-mechanical-gate]`
— a pre-merge hook that checks for a `/peer-review`-shaped citation in the PR body
or the most recent commit message before allowing merge.

---

## Your laws

<!--
  Add more cairn-development laws below as they emerge. Assign a slug per law.
  Slug is identity; don't number.
-->
