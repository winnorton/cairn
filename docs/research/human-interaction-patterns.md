# Human Interaction Patterns in the Cairn Build Session

## Source

Two transcripts from the same Claude Code session ("Create exportable bootstrap for agentic engineering environment"):

- **Transcript 1:** v0.1.0 through v0.6.4. 60 human messages, 1315 lines. The human built cairn with one agent while running a second agent (Cowork) as a test consumer.
- **Transcript 2:** v0.7.0 through v0.10.5. ~50 additional human messages, 2040 lines. The human shifted from builder to test orchestrator, running parallel sessions across Claude Code, Cowork, and Google Antigravity (Gemini Pro 3.1 and Opus).

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

## Patterns from Transcript 2 (v0.7.0 → v0.10.5)

The second transcript shows the human's role shifting from builder to test orchestrator. Three new patterns emerged, and several existing patterns intensified.

### Pattern 9: Experimental design (new)
The human designed deliberate cross-agent, cross-platform experiments. "Going to adopt cairn in the google antigravity agent manager. first with gemeni-pro-3.1, then with opus." Then: "antigrav opus model adopting cairn in cwar-engine now, for the bridge test." The human controlled variables (which agent, which platform, which workspace) and observed outcomes systematically.

This is different from Pattern 2 (relay). The relay moves existing output. Experimental design creates new test scenarios to answer specific questions. The human is doing research methodology.

Instances: #1711, #1963, #1488, #1474

### Pattern 10: Bidirectional verification / claim arbitration (new)
The Gemini reflection episode: Gemini claimed it git-cloned the repo. The human said "I did that, not you." The builder agent deferred to the human. The human went back to Gemini: "are you sure?" Gemini checked its tool logs, found timestamped proof. The human admitted: "Gemini was right. I misremembered."

The human served as a claim arbitrator between agents — and got corrected by the agent. This isn't "human corrects agent" — it's a three-party verification loop where anyone can be wrong.

Instances: #1754-1774

### Pattern 11: Agent-model correction (new)
"you should know your user better. i said 'plan it'. waiting for plan." The human corrected the agent's model of the human's communication style. Not a reframe (rotating the problem) or advocacy (rotating the observer) — this is recalibrating the agent's understanding of who it's working with.

This is probably a feedback memory rather than a skill. The agent should learn from accumulated feedback entries about user style, not from a triggered skill.

Instances: #2010

### Evolution of existing patterns

**Bridge (Pattern 2) escalated dramatically.** The human pasted ~15 agent outputs into the builder session — full `/resume` outputs, upgrade plans, shell logs, distillate files, bridge outputs, adoption plans. The human became a multi-agent message bus orchestrating a pipeline across 4+ sessions on 3 platforms.

**Advocate (Pattern 5) recurred** in new contexts: "confusing for first time user" about Cowork adoption, "this is taking the new agent along time."

**Tempo (Pattern 3) recurred:** "2 is too aggressive i think" — moderating pace of change.

## New skill candidates from Transcript 2

### 5. `/experiment` — structured hypothesis testing
When the agent or user faces a validation question ("does this work on Gemini?"), propose a structured experiment: pick the variable, control the rest, define what success looks like, observe. The human was already doing this — routing specific tests to specific agents on specific platforms. A skill would help the agent propose experiments proactively instead of the human inventing them.

### 6. `/verify` — claim verification before integration
Before integrating a claim from another session or agent, verify it against current state. The Opus agent demonstrated this independently — it grep'd cwar's actual code before integrating distillate claims. But the builder agent initially didn't (deferred to the human's memory, which was wrong). A skill would make "trust but verify" the default for incoming bridge content.

## The emerging taxonomy

cairn's skills now fall into two categories:

**Maintenance skills** (service the habitat):
- reflect, plan, prune, audit, tour, feedback, resume

**Collaboration skills** (service the human-agent pair):
- reframe (rotate the problem), bridge (carry context), tempo (surface timing), advocate (shift perspective)
- Candidates: experiment (design tests), verify (check claims before integrating)

The maintenance skills existed from v0.1. The collaboration skills emerged from observing what the human actually does. The second transcript confirms the taxonomy and adds evidence that collaboration skills are the higher-leverage category — the human's experimental design and claim arbitration produced more insight per move than any maintenance skill firing.
