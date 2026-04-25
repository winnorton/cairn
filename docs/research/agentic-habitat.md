# What Agents Need to Remember: Research into Agentic Habitat

## The question

AI agents forget everything between sessions. What persistent structures do they need to maintain coherence over time — and how little can you get away with?

This research used cairn (a portable agent environment framework) as both subject and tool. Across a single day, an AI agent adopted cairn, studied the habitat from the inside, filed feedback that drove 25+ releases (v0.1.0 → v0.10.5), and observed the framework transfer to new agents on new platforms — including Google's Gemini Pro 3.1 and Opus. A second agent (in Cowork) served as test consumer and research partner throughout.

Six findings. Each changes something about how agentic habitat should be designed.

## What agentic habitat is

Habitat is the persistent environment an agent inherits at the start of every session. Without it, each session starts cold — the agent doesn't know who the user is, what the project is about, what went wrong last time, or what rules apply. Habitat is the opposite of forgetting.

cairn implements habitat as four layers, all plain markdown files:

**Context** (CLAUDE.md) — what this work effort is, how it's organized, where to find things. Loaded every session. The single highest-leverage file in the habitat.

**Memory** — what the agent has learned about the user, the project, collaboration preferences, and external references. Organized by type (user, feedback, project, reference), each with different citation conventions and decay characteristics.

**Laws** — non-negotiable rules that survive across sessions. Each has a Why (motivation), How to apply (trigger conditions), and a stable slug for citation. Agents cite by slug in durable output; an audit skill counts the citations.

**Skills** — reusable capabilities packaged as markdown files with trigger descriptions. Two categories emerged during the research: *maintenance skills* that service the habitat (reflect, plan, prune, audit) and *collaboration skills* that service the human-agent pair (reframe, bridge, advocate).

## Finding 1: The minimum viable habitat is two files

We ranked each layer by what breaks first if removed:

| Layer | If removed | Verdict |
|---|---|---|
| Context (CLAUDE.md) | Agent starts cold every session — no orientation | Essential from day one |
| Memory (flat index) | Agent forgets user, decisions, feedback | Essential for multi-session work |
| Laws | Agent still functions — seed laws overlap with training | Becomes essential over time |
| Skills | Agent can still do everything manually | Consistency aid, not capability |
| Typed memory structure | Overhead for small habitats | Scales with entry count |

The minimum viable habitat is a context file and a memory index. Two files. Everything else is graduated — it arrives when the habitat needs it, not at install time.

This was also the portability boundary. Two independent research threads — "what's the minimum?" and "what transfers across agents?" — converged on the same answer. cairn has a data layer (files any agent can read) and a protocol layer (citation conventions, skill matching, audit loops). Stripping to the minimum strips away the protocol layer, leaving only what's universally portable.

See: [The Two-File Habitat](research-mvh-portability.md)

## Finding 2: Habitat transfers across sessions, agents, and platforms

The strongest early evidence came from a cross-session test: a fresh agent in a game engine research workspace cited `[LAW 4]` inline — a rule it didn't write, applied to a decision in a domain (game engines) unrelated to the rule's origin. Laws influenced real architectural decisions. Skill formats transferred without instruction.

The evidence became much stronger during cross-platform testing. Gemini Pro 3.1 adopted cairn into Google Antigravity and demonstrated: path variable adaptation (mapped `{userMemory}` → `~/.gemini/antigravity/memory/` without being told how), slug-format law citations (`[LAW plan]`, `[LAW cadence]`), skill compliance (tour, reflect, plan all followed spec), and a `/reflect` output that was specific, quantified, and empirically verified via tool logs.

Opus adopted cairn into cwar-engine and ran `/bridge` incoming — reading distillate files, verifying their claims against actual code via grep before integrating, and producing a plan grounded in verified state. This was the most sophisticated adoption observed.

See: [Habitat Transfers](research-habitat-transfer.md)

## Finding 3: The human is part of the habitat

Analysis of the full build transcript (110+ human messages across two phases) revealed that the human makes systematic, repeatable moves the agent can't make for itself. Eleven interaction patterns were identified; six are formalizable as skills.

