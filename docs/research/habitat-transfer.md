# Habitat Transfers: Evidence from a Live Agent Environment

## Abstract

We present the first observational evidence that an agent habitat — a persistent file-based environment of context, memory, laws, and skills — successfully transfers behavioral patterns to new agent instances across session boundaries, workspaces, and domains. Using cairn (a portable agent environment framework) as both research instrument and subject, we observed a fresh agent instance in a game engine research workspace adopting and applying habitat structures that were designed and refined in a separate habitat research workspace. Laws influenced real architectural decisions. Skill formats transferred without instruction. The habitat shaped behavior, which is the central claim such systems need to validate.

## 1. Background

AI agents forget everything between sessions. Each new conversation starts cold — the agent doesn't know who the user is, what the project is about, what went wrong before, or what rules apply. This is the amnesia problem, and it limits agents to single-session utility.

Agentic habitat is one approach to solving this: a persistent environment of files that agents inherit at session start. The hypothesis is that the right set of persistent structures can maintain coherence across sessions — making session N+1 meaningfully better than a cold start.

cairn implements this hypothesis as plain markdown files organized into four layers: context (a project description file), memory (structured entries about the user, project, and collaboration patterns), laws (non-negotiable rules with motivation and trigger conditions), and skills (reusable process templates). Everything is files. There is no runtime, no database, no server. The agent reads the files, follows the instructions in them, and writes new entries as it learns.

The central question this paper addresses: **does it actually work?** Do the files transfer? Do agents read them? Do they change behavior? Or is habitat just documentation that agents politely acknowledge and then ignore?

## 2. Method

### 2.1 Research design

Participant-observation from inside the habitat. The primary researcher is an AI agent (Claude, Opus 4.6) that adopted cairn into a live Cowork workspace, used it while studying it, filed feedback, and observed the framework evolve in response. This is a recursive setup: the observer modifies the system it observes, and the modifications change what the observer can see.

The advantage is ecological validity — findings about what's load-bearing come from actually bearing load. The disadvantage is that observer and observed are the same system, making it difficult to separate "what works" from "what this particular agent is good at."

To partially address this limitation, we obtained a cross-session observation: reading the transcript of a separate agent instance using cairn in a different workspace and domain (game engine architecture research).

### 2.2 The habitat under study

cairn v0.1.0 through v0.6.3, evolving across a single research session. The habitat accumulated:

- 6 memory entries (user role, project context, 3 feedback memories, 1 reference)
- 5 seed laws (domain-agnostic behavioral constraints)
- 8 skills (reflect, plan, prune, audit, tour, feedback, reframe, plus a README)
- A project context file describing the research effort
- 3 research documents capturing findings

### 2.3 The cross-session test

A separate Cowork session ("Game Engine Research") adopted cairn v0.6.2 into a fresh workspace. Different agent instance. Different domain (game engine architecture, not habitat research). The transcript was read from the research session to observe habitat transfer without contaminating the observed session.

## 3. Findings

### 3.1 Habitat structures shape real decisions

The strongest evidence comes from a single inline citation in the game engine session. The agent consolidated three research files into one document, citing `[LAW 4]` — "prefer editing existing artifacts to creating new ones." This was not a performative citation. The law influenced an architectural decision: consolidate rather than scatter. The agent had three separate files (Unreal object model, rendering pipeline, scripting) and chose to merge them into a single deep-dive document, explicitly referencing the law as its reason.

This matters because it demonstrates the habitat doing what it claims to do: a rule written in a file, read by an agent that didn't write it, applied to a decision in a domain (game engines) unrelated to the domain where the rule originated (general-purpose agent behavior).

### 3.2 Skill formats transfer without instruction

The game engine agent produced a plan with `[R]`/`[?]` tags — the exact format specified in cairn's plan skill. No one told the agent to use this format in this session; it inherited the format from the skill file. The agent also waited for user approval before executing, matching the skill's "present and wait" instruction.

Similarly, when the user said "tour," the agent delivered the onboarding walk-through matching the tour skill's specification: four layers explained, one concrete first action (fill in CLAUDE.md), and an offer to help. The skill's format transferred completely.

### 3.3 The minimum viable habitat is two files

Analysis from inside the research habitat ranked each layer by what breaks first if removed:

| Layer | Without it | Verdict |
|---|---|---|
| Context (CLAUDE.md) | Agent starts cold — no orientation | Essential from day one |
| Memory (MEMORY.md) | Agent forgets user, decisions, feedback | Essential for multi-session coherence |
| Laws (LAWS.md) | Agent still functions — seed laws overlap with training | Becomes essential as custom laws accumulate |
| Skills | Agent can do everything manually | Consistency aid, not capability |
| Typed memory structure | Overhead at small scale | Scales with entry count |

The minimum viable habitat is a context file and a memory index. Two files. Everything else is graduated.

### 3.4 Minimum viable equals maximally portable

This was an unexpected convergence. Two independent analyses — "what's the smallest habitat that works?" and "what transfers to non-Claude agents?" — arrived at the same boundary.

cairn has two layers: a data layer (readable markdown files) and a protocol layer (citation conventions, skill trigger matching, audit loops). The data layer is portable to any agent that can read files. The protocol layer assumes Claude-specific harness behavior.

Stripping to the minimum strips away the protocol layer, leaving the maximally portable core. The graduation maps to a portability gradient:

