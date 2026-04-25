# Research Questions — Agentic Habitat

## Core questions

1. What are the minimum viable structures an agent needs to maintain coherence across sessions?
2. How do agents actually use memory, laws, and skills in practice — what gets referenced, what rots?
3. What's the right balance between structure (laws, templates) and emergence (memory growing organically)?
4. How should habitat handle decay — when do memories, laws, or skills become stale, and who prunes them?
5. Does habitat transfer across agents/platforms, or is it inherently tied to one agent's way of working?

## Research threads — outcomes (2026-04-24)

### Thread 1: Decay & pruning → RESOLVED

- v0.2.0: `prune` skill (reactive, user-invoked)
- v0.3.0: `audit` skill (citation counting feeds prune with signal)
- v0.4.0: type-aware hygiene (event-driven / citation-driven / time-driven / integrity-driven per memory type)
- **Status:** Mechanically solved. Long-term empirical question remains: does the citation→audit→prune loop actually work over months?

### Thread 2: Observation loops → PARTIALLY RESOLVED

- v0.3.0: lightweight citation conventions (`[LAW N]`, `[MEM type/name]`)
- v0.4.0: type-aware citations (user/ excluded — always-on background doesn't need citation)
- **Key finding:** convention-based citation is a pragmatic workaround for harness-level instrumentation. Trades precision for simplicity. Stays in the "just files" layer.
- **Remaining gap:** citations depend on agent compliance. No way to verify completeness. May degrade over time.

### Thread 3: Minimum viable habitat → RESOLVED, SHIPPED

- **Finding:** MVH is two files — CLAUDE.md + MEMORY.md. Everything else is graduated.
- v0.4.3: `role` labels (essential/scaffolding/optional) on every manifest entry
- v0.5.0: `tier` field (seed/grow/structure/full) with `--tier seed` adoption flag
- **Key insight:** minimum viable habitat = maximally portable habitat (same two files). Not coincidence — stripping cairn to minimum also strips it to what any agent can use.

### Thread 4: Portability → RESOLVED, SHIPPED

- **Finding:** cairn has two layers — a data layer (files, structure, content) that's genuinely portable, and a protocol layer (citations, skills, audit loop) that's Claude-shaped.
- The portability gradient maps exactly to adoption tiers: seed (any agent) → grow (any careful agent) → structure (cairn-aware) → full (Claude ecosystem)
- v0.5.0: tiered adoption ships this as a first-class feature
- **Key insight:** cairn doesn't have a portability problem — it has a layering opportunity. The core is already universal.

## Gaps identified in cairn v0.1.0

Triaged 2026-04-24 with feedback from Claude Code Opus 4.6 Max. See `sources/triage-feedback.md`.

### Genuine gaps (all addressed by v0.5.0)

- **Onboarding cost** — fixed by `tour` skill (v0.2.0)
- **Decay/pruning** — fixed by `prune` + `audit` skills (v0.2–v0.3), type-aware hygiene (v0.4.0)
- **Cross-platform portability** — Cowork adoption documented (v0.3.1, v0.4.1), tiered adoption (v0.5.0)
- **Observation loops** — citation conventions + audit (v0.3.0–v0.4.0)

### Retired (misreads — see `feedback/gap_analysis_bias.md`)

- ~~Multi-agent~~ — habitat is passive data; git handles shared state
- ~~Habitat versioning~~ — git handles it
- ~~Skill composition~~ — harness handles it

### Thread 5: Collaboration skills → PARTIALLY RESOLVED

- **Source:** two transcript analyses (Phase 1: 60 messages v0.1–v0.6.4; Phase 2: ~50 messages v0.7–v0.10.5)
- **Phase 1 finding:** 8 interaction patterns, 4 formalizable as skills. Two skill categories: maintenance (habitat) and collaboration (human-agent pair).
- **Phase 2 finding:** 3 additional patterns (experimental design, bidirectional verification, agent-model correction). Bridge/advocate/reframe validated cross-platform. Two new candidates: `/experiment`, `/verify`.
- **Shipped:** `/bridge` (v0.7.0), `/advocate` (v0.7.0), `/reframe` (v0.6.3). `/tempo` identified but not yet written.
- **Key answered question:** collaboration skills DO transfer across platforms — Gemini Pro 3.1 and Opus both used bridge and reflect successfully.
- **Open:** Can the human be removed from the message bus? Does /verify belong in /bridge? What happens when the human is wrong (Gemini correction episode)?

See: `research-collaboration-skills.md`, `notes/human-interaction-patterns.md`

### Thread 6: Cross-platform portability → VALIDATED

- **Source:** Phase 2 transcript — Gemini Pro 3.1 and Opus adopting cairn in Google Antigravity
- **Finding:** Gemini adapted cairn's path variables to Antigravity conventions without instruction. Tour, reflect, plan, bridge, laws with slug citations — all worked. Agent mapped `{userMemory}` → `~/.gemini/antigravity/memory/` independently.
- **Key insight:** the data layer is genuinely portable. The protocol layer (slug citations, skill trigger matching) transfers to agents that read instructions carefully, regardless of platform.
- **Surprise:** Gemini's `/reflect` output was higher quality than expected — specific, quantified, and included a finding (repo-clone instinct) that was empirically verified via tool logs when the human challenged it.

### Thread 7: Bidirectional verification → OPEN

- **Source:** Gemini reflection episode (Phase 2, messages #1754-1774)
- **Finding:** The human misremembered, the agent was right, and the builder agent's initial instinct (defer to human) was wrong. The correct behavior is verify, not defer.
- **Implication:** Current skill design assumes human authority. The Gemini episode shows agents sometimes have evidence the human doesn't. How should skills handle this? Does `/bridge` need a verification step? Should the agent push back more when it has tool-log evidence?
- **Candidates:** `/verify` skill, or verification as a bridge sub-step.

## Meta-findings

1. **Feedback loop velocity:** 7+ cairn releases shipped in one session, each responding to agent-filed observations. Extended to 25+ releases across both transcripts (v0.1.0 → v0.10.5).
2. **Gap analysis bias:** 3/7 initial gaps were architecture-brain projections. Check whether gaps are in the system or in assumptions about what the system should be.
3. **Convergence signal:** when two independent research threads (MVH + portability) arrive at the same boundary, it usually means you've found something real.
4. **Skills that formalize existing behavior compound faster** than skills that try to create new behavior. Confirmed across both maintenance and collaboration skills.
5. **The human is part of the habitat.** Four file layers describe the persistent environment, but the human is the adaptive layer. Habitat theory is incomplete without accounting for the human's role.
6. **The human is not always the authority.** The Gemini episode showed the human misremembering and the agent correcting with evidence. Skills that assume unilateral human authority need to account for this.
7. **The human as message bus doesn't scale.** ~15 agent outputs pasted in Phase 2. The distillate/bridge flow is the beginning of an answer, but the human still physically moves files. This is the most pressing practical problem.
