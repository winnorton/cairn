# Human Interaction Patterns in the Cairn Build Session

## Source

Transcript of "Create exportable bootstrap for agentic engineering environment" — a Claude Code session where cairn was built from v0.1.0 through v0.6.4. 60 human messages, 1315 transcript lines. The human (Win) built cairn with one agent while simultaneously running a second agent (Cowork) as a test consumer.

## Method

Categorized every human message by the type of move it represents. Looked for patterns that repeat, that the agent couldn't do for itself, and that could be formalized as skills.

## Eight patterns found

### Pattern 1: Reframing (already `/reframe`)
The human rotated the solution space when the agent was stuck on one axis. Key moment: "maybe you need more than 1 memory file" — the agent was converging on cite/don't-cite for a single memory file. The human introduced a new dimension (multiple files with different citation rules). This directly produced the v0.4.0 type-aware memory system.

Instances: #30, #42, #43

### Pattern 2: Cross-session relay (candidate: `/bridge`)
The human carried output, observations, and feedback between agent sessions. This was the most frequent human move in the transcript (7+ instances). The human read output from the Cowork consumer agent, judged its relevance, pasted it into the builder session, and provided enough context for the builder agent to act on it.

This is cognitively expensive: read → judge → copy → contextualize → paste. The human is the inter-agent communication layer.

Instances: #23, #32, #38, #40, #48, #54, #59

### Pattern 3: Timing/tempo judgment (candidate: `/tempo`)
The human made strategic timing calls the agent couldn't make. "This is a good time for aggressive change, not later" and "we welcome structural change at this time, it will be much harder later." The agent defaulted to caution; the human overrode with lifecycle awareness.

The agent sees current state. The human sees the window — cheap now, expensive later.

Instances: #31, #41, #14

### Pattern 4: Triage/prioritization (possible `/plan` enhancement)
When the agent presented numbered options, the human did rapid triage: "lets do 7 and 1. discuss 3 after. and ignore 2 4 and 6." Picking, sequencing, and discarding in one move, often with reasoning the agent doesn't have access to.

Instances: #16, #12, #25, #29

### Pattern 5: User advocacy (candidate: `/advocate`)
The human watched other agents use the system and reported what they saw. "Confusing for first time user." "This is taking the new agent along time." The human acted as a UX researcher — observing real usage and feeding observations to the builder.

Instances: #50, #52, #49

### Pattern 6: Interruption as steering (not a skill — platform behavior)
Eight interruptions across the session. The human steered by stopping. Sometimes the agent was going wrong; sometimes the human had a more urgent thought. Often followed by course correction.

Instances: #7, #13, #17, #26, #36, #52, #53

### Pattern 7: Authorization gates (not a skill — collaboration contract)
"Push it." "Do it." "Ship it." "Proceed." Pure delegation — the human approving proposed action. Already implicit in `/plan`'s "present and wait" pattern.

Instances: #9, #20, #24, #28, #34, #35, #51

### Pattern 8: Environment provision (not a skill — boundary condition)
The human handled infrastructure the agent couldn't reach: creating repos, providing URLs, configuring DNS, providing credentials. This is the collaboration boundary itself, not formalizable as a skill.

Instances: #3, #6, #8, #45, #46, #47

## Skill candidates (ranked)

### 1. `/bridge` — cross-session relay
**What it does:** Helps the human carry context between agent sessions. When the human says "bridge" or pastes output from another session, the agent knows to ask: what session, what's the key finding, what should I do with it? When the agent produces output relevant to other efforts, it flags it for bridging.

**Why it matters:** Most frequent human move in the transcript. Highest cognitive load. The human is doing work that should be structured, not improvised each time.

**How it's like `/reframe`:** Both support the human's actual job in the collaboration. Reframe helps the human do something hard (rotate the solution space). Bridge helps the human do something tedious (carry context between sessions).

### 2. `/tempo` — timing judgment
**What it does:** Prompts the agent to surface timing dimensions it would otherwise miss. "This change has a cost curve — is now the right window?" Instead of defaulting to conservative, the agent creates an opening for the human to make the timing call.

**Why it matters:** Agents have no sense of project lifecycle. They treat every moment as equivalent. The human's "now, not later" calls were decisive in this session — they shaped the v0.4.0 restructure and the v0.5.0 tiers.

**How it's like `/reframe`:** Both target agent blind spots. Reframe targets convergence bias. Tempo targets temporal flatness.

### 3. `/advocate` — user perspective
**What it does:** Prompts the agent to consider the end-user perspective before shipping. "How would a first-time user experience this? What would confuse them? What would take too long?" The agent has enough information to simulate this — it just doesn't think to.

**Why it matters:** The agent built cairn but never watched someone else use it. The human had to be the one to notice "confusing for first time user." This skill would make that observation proactive instead of reactive.

**How it's like `/reframe`:** Both ask the agent to step outside its current framing. Reframe rotates the problem axis. Advocate rotates the observer position.

### 4. `/triage` — structured prioritization
**Might fold into `/plan` rather than standalone.** When presenting options, structure them with cost/value signals, dependencies, and recommended sequence. Help the human decide faster rather than making the decision for them.

## The emerging taxonomy

cairn's skills now fall into two categories:

**Maintenance skills** (service the habitat):
- reflect, plan, prune, audit, tour, feedback

**Collaboration skills** (service the human-agent pair):
- reframe (rotate the problem), bridge (carry context), tempo (surface timing), advocate (shift perspective)

The maintenance skills existed from v0.1. The collaboration skills are the next layer — and they all came from observing what the human actually does in the collaboration.