The most frequent: **cross-session relay** — the human carrying output between agent sessions, acting as the inter-agent communication layer. ~20 instances across both phases. Others include **reframing** (rotating the agent's solution space), **timing judgment** ("this is a good time for aggressive change, not later"), **user advocacy** (watching other agents and reporting friction), **experimental design** (constructing cross-platform test scenarios), and **bidirectional verification** (arbitrating claims between agents — and sometimes being corrected by them).

These form a second skill category — **collaboration skills** — alongside the existing maintenance skills. Maintenance skills service the habitat. Collaboration skills service the human-agent pair. The maintenance skills were identified by gap analysis (the agent noticing its own needs). The collaboration skills were identified by studying what the human actually does — they required looking at the interaction, not just the files.

The implication: cairn's four file layers aren't the complete picture of habitat. The human is the adaptive layer — the one who rotates the solution space, bridges between sessions, makes timing calls, observes real usage, and sometimes gets corrected by agents with better evidence.

See: [The Human in the Habitat](research-collaboration-skills.md)

## Finding 4: Convention-based observation is pragmatic but asymmetric

Agents need to know which parts of their habitat actually get used — otherwise pruning stale entries is guesswork. cairn found a pragmatic workaround: lightweight inline citations by slug (`[LAW plan]`, `[MEM feedback/name]`). An audit skill counts citations. A prune skill uses the counts.

But citation quality is asymmetric across types. Laws are discrete events — citing feels natural. User memory is continuous background — citing every use would be performative. cairn resolved this by making citations type-aware: user memories have no citation convention (always-on), while feedback, project, and reference memories cite at natural trigger points. Each type gets its own decay strategy.

An early design used number-based citations (`[LAW 1]`). This broke when laws were reordered — numbers shifted, existing citations became wrong. The v0.9.0 switch to slug-based citations (`[LAW plan]`) solved this. Slugs are stable across reorders; numbers are display-order only.

## Finding 5: Agent-to-maintainer feedback loops can be very fast

Twenty-five cairn releases shipped in one day, each responding to agent-filed observations. The loop: agent observes friction → files structured feedback → maintainer ships fix → agent adopts new version → observes new friction. Seven releases landed before the feedback skill was even formally invoked — the first fix shipped from a manually-drafted issue.

The feedback skill's value wasn't enabling the loop — it was standardizing it. Format consistency, discoverability for new agents, PII sanitization reminders. Skills that formalize existing behavior compound faster than skills that try to create new behavior. This principle predicted the collaboration skills finding: the human was already reframing, bridging, and advocating. The skills packaged what was already happening.

See: [Seven Releases in One Session](research-feedback-velocity.md)

## Finding 6: Gap analysis carries paradigm bias

The initial analysis identified seven gaps in cairn. Independent triage revealed three were misreads — architecture-brain projections onto a system that's deliberately not a runtime: "no multi-agent coordination" (habitat is passive files; git handles shared state), "no habitat versioning" (git is the versioning), "no skill composition" (the harness composes skills implicitly).

The pattern: seeing a system that lacks feature X and concluding X is missing, when X is solved at an adjacent layer. The corrective: before filing a gap, ask whether the capability exists at the version control, runtime, or platform layer.

## Open questions

1. **Can the human be removed from the message bus?** The human carried ~20 agent outputs between sessions. That's unsustainable. The distillate/bridge flow is the beginning of an answer, but the human still physically moves files.

2. **Does citation compliance degrade over time?** Convention-based citation depends on agent compliance, which may degrade as sessions accumulate.

3. **What happens when the human is wrong?** The Gemini episode showed the human misremembering and the agent correcting with tool-log evidence. Current skill design assumes human authority. What changes when agents have evidence the human doesn't?

4. **Do collaboration skills transfer as well as maintenance skills?** Early evidence says yes — Gemini used bridge and reflect successfully. But the sample is small.

5. **What happens at habitat scale?** This habitat has ~10 memory entries and 6 laws. What happens at 50 entries and 20 laws?

## Method note

This research was conducted from inside the habitat being studied. Two agents — one in Claude Code (the builder), one in Cowork (the researcher) — adopted cairn, used it, observed their own experience, filed feedback, and watched the framework evolve in response. Cross-platform observations came from reading transcripts of Gemini Pro 3.1 and Opus sessions that adopted cairn independently.

The advantage is ecological validity — findings about what's load-bearing come from actually bearing load. The disadvantage is that the observer and the observed are the same system. The Gemini observations partially address this: a different agent on a different platform produced consistent results.
