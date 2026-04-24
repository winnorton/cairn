# The Human in the Habitat: Collaboration Skills from Interaction Analysis

## The observation

cairn's first eight skills all serve the agent: reflect, plan, prune, audit, tour, feedback, plus the maintenance pair (reflect and plan). The ninth — reframe — was different. It was designed to help the *human*. And it was the only skill born not from gap analysis or agent observation, but from watching a human do something the agent couldn't.

That origin suggested a question: what other moves does the human make that the agent can't, and could any of them be formalized as skills?

## Method

We analyzed the full transcript of the Claude Code session where cairn was built (v0.1.0 through v0.6.4). 60 human messages across 1,315 transcript lines. The human (the cairn maintainer) was simultaneously running a second agent session (Cowork) as a test consumer, making the transcript unusually rich in cross-session interaction.

Every human message was categorized by the type of move it represented. We looked for patterns that repeated, that the agent couldn't perform for itself, and that would benefit from formalization.

## Eight interaction patterns

### Pattern 1: Reframing
The human rotated the agent's solution space when the agent was stuck on one axis. The defining moment: the agent was converging on a binary (cite memory references / don't cite them) when the human said "maybe you need more than 1 memory file." This introduced a new dimension — multiple files with different citation rules — that the agent couldn't reach from inside its own convergence. The result was cairn's v0.4.0 type-aware memory system.

The human later asked the agent to name the move. The agent called it "reframing." The skill was written that session.

Already captured as `/reframe`. 3 instances in the transcript.

### Pattern 2: Cross-session relay
The most frequent human move in the transcript — 7+ instances. The human carried output, observations, and feedback between agent sessions. The workflow was consistent: read output from one agent, judge its relevance, paste it into another session, and provide enough context for the receiving agent to act.

Examples: pasting the Cowork agent's feedback about `.claude/` write-protection into the builder session. Carrying the Cowork agent's MVH analysis. Dropping research documents from one workspace into another. Ultimately, creating a filesystem junction so the research agent could read the builder's transcript directly.

This is cognitively expensive. The human is the inter-agent communication layer, performing read → judge → copy → contextualize → paste on every relay.

### Pattern 3: Timing judgment
The human made strategic timing calls the agent couldn't make. Twice, the agent proposed cautious, incremental changes and the human overrode: "this is a good time for aggressive change, not later" and "we welcome structural change at this time, it will be much harder later."

The agent sees current state. The human sees the window — cost curves, project lifecycle, the difference between "now when it's cheap" and "later when it's expensive." The agent has no sense of temporal strategy; it treats every moment as equivalent.

### Pattern 4: Triage
When the agent presented numbered options, the human did rapid prioritization: "lets do 7 and 1. discuss 3 after. and ignore 2 4 and 6." Picking, sequencing, and discarding in a single move, often with reasoning invisible to the agent (time pressure, what other sessions need, what matters most right now).

4 instances.

### Pattern 5: User advocacy
The human watched other agents use cairn and reported what they saw. "Confusing for first time user." "This is taking the new agent along time in the adopt process." The agent built the system but never observed anyone else using it. The human acted as UX researcher — feeding real-usage observations back to the builder.

3 instances.

### Pattern 6: Interruption as steering
Eight interruptions across the session. The human steered by stopping — sometimes because the agent was heading the wrong direction, sometimes because a more urgent thought arrived. Often followed by a brief course correction: "sorry i just caught the new name," "changed my mind," "sorry commit push 0.3.1 and resume."

This is a platform interaction pattern, not a formalizable skill.

### Pattern 7: Authorization gates
"Push it." "Do it." "Ship it." "Proceed." "Yep your plan, do it." Pure delegation — the human approving the agent's proposed action. 7 instances.

This is the collaboration contract itself. Already implicit in how `/plan` works ("present and wait"). Not a skill candidate.

### Pattern 8: Environment provision
The human handled infrastructure the agent couldn't reach: creating GitHub repos, providing URLs, configuring DNS, passing credentials. This is the boundary of what agents can do, not a behavior to formalize.

## Skill candidates

Three patterns pass the test for formalization. The test is the same one that produced `/reframe`: is this a repeatable move that could be structured so the human doesn't have to invent it fresh each time, or so the agent can prompt for it at the right moment?

### `/bridge` — cross-session relay

The strongest candidate. The human's most frequent move, and the most cognitively expensive.

When the human says "bridge" or pastes output from another session, the agent knows to ask structured questions: what session is this from, what's the key finding, and what should I do with it — assess, integrate, or act? When the agent produces output that's relevant to other efforts, it flags it: "this finding is relevant to [effort X], consider bridging it."

The skill supports the human's relay job the way `/reframe` supports their rotation job. It doesn't replace the human's judgment about what's worth carrying — it structures the handoff so less context is lost in transit.

