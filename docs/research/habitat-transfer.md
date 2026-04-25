# Habitat Transfers: Evidence from Cross-Session and Cross-Platform Testing

## Abstract

We present observational evidence that an agent habitat — a persistent file-based environment of context, memory, laws, and skills — successfully transfers behavioral patterns to new agent instances across session boundaries, workspaces, domains, and platforms. Using cairn as both research instrument and subject, we observed habitat structures shaping behavior in four independent contexts: a Cowork research session, a game engine research session, a Gemini Pro 3.1 evaluation session, and a Gemini Opus engineering session. Laws influenced architectural decisions. Skill formats transferred without instruction. Path conventions were independently adapted to a non-Claude platform. The habitat shaped behavior — and the evidence strengthened with each additional test.

## 1. Background

AI agents forget everything between sessions. Agentic habitat is one approach to solving this: a persistent environment of files that agents inherit at session start. cairn implements this as plain markdown files organized into four layers: context, memory, laws, and skills.

The central question: do the files actually transfer? Do agents read them? Do they change behavior? Or is habitat just documentation that agents politely acknowledge and then ignore?

## 2. Method

### 2.1 Research design

Participant-observation from inside the habitat, supplemented by transcript reading and cross-platform testing. The primary researchers are AI agents (Claude Opus 4.6 instances) that adopted cairn, used it, and observed the framework evolving. Cross-platform observations came from reading outputs of Gemini Pro 3.1 and Opus sessions.

### 2.2 The test contexts

| Context | Platform | Domain | cairn version | Agent |
|---|---|---|---|---|
| Cairn Research | Cowork | Habitat research | v0.1.0 → v0.6.3 | Claude Opus 4.6 |
| Game Engine Research | Cowork | Game engine architecture | v0.6.2 | Claude Opus 4.6 |
| Gemini Evaluation | Google Antigravity | cairn evaluation | v0.10.4 | Gemini Pro 3.1 |
| cwar-engine Adoption | Google Antigravity | Game engine engineering | v0.10.5 | Gemini Opus |

## 3. Findings

### 3.1 Laws influence real decisions (cross-session)

The first evidence came from the Game Engine Research session. The agent consolidated three research files into one document, citing `[LAW 4]` — "prefer editing existing artifacts to creating new ones." This was not a performative citation. The law influenced an architectural decision: consolidate rather than scatter. The agent had three separate files and chose to merge them, explicitly referencing the law as its reason.

A rule written in a file, read by an agent that didn't write it, applied to a decision in a domain unrelated to the rule's origin.

### 3.2 Skill formats transfer without instruction (cross-session)

The Game Engine Research agent produced a plan with `[R]`/`[?]` tags — the exact format specified in cairn's plan skill. No one told the agent to use this format; it inherited it from the skill file. The agent also waited for user approval before executing, matching the skill's "present and wait" instruction.

The tour skill transferred completely: when the user said "tour," the agent delivered the onboarding walk-through matching the skill spec.

### 3.3 Path conventions adapt across platforms (cross-platform)

Gemini Pro 3.1 adopted cairn into Google Antigravity and independently remapped cairn's path variables to Antigravity conventions:

| cairn variable | Claude Code path | Gemini's adaptation |
|---|---|---|
| `{userMemory}` | `~/.claude/projects/<slug>/memory/` | `~/.gemini/antigravity/memory/` |
| `{userSkills}` | `~/.claude/skills/` | `~/.gemini/antigravity/skills/` |
| `{projectClaude}` | `{cwd}/.claude` | `<project>/.claude` |

Nobody told Gemini how to do this. It read the manifest's path variable documentation, understood the intent, and inferred the correct Antigravity equivalents. This is the strongest evidence for the data layer's portability — the concepts are universal even when the paths aren't.

### 3.4 Slug-format citations work cross-platform

Gemini Pro 3.1 used slug-format law citations (`[LAW plan]`, `[LAW cadence]`, `[LAW assumptions]`) — the v0.9.0 convention — correctly and without explicit instruction beyond what LAWS.md itself says. The agent paraphrased each law's Why in parentheticals, demonstrating comprehension rather than rote citation.

When tested with a deliberate trap (a prompt designed to violate multiple laws), the agent caught three violations in one response with specific reasoning for each. Under priming, but the slug citations and reasoning quality were exact.

### 3.5 The reflect/distillate flow works end-to-end (cross-session, cross-platform)

