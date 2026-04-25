# Laws — cairn

Non-negotiable rules for developing cairn itself. Violating one will break the project
or the workflow.

This file is cairn's own LAWS, distinct from `files/LAWS.md` (which is the *template*
shipped to adopters). It was added in v0.9.1 after the maintainer observed that cairn
shipped a LAWS.md template for others without having one itself — the framework wasn't
eating its own dog food.

Cite by slug in durable output: `[LAW plan-meta]`, `[LAW scope-explicit]`, etc. Numbers
are display-order only.

---

## How to write a law

Every law in this file follows the same shape:

```
### N. <Rule> *(slug: <short-slug>)*

**Why:** <motivation — often a past incident or constraint>

**How to apply:** <when the rule kicks in>
```

The five meta-rules from `files/LAWS.md` apply here too: observable not vibes, ranked
by blast radius, Why + How to apply mandatory, laws expire, cite in durable output.

---

## Cairn's development laws

### 1. Load the project's meta-laws before making architectural decisions *(slug: load-meta-laws)*

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

### 2. Name scope expansion explicitly at decision points *(slug: scope-explicit)*

**Why:** Cairn expanded from "export a bootstrap" to "multi-release framework with
typed memory, tiers, slugs, collaboration skills, feedback endpoint, etc." over a
single session. Each expansion had user consent but none were named as scope
expansions at the moment they happened. The Scope Ratchet (NEW_LAWS law 5) fires
whether or not the human notices — naming it surfaces it for deliberate choice.

**How to apply:** Before a version that adds a new conceptual dimension (not just a
bug fix or small feature), explicitly name what scope is expanding and ask "is this
still within the current effort, or is this a new effort?" Example prompt: *"This
would add Y as a new concept cairn addresses — stay in scope or fork?"*

### 3. Cite in the commit message, not just in the code *(slug: commit-cite)*

**Why:** Law 5 (cite in durable output) says citations must reach files — but files
are often workspace-local. Commit messages ARE durable output that travels with the
code. Citing laws/memories/issues in the commit message means the citation survives
even if the work is copied, submoduled, or inherited into another habitat.

**How to apply:** When a commit implements a law's directive or responds to a
memory's guidance, cite the source in the commit message body, not just inline in
code comments. Example: *"(per [LAW cadence]: reflect at natural checkpoints)"* in
the commit body.

### 4. When a pattern you want already exists in an adjacent part of your system, borrow it *(slug: borrow-adjacent)*

**Why:** Memories used slugs; laws used numbers. Inconsistency primed drift. Fixing
it took five minutes once spotted — but spotting it required the active move of
asking *"does something in this system already solve this?"* Not every problem
needs a from-scratch solution. The v0.9 slug migration is the canonical case.

**How to apply:** When designing a new convention (identity, citation, trigger,
format), check whether an adjacent part of your system already established a
pattern for it. Prefer consistency unless there's a specific reason to diverge.

### 5. Reflect before the session boundary, not after *(slug: session-end-reflect)*

**Why:** The whole point of a habitat is cross-session coherence. If the reflection
fires *after* the session ends (e.g., the user comes back and asks "what happened
last time?"), the signal is lost. Reflection must complete while the agent is still
in-context, while the nuance is still retrievable.

**How to apply:** When the user signals an impending session boundary ("let's wrap
up", "move to the next session", "come back here for analysis"), stop accepting new
work and invoke `/reflect`. Produce memory candidates, law candidates, and a
HANDOFF.md before the boundary — not after.

---

## Your laws

<!--
  Add more cairn-development laws below as they emerge. Assign a slug per law.
  Keep ranked by blast radius.
-->