### `/tempo` — timing judgment

The agent defaults to conservative, incremental changes. It has no sense of project lifecycle — no concept of "early development where breaking changes are cheap" versus "mature product where backward compatibility matters." The human has this sense and exercised it decisively in the transcript.

When the agent is about to propose something cautious, `/tempo` prompts it to surface the timing dimension: "This change has a cost curve. Is now the right window for it, or should we defer?" The human still makes the call. The agent creates the opening by making the question explicit instead of defaulting to caution.

Lighter than `/reframe` — it's one question, not 2-4 alternative framings — but it targets a real blind spot.

### `/advocate` — user perspective

The agent builds things. The human watches other people use them. When the human said "confusing for first time user," that was information the agent had no way to generate on its own — it had never seen a first-time user.

`/advocate` prompts the agent to simulate the end-user perspective before shipping: "How would a first-time user experience this? What would confuse them? What would take too long?" The agent has enough information to attempt this simulation — it just doesn't think to.

Different from `/reframe` (which rotates the problem axis) and `/bridge` (which carries context). `/advocate` rotates the *observer position* — from builder to user.

### Not a standalone skill: `/triage`

Pattern 4 (rapid prioritization) is real but probably belongs as a convention within `/plan` rather than its own skill. When presenting options, structure them with cost/value signals, dependencies, and a recommended sequence. Help the human decide faster. This is a formatting discipline, not a distinct capability.

## The emerging taxonomy

cairn's skills now fall into two categories:

**Maintenance skills** service the habitat itself. They help the agent keep its environment clean, current, and useful:

- `reflect` — end-of-task retrospective
- `plan` — structured pre-flight before execution
- `prune` — retire stale entries
- `audit` — count citations, surface unused structures
- `tour` — onboard new users
- `feedback` — file issues to cairn's maintainer

**Collaboration skills** service the human-agent pair. They help the human do their part of the work, or help the agent support the human's cognitive process:

- `reframe` — generate alternative framings when the agent is stuck
- `bridge` — structure cross-session context relay
- `tempo` — surface timing dimensions the agent misses
- `advocate` — simulate the end-user perspective

The maintenance skills existed from v0.1. They were identified by gap analysis and agent self-observation — the agent noticing what it needed. The collaboration skills came from studying what the *human* does. They required looking at the interaction, not just the habitat.

## What this means

### The human is part of the habitat

cairn's four layers (context, memory, laws, skills) describe the persistent file environment. But the habitat isn't just files. The human is the adaptive layer — the one who reframes when the agent converges, who bridges between sessions, who knows when the window is open for aggressive change, who watches end users and reports back.

The collaboration skills make this role explicit. They don't replace the human's judgment — they give the human's contributions a handle, so the same moves can be prompted and structured instead of invented fresh each time.

### Skills that formalize existing behavior compound faster

The feedback skill taught this lesson first: it didn't create the feedback loop, it standardized one that already existed. The collaboration skills follow the same pattern. The human was already reframing, bridging, making timing calls, and advocating for users. The skills formalize what's already happening.

This is a design principle: **observe the collaboration first, then package what you see.** Skills designed from theory ("agents should be able to compose skills") tend to solve problems that don't exist. Skills designed from observation ("the human keeps doing this expensive thing manually") solve problems that do.

### The reframe origin story is the template

The `/reframe` skill was born from a specific interaction: the human did something the agent couldn't, the agent recognized the move, the human asked the agent to name it, and the skill was written. This is a repeatable process for discovering collaboration skills:

1. Watch the human's interventions across a session
2. Identify moves that repeat and that the agent can't do for itself
3. Ask whether the move could be structured (triggered, formatted, prompted)
4. If yes, write the skill

The transcript analysis that produced `/bridge`, `/tempo`, and `/advocate` followed exactly this process at a larger scale — 60 messages instead of one moment.

## Open questions

1. **Do collaboration skills transfer as well as maintenance skills?** The cross-session test showed maintenance skills (tour, plan) and laws transferring cleanly. Collaboration skills are different — they depend on the human engaging with the prompt. Will a new user invoke `/bridge` without being taught?

2. **What's the right trigger for agent-initiated collaboration skills?** `/reframe` fires when the agent notices convergence. `/tempo` should fire when the agent is about to default to caution on a change with lifecycle implications. `/advocate` should fire before shipping. But these triggers are fuzzier than maintenance skill triggers — how reliably will agents detect them?

3. **Is there a third skill category?** Maintenance skills service the habitat. Collaboration skills service the pair. Is there a category that services the *ecosystem* — skills that help multiple human-agent pairs coordinate? The bridge skill hints at this but stays within one human's sessions.