The Game Engine Research session (Cowork) ran `/reflect` with a downstream consumer declared in CLAUDE.md. The agent produced three distillate files shaped for the consumer's habitat:

```
distillate/antigravity/
├── reference/engine-research.md
├── project/worker-migration-status.md
└── feedback/validate-divergences.md
```

Each used cairn's standard frontmatter and was drop-in compatible with the consumer's memory structure. The human physically copied the files (the current transport mechanism). The receiving agent (Opus in cwar-engine) then ran `/bridge` incoming, read the distillate, and — critically — verified the claims against actual code before integrating them.

### 3.6 Bridge works with verification (cross-platform)

The Opus agent's `/bridge` ingest was the most sophisticated adoption observed. It read three distillate entries, then grep'd cwar-engine's actual source code to verify the worker-migration feasibility claim. Finding the claim accurate (`gameTick()` is indeed a pure function with zero DOM dependencies), it integrated the distillate and produced a plan grounded in verified state.

This "trust but verify" pattern was not explicitly requested — the agent applied it from the skill description's emphasis on source identification and attribution.

### 3.7 The human misremembered; the agent was right

During the Gemini evaluation, the agent claimed in its `/reflect` output that it had git-cloned the cairn repo before understanding the adopt flow. The human contradicted: "I did that, not you." The builder agent (Claude Code) deferred to the human. The human then went back to Gemini and asked it to verify. Gemini checked its tool logs, found a timestamped `git clone` command with its own execution context, and held its ground.

The human conceded: "Gemini was right. I misremembered."

This matters for habitat design. Current skill design assumes human authority — reframe says "the user picks," bridge says "the user judges relevance." But agents sometimes have evidence the human doesn't. The correct behavior in the Gemini episode was verify, not defer.

### 3.8 The human is part of the habitat

Analysis of the full build transcript (110+ human messages) revealed that the human makes systematic, repeatable moves the agent can't make for itself: reframing, bridging context between sessions, making timing calls, advocating for end users, designing experiments, and arbitrating claims between agents.

These form a second skill category — **collaboration skills** — alongside the existing maintenance skills. The human is the adaptive layer of the habitat. The four file layers are the persistent environment; the human is what makes the system responsive to situations the files don't cover.

See: [The Human in the Habitat](research-collaboration-skills.md)

## 4. Limitations

**Claude-heavy observation.** Three of four test contexts used Claude. Gemini testing is promising but limited to one day's data.

**Single human orchestrator.** All observations involve one human (the cairn creator) orchestrating all sessions. We don't know how the habitat performs with a human who didn't design it.

**No longitudinal data.** Whether habitat structures maintain influence over weeks or months remains untested.

**Human as transport.** The distillate flow requires the human to physically copy files between habitats. This works but doesn't scale.

**Priming effects.** The Gemini law-compliance trap was a primed test. Unprompted compliance rates are unknown.

## 5. Open Questions

1. **Does citation compliance degrade over time?** The half-life of a convention is unknown.

2. **What happens at habitat scale?** These habitats have ~10 memory entries and 6 laws. Signal-to-noise at 50 entries is untested.

3. **Can the human be removed from the message bus?** ~20 manual context relays in one day. The distillate/bridge flow is the beginning of an answer.

4. **What happens when the human is wrong?** One episode showed the agent correcting the human. How should skills handle this systematically?

5. **Do collaboration skills transfer as well as maintenance skills?** Early evidence says yes. Deeper testing needed.

## 6. Conclusion

Agentic habitat works, and the evidence is now substantially stronger than a single law citation. Laws transfer across sessions and platforms. Skills transfer their formats and behaviors. Path conventions adapt independently to new platforms. The reflect/distillate/bridge pipeline moves knowledge between habitats with verification. And the human is part of the system — not just the user, but an active layer that reframes, bridges, times, advocates, experiments, and occasionally gets corrected.

The minimum viable habitat remains two files. The maximum observed habitat is four layers plus collaboration skills, operating across three platforms with agents that adapted the framework to their own conventions. Between the minimum and the maximum, the graduation works: each layer adds value for agents that can use it without taking value from agents that can't.

What remains is time, scale, and independence from the human message bus. A single day's observation can establish that habitat structures transfer. It cannot establish that they persist, that they scale, or that they work when the human isn't actively orchestrating. Those questions require exactly the kind of longitudinal study that habitat is designed to support.
