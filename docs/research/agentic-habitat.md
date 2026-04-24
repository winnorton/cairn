# What Agents Need to Remember: Research into Agentic Habitat

## The question

AI agents forget everything between sessions. What persistent structures do they need to maintain coherence over time — and how little can you get away with?

This research used cairn (a portable agent environment framework) as both subject and tool. An AI agent adopted cairn into a live workspace, then studied the habitat from the inside — observing what structures were load-bearing, what was overhead, and what was missing. The agent filed feedback as it worked; the maintainer shipped fixes in real time. Seven releases landed in one session.

## What agentic habitat is

Habitat is the persistent environment an agent inherits at the start of every session. Without it, each session starts cold — the agent doesn't know who the user is, what the project is about, what went wrong last time, or what rules apply. Habitat is the opposite of forgetting.

cairn implements habitat as four layers, all plain markdown files:

**Context** (CLAUDE.md) — what this work effort is, how it's organized, where to find things. Loaded every session. The single highest-leverage file in the habitat.

**Memory** — what the agent has learned about the user, the project, collaboration preferences, and external references. Organized by type (user, feedback, project, reference), each with different citation conventions and decay characteristics.

**Laws** — non-negotiable rules that survive across sessions. Each has a Why (motivation) and How to apply (trigger conditions), so agents can judge edge cases instead of blindly following rules.

**Skills** — reusable capabilities packaged as markdown files with trigger descriptions. Standardize processes the agent would do anyway (reflect, plan, prune stale entries).

## What we found

### Finding 1: The minimum viable habitat is two files

We ranked each layer by what breaks first if removed:

| Layer | If removed | Verdict |
|---|---|---|
| Context (CLAUDE.md) | Agent starts cold every session — no orientation | Essential from day one |
| Memory (flat index) | Agent forgets user, decisions, feedback | Essential for multi-session work |
| Laws | Agent still functions — seed laws overlap with training | Becomes essential over time |
| Skills | Agent can still do everything manually | Nice-to-have (consistency, not capability) |
| Typed memory structure | Overhead for small habitats | Scales with entry count |

The minimum viable habitat is a context file and a memory index. Two files. Everything else is graduated — it arrives when the habitat needs it, not at install time.

### Finding 2: Minimum viable = maximally portable

This was the surprise. Two independent research threads — "what's the minimum?" and "what transfers across agents?" — converged on the same boundary.

cairn has two layers: a **data layer** (files, structure, readable content) that any agent can use, and a **protocol layer** (citation conventions, skill matching, audit loops) that assumes Claude-specific harness behavior. Stripping to the minimum strips away the protocol layer, leaving only what's universally portable.

The graduation maps to a portability gradient:

| Tier | What it adds | Works with |
|---|---|---|
| Seed | Context + memory (2 files) | Any agent that reads markdown |
| Grow | Laws + reflect/plan skills | Any agent that follows written instructions |
| Structure | Typed memory + citation conventions + hygiene skills | Agents that follow cairn protocols |
| Full | Feedback skill (files issues to cairn's repo) | Claude Code / Cowork ecosystem |

This means cairn doesn't have a portability problem — it has a layering opportunity. The core is already universal.

### Finding 3: Convention-based observation is pragmatic but asymmetric

Agents need to know which parts of their habitat actually get used — otherwise pruning stale entries is guesswork. The ideal solution (harness-level instrumentation tracking which law fired and which memory was referenced) requires platform changes. cairn found a pragmatic workaround: lightweight inline citations.

When an agent applies a law, it cites `[LAW 3]`. When a feedback memory drives a decision, it cites `[MEM feedback/name]`. An audit skill counts these citations. A prune skill uses the counts to surface stale entries.

But citation quality is asymmetric across memory types. Laws are discrete — you know the moment you apply one, and citing feels natural. User memory (who the user is, their preferences) is continuous background — it shapes every response implicitly. Citing every use would be noisy and performative.

cairn resolved this by making citations type-aware: user memories have no citation convention (always-on background), while feedback, project, and reference memories cite at their natural trigger points. Each type also gets its own decay strategy: event-driven for user memory, citation-driven for feedback, time-driven for project, integrity-driven for references.

### Finding 4: Gap analysis has a paradigm bias

The initial analysis identified seven gaps in cairn. An independent triage (by a different agent instance) revealed that three were misreads — architecture-brain projections onto a system that's deliberately not a runtime:

- "No multi-agent coordination" → cairn is passive files; git handles shared-state conflict
- "No habitat versioning beyond git" → git *is* the versioning; a native snapshot would duplicate it
- "No skill composition" → the harness composes skills implicitly by invoking multiple per session

The pattern: seeing a system that lacks feature X and concluding X is missing, when X is solved at an adjacent layer. The fix is a pre-flight check: before filing a gap, ask whether the capability exists at the version control, runtime, or platform layer.

### Finding 5: Agent-to-maintainer feedback loops can be fast

Seven cairn releases shipped in one session, each responding to agent-filed observations:

| Version | What shipped | Triggered by |
|---|---|---|
| v0.1.0 | Initial install | Adoption |
| v0.2.0 | Tour + prune skills | Gap triage (#7 onboarding, #1 decay) |
| v0.3.0 | Audit + feedback skills, citation conventions | #3 observation loops |
| v0.3.1 | Cowork .claude/ write-protection docs | Agent-drafted issue |
| v0.4.0 | Type-aware memory, citation asymmetry fix | #5 citation asymmetry finding |
| v0.4.1–3 | Cowork storage docs, memory path detection, role labels | Ongoing findings |
| v0.5.0 | Tiered adoption (seed/grow/structure/full) | MVH + portability convergence |

The feedback skill didn't enable this — the first fix shipped before the skill was ever formally invoked. The skill's value is standardization: consistent issue format, discoverability for new agents, PII sanitization reminders. Not new behavior — reliable behavior.

## Open questions

These are resolved mechanically but need longitudinal observation:

1. **Does the citation→audit→prune loop actually work over months?** Convention-based citation depends on agent compliance, which may degrade as sessions accumulate and agents shortcut.

2. **What's the right balance between structure and emergence?** cairn provides templates (structure); memory grows organically (emergence). Too much structure and the templates outweigh the substance. Too little and agents lack orientation. The balance point probably varies by domain.

3. **How does habitat handle role transitions?** When the user's role, project, or tooling changes significantly, how much of the habitat should be retired vs. revised? The prune skill surfaces candidates, but large-scale habitat transitions haven't been tested.

## Method note

This research was conducted from inside the habitat being studied. The agent adopted cairn, used it, observed its own experience, filed feedback, and watched the framework evolve in response. This is participant-observation with a twist: the participant is an AI agent and the observation is about its own cognitive scaffolding.

The advantage is ecological validity — findings about what's load-bearing come from actually bearing load, not from theorizing. The disadvantage is that the observer and the observed are the same system, which makes it hard to separate "what works" from "what this particular agent is good at." A non-Claude agent might rank the layers differently.