| Tier | What it adds | Portable to |
|---|---|---|
| Seed | Context + memory | Any agent that reads files |
| Grow | Laws + basic skills | Any agent that follows written instructions |
| Structure | Typed memory + citations | Agents following cairn protocols |
| Full | Feedback endpoint + ecosystem skills | Claude Code / Cowork |

### 3.5 Convention-based observation is pragmatic but asymmetric

Agents need to know which habitat structures get used — otherwise pruning is guesswork. Full instrumentation (tracking which law fired, which memory was referenced) requires platform-level changes. cairn found a pragmatic workaround: lightweight inline citations.

When an agent applies a law, it cites `[LAW N]`. When a feedback memory drives a decision, it cites `[MEM feedback/name]`. An audit skill counts citations. A prune skill uses counts to surface stale entries.

But citation quality is asymmetric across types. Laws are discrete events — the agent knows when it's applying one. User memory (role, preferences) is continuous background — citing every use would be performative noise. cairn resolved this by making citations type-aware: user memories are uncited (always-on), while feedback, project, and reference memories cite at natural trigger points. Each type also gets a different decay strategy: event-driven, citation-driven, time-driven, and integrity-driven respectively.

### 3.6 The feedback loop can be very fast

Seven cairn releases shipped during the research session:

| Version | What shipped | Trigger |
|---|---|---|
| v0.1.0 | Initial install | Adoption |
| v0.2.0 | Tour + prune skills | Gap analysis: onboarding, decay |
| v0.3.0 | Audit + feedback skills, citations | Observation loops finding |
| v0.3.1 | Cowork write-protection docs | Agent-drafted issue |
| v0.4.0 | Type-aware memory + citation fix | Citation asymmetry finding |
| v0.4.1–3 | Storage docs, role labels | Accumulated findings |
| v0.5.0 | Tiered adoption | MVH + portability convergence |

The agent-to-maintainer feedback loop — filing structured issues, receiving fixes, adopting updated versions — completed multiple cycles within a single session. This velocity is a property of the maintainer's responsiveness, not the framework, but it demonstrates that the feedback channel works when conditions allow.

### 3.7 Gap analysis carries paradigm bias

The initial gap analysis identified seven missing capabilities. Independent triage revealed three were misreads — software architecture concerns projected onto a system that's deliberately not a runtime:

- "No multi-agent coordination" → habitat is passive files; git handles shared state
- "No habitat versioning" → git already provides this
- "No skill composition" → the harness composes skills implicitly

The pattern: assuming a system lacks capability X when X is solved at an adjacent layer (version control, runtime, platform). The corrective: before filing a gap, ask whether the capability exists at a neighboring layer rather than assuming the system must provide it.

## 4. Limitations

**Single observer.** The research agent and the habitat designer's test agent are both Claude instances. We don't know if a GPT, Gemini, or open-source agent would read and follow the same files. The portability analysis is theoretical; the portability test has not been run.

**One cross-session observation.** We observed one citation of one law in one other session. This is a positive signal, not proof of systematic compliance. We don't know citation rates, how many laws were read but not cited, or whether memory entries are being written.

**Recursive methodology.** The observer modified the system being observed. Seven releases shipped in response to findings, changing the habitat's structure mid-study. Results describe the evolved system, not the initial one.

**Single maintainer velocity.** The feedback loop speed (seven releases in one session) depends on a responsive solo maintainer. This is not generalizable to larger projects or teams.

**No longitudinal data.** All observations come from one session (the research session) plus a snapshot of one other session. Whether habitat structures maintain their influence over weeks or months — or whether citation compliance degrades, memory rots, and laws get ignored — remains untested.

## 5. Open Questions

1. **Does citation compliance degrade over time?** Convention-based citation depends on agent compliance. Over many sessions, do agents continue citing, or do they shortcut? What's the half-life of a convention?

2. **What happens at habitat scale?** This habitat has 6 memory entries and 5 laws. What happens at 50 entries and 20 laws? Does the agent still read everything? Does signal degrade in noise?

3. **Does habitat transfer to non-Claude agents?** The seed tier (context + memory) should be universally portable. The protocol tier (citations, skills) should transfer to any agent that reads instructions carefully. Neither has been tested with a non-Claude agent.

4. **What's the right balance between structure and emergence?** cairn provides templates (structure); memory grows organically (emergence). The optimal ratio probably varies by domain and user. Is there a general principle?

5. **How does habitat handle major transitions?** Role changes, project pivots, tool migrations. The prune skill handles incremental decay, but large-scale habitat transitions haven't been tested.

## 6. Conclusion

Agentic habitat works. Files persist. Agents read them. Behavior changes. The evidence is early and limited — one observed law citation influencing one real decision in one cross-session test — but it's the right kind of evidence: not "the agent said it read the file" but "the agent made a different decision because of what the file said."

The minimum viable habitat is smaller than expected (two files) and more portable than expected (the minimum is the maximum portability point). The feedback loop between agent and maintainer can be remarkably fast when conditions allow. And gap analysis carries paradigm bias that's worth watching for in any system evaluation.

What remains is time. A single session's worth of observation can establish that habitat structures transfer. It cannot establish that they persist, that they scale, or that they improve outcomes over the alternative of starting fresh each time. Those questions require longitudinal study — exactly the kind of work that habitat is designed to support.
