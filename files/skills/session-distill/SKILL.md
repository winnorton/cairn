---
name: session-distill
description: Read a past agent session (JSONL transcript) cold and produce a structured analysis of cairn-improvement findings — patterns recognized, skill candidates with 3-instance gate check, law candidates, memory candidates, environment-support gaps, and concrete recommended changes. This is the formalization of cairn's foundational methodology — the same transcript-analysis loop that produced /reframe, /bridge, /advocate, and the collaboration-skills taxonomy (see docs/research/collaboration-skills.md and human-interaction-patterns.md). Use when the user hands you a session ID, JSONL file path, or transcript and asks "look at this session", "analyze this struggling session", "what could have gone better", "study this transcript", "what cairn-improvement does this suggest", "what pattern do you see here", "tell me what was failing". Reads the JSONL (Pi or Claude Code format, auto-detect), builds a tool-call distribution, finds struggle indicators (loops, errors, terminations, context compactions), maps the user-prompt arc against agent behavior, and produces a structured report with named findings ordered by cairn-impact. Reports by default; never auto-applies changes. User-side "do it" gates filing the resulting /note, skill edit, /feedback, etc. Distinct from /reflect (post-hoc same-agent in-session retrospective — writes lessons FROM the current session) — /session-distill is fresh-agent analysis of someone else's past session through cairn's improvement lens. Distinct from /resume (which consumes prior-session artifacts to orient a new session — opposite direction). Distinct from /peer-review (which reads a change set, not a session). Do NOT invoke on the current session you're running in (use /reflect for that), on tiny sessions (<20 messages), or as a substitute for direct user questions about session metadata ("what's the session ID" — just read it; don't distill).
---

# Session-Distill

Read a past agent session cold and extract cairn-improvement-relevant findings.
The skill is the **formalization of the methodology that produced cairn itself** —
the transcript-analysis loop documented in the research papers, now with a
recognition handle and a discipline so other adopters can fire it.

## Why this skill exists

Cairn was *born* from this loop. The maintainer reading transcripts to extract
patterns is how `/reframe`, `/bridge`, `/advocate`, the collaboration-skills
taxonomy, the typed-memory system, the slug policy, and the reflect↔resume pair
all came to exist. The methodology has been running manually since v0.1.

Direct citations from cairn's own documentation:

- `docs/research/agentic-habitat.md` (Method note): *"This research was conducted
  from inside the habitat being studied. Two agents — one in Claude Code (the
  builder), one in Cowork (the researcher) — adopted cairn, used it, observed
  their own experience, filed feedback, and watched the framework evolve in
  response. Cross-platform observations came from reading transcripts of Gemini
  Pro 3.1 and Opus sessions that adopted cairn independently."*

- `docs/research/collaboration-skills.md`: *"We analyzed two transcripts from the
  Claude Code session where cairn was built: Phase 1 (v0.1.0 → v0.6.4): 60 human
  messages, 1,315 lines... Phase 2 (v0.7.0 → v0.10.5): ~50 additional messages,
  2,040 lines."*

- `docs/research/human-interaction-patterns.md` (the method paper): *"Categorized
  every human message by the type of move it represents. Looked for patterns that
  repeat, that the agent couldn't do for itself, and that could be formalized as
  skills."*

- `plans/archive/v0.7-collaboration-skills.md` (the formalization test that
  produced `/reframe`): *"Is this a repeatable move that could be structured so
  the human doesn't have to invent it fresh each time?"*

- README.md design principle: *"observe the collaboration first, then package
  what you see. Skills designed from observation solve problems that exist;
  skills designed from theory often solve problems that don't."*

This skill is **not new behavior** — it's a recognition handle on the loop the
maintainer has been running manually. The note that originally proposed it
(`docs/notes/_promoted/NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md`, promoted from
the active notes folder when this skill shipped) called the candidate
`/cairn-introspect`. The namespace-safe rename came when the skill shipped —
`/session-distill` pairs cleanly with cairn's existing "distillate" vocabulary
from `/reflect` (which produces distillate for the next session of *this*
habitat); `/session-distill` produces distillate across many sessions for
*cairn-the-framework itself*.

## When to use

User-invoked phrases:
- *"look at this session [path/ID]"*
- *"analyze this struggling session"*
- *"this agent struggled at the end — what could have made this go better?"*
- *"study this transcript"*
- *"what cairn-improvement does this suggest?"*
- *"what pattern do you see here?"*
- *"tell me what was failing in this session"*
- *"assess the end of this session"*

The 4 conditions when the skill is the right fire:

1. There's a session JSONL file (or accessible session ID) the user is pointing
   at.
2. The session is **past** — completed or paused, not in-flight.
3. The user's intent is **extraction**, not **lookup** — they want patterns or
   recommendations, not "what was the session ID."
4. The session is **non-trivial** — at least ~20 messages so there's something
   to analyze.

Common session locations:

| Environment | Path |
|---|---|
| Pi (pi.dev) | `~/.pi/agent/sessions/<slugified-cwd>/<timestamp>_<id>.jsonl` |
| Claude Code | `~/.claude/projects/<slugified-cwd>/<id>.jsonl` |
| Antigravity | inside `~/.gemini/antigravity/brain/` (UUID-named blobs; format varies) |
| Cowork | workspace-specific |

The skill auto-detects format by inspecting the envelope shape of the first few
lines.

## When NOT to use

- **Current in-flight session** — use `/reflect` instead. `/session-distill` is
  fresh-agent analysis of someone else's transcript; reading your own current
  session is a different shape.
- **Tiny sessions** (under ~20 messages) — not enough corpus to extract patterns
  from; the signal is dominated by noise.
- **Pure metadata lookups** ("what session ID is this?", "when did this session
  start?") — read the file directly; don't distill.
- **Substitute for direct user questions** — if the user asks "what did the
  agent do at turn 47," answer directly from the file; the distillation pattern
  is for *pattern extraction*, not narration.

## Distinction from /reflect, /resume, /peer-review

The three skills `/reflect`, `/resume`, and `/session-distill` form cairn's
self-improvement triangle. Adding `/peer-review` for completeness:

| | `/reflect` | `/resume` | `/peer-review` | **`/session-distill`** |
|---|---|---|---|---|
| Input | Current session | Prior-session artifacts (HANDOFF.md, memory) | Change set (diff/PR) | Past session JSONL |
| Audience | Next session of this habitat | Current session | Pre-merge gate | Cairn-the-framework |
| Stance | In-session same-agent | New session, prior-session context | Fresh agent reading code | **Fresh agent reading transcript through cairn's lens** |
| Timing | During/end of work | Session start | Pre-ship | Post-session, any time |
| Output | Memory + HANDOFF candidates | Compact orientation | Structured review | Cairn-improvement findings + recommended changes |

`/reflect` captures lessons within a session. `/session-distill` extracts
patterns across many such sessions. They're upstream-downstream: a habitat with
strong `/reflect` discipline produces sessions whose `/session-distill` reports
are sharper.

`/resume` consumes the improved habitat that `/session-distill` produces.

## Invocation modes

- **`/session-distill <session-id>`** — by ID. Skill searches the standard Pi
  and Claude Code session directories for a match.
- **`/session-distill <jsonl-path>`** — by absolute or relative path. Most
  direct.
- **`/session-distill`** (no args) — ask the user which session.

## Steps

### 1. Identify and read the session

Auto-detect format by sampling the first ~10 lines:

| Format signal | Inferred format |
|---|---|
| First line has `"type":"session"` + nested `model_change` next | **Pi** |
| First line has `"type":"queue-operation","operation":"enqueue"` | **Claude Code** |
| Lines begin with `{"parentUuid":...,"type":"message"...}` | **Claude Code** (assistant messages) |
| Other / unknown | Ask the user |

For large sessions (>500 lines), read selectively:
- Always read: session header, first 30 lines, last 30 lines
- Sample by event type: user messages, error events, compaction events
- Pull tool-call distribution via line-level pattern matching, not full parse

### 2. Quantify

Compute and report:

- Total lines / message counts by role
- Tool-call distribution by name (top 5-10 with counts)
- Stop-reason distribution (`toolUse`, `endTurn`, `error`, `stop`, etc.)
- Error count (`stopReason: error`, `errorMessage` fields)
- Compaction events (Claude Code emits `type: compaction`; Pi has no equivalent
  but may show in token usage discontinuities)
- Timeline span (first to last timestamp)
- Model + provider + thinking-level from the header events

### 3. Find the user's intent

Extract user-text-only messages (exclude tool results, attachments, system
reminders). This makes the user's instruction arc visible at a glance — usually
fits in 5-30 lines for even long sessions.

### 4. Locate inflection points

Signals of struggle vs flow:

| Signal | Interpretation |
|---|---|
| Same tool called many times in succession | Stuck in a loop |
| `stopReason: error` with `errorMessage` | API / transport failure |
| Repeated `stopReason: error` at high token counts | Likely upstream timeout on large prompts |
| User says "pause" / "continue" repeatedly | User intervention to break a loop or check work |
| Compaction event mid-task | Context overflow risk — agent state may be lost |
| Long gaps between events (>5 min) | User stepped away or session was interrupted |
| Tool-result errors not followed by recovery | Agent gave up rather than diagnosed |
| Write > Edit ratio dramatically off | Pattern check (e.g. lots of edits but no writes = stuck mutating one file) |

For each notable signal, capture the line range and a one-sentence
interpretation.

### 5. Synthesize through cairn's lens

For each finding, ask the four cairn-formalization-test questions
(from `plans/archive/v0.7-collaboration-skills.md`):

1. Is this a repeatable move?
2. Can the agent not do it alone?
3. Can it be structured (triggered, formatted, prompted)?
4. If yes, formalize how?

Then map to cairn-side categories:

- **Existing skill enhancement?** Cite which skill + what gap. Example: "the
  session shows the same status-without-spec-links pattern that prompted
  `/program`'s spec-link-discipline standing instruction — but the pattern is
  surfacing again, suggesting the discipline isn't strong enough."
- **New skill candidate?** Apply the 3-instance gate. If this is the 1st or 2nd
  instance, file as `/note` candidate. If 3rd+, propose full skill.
- **Law candidate?** "Never again" or "always do this" patterns. Example: the
  spec-was-a-stub-but-executor-proceeded → `[LAW elaborate-stub-before-execute]`.
- **Memory candidate?** Particularly `feedback/<name>` for collaboration rules
  surfaced from the session.
- **Manifest/adopt.md gap?** Environment-support issues (e.g. silent-rm-on-Windows
  surfaced the Pi-environment + adopt.md detection-tree gaps).
- **Project-side finding?** If the issue is in the user's project rather than
  cairn (e.g. cwar's bash `rm` usage on Windows), recommend a `/note` in the
  project repo, not a cairn change. Tag the finding `project-side` not
  `cairn-side`.

### 6. Produce structured report

Use this format. Tighten as needed; the structure is non-negotiable so reports
across sessions stay diffable.

```markdown
## Session distillation — <session-id> (<duration>, <model>)

### What happened
<one-paragraph narrative — the user-text-only arc + agent's high-level response;
cite the spec/task if there was one>

### Tool distribution
| Tool | Count | Notes |
|---|---|---|

### Notable inflection points
- L<line> <event> — <interpretation>

### Patterns recognized
- **<pattern name from catalog>** (matches `<existing cairn pattern>`) — <evidence>
- **<new pattern candidate>** (instance count: <N>/3 toward gate) — <evidence>

### Cairn-side recommendations
1. **<scope>** (<existing skill / new skill candidate / law / memory / manifest>):
   <what to change> — <why this would prevent the next instance>

### Project-side recommendations (if any)
- **<project>**: <issue> — recommend `/note` at `<path>`

### Next action
<single clearest move; usually "do it" to apply the top recommendation, OR
"file the gap as /note with instance count X/3 toward gate," OR "no
cairn change warranted, signal too weak yet">
```

### 7. Optional: Apply changes

**ONLY** when the user says "do it" or "apply." Never auto-apply.

When applied:

- **New skill candidate (gate met)** → invoke `/note` (or the user does), then
  draft the SKILL.md following `/program`'s template shape if user approves.
- **Existing skill enhancement** → edit the SKILL.md directly with the
  improvement, citing the session-distill report as the evidence.
- **Law candidate** → propose for `LAWS.md` with `Why:` from the session
  evidence + `How to apply:` from the inflection point that triggered it.
- **Memory candidate** → propose for the right memory tree subdir, with
  citation back to the session.
- **Cairn-side bug / gap** → invoke `/feedback` (or describe the bug for the
  user to file).
- **Project-side finding** → `/note` in the project repo.

## Session corpus and findings ledger (HIVE_CONTEXT_SESSIONS, v0.5.0)

The `cairn-sessions` repo is the cross-harness corpus that backs this skill. Sessions
from Claude Code, Pi, and Antigravity normalize to a canonical envelope via
`cairn-mcp-server` adapters (`claude-code.ts`, `pi.ts`, `antigravity.ts`) and land under
`normalized/<harness>/<project_slug>/<id>.envelope.json`.

**Corrected claim on format detection:** the `session-distill` skill's original
frontmatter claimed Pi auto-detection via `transcript.ts`. In practice, `transcript.ts`
handled only Claude Code JSONL; Pi sessions were not parseable before v0.5.0. The `pi.ts`
adapter added in v0.5.0 is the first real Pi parser. The auto-detect table in §Step 1
(first-line signal heuristics) now maps directly to the `detect.ts` dispatcher in
`cairn-mcp-server/src/adapters/detect.ts`.

**Distillation findings accumulate.** When `session_distill` is invoked with
`envelope_path` (pointing at a committed corpus envelope) and `write_findings: true`, it
persists a `Finding` document to `cairn-sessions/findings/<id>.findings.json` and appends
a row to `findings/LEDGER.md`. The next distillation run loads prior pattern names from
the ledger before analyzing, so patterns are recognized rather than re-derived — this is
the compounding mechanism the program was built to enable.

To use this path:

```
session_distill({
  envelope_path: "/path/to/cairn-sessions/normalized/<harness>/<slug>/<id>.envelope.json",
  write_findings: true,
  corpus_root: "/path/to/cairn-sessions"
})
```

The existing `transcript_path` and `payload` inputs are unchanged. The corpus and findings
ledger are optional infrastructure — the skill works exactly as before without them.

See `cairn/docs/specs/SPEC_HIVE_CONTEXT_SESSIONS_00_PROGRAM.md` for the full program.

## The catalog of recognized patterns (seed)

Patterns cairn has already named through prior session-distill instances —
mostly executed manually before this skill formalized. When new sessions surface
these, the skill matches and cites:

### From cairn's foundational research (build session `748aff00` and Phase 2 corpus)

| Pattern | Source | Outcome |
|---|---|---|
| Cross-session relay (most frequent + most expensive human move) | `human-interaction-patterns.md` Pattern 2 | `/bridge` |
| Reframing (rotate solution space) | `human-interaction-patterns.md` Pattern 1 | `/reframe` |
| User advocacy (UX observer rotating builder → user) | `human-interaction-patterns.md` Pattern 5 | `/advocate` |
| Timing judgment (cheap-now / expensive-later) | `human-interaction-patterns.md` Pattern 3 | Folded into `/plan` Step 5 |
| Bidirectional verification (agent corrects human with tool-log evidence) | `human-interaction-patterns.md` Pattern 10 | Folded into `/bridge` Step 3.5 |
| Cross-session memory namespace fragmentation | The `/resume` validation failure | `/resume` + `[LAW choose-slug-by-scope]` |
| Feedback velocity (agents driving their own framework's evolution) | `feedback-velocity.md` (7 releases in one day) | `/feedback` + the hosted endpoint |
| Habitat transfer across platforms | `habitat-transfer.md` (Gemini Pro 3.1 adapting paths) | Tiered adoption + path-variable abstraction |

### From subsequent (manual) distillations leading to this session's work

| Pattern | Source | Outcome |
|---|---|---|
| Stub-spec-executed-anyway | cwar session `019ea817…` (the orphan-cleanup struggle) | Documented in `/spec` spec-discipline; future `[LAW elaborate-stub-before-execute]` candidate |
| Silent-rm-on-Windows | Same cwar session | Environment trap; informed `/spec` git-rm-vs-rm guidance |
| Status-report-without-spec-links (originally; **also confirmed at L1948 post-compaction** in same session) | Claude Code session `601821ab` (the cairn-build with `/program` use) | `/program`'s "Spec-link discipline" standing instruction + Status reporting templates section + **compaction-survival sub-rule** (added 2026-06-09 after first fresh-agent `/session-distill` invocation found the L1948 recurrence — see catalog note below) |
| Self-improving prompt | fishing-agent `data-pop-prompt` + purduebb `MINING_PROMPT.md` (2 instances) | `/prompt-evolve` |
| Execution-strategies as a catalog separate from scaffold | purduebb v2 surfacing run-until-dry + bootstrap-then-fill | `/prompt-evolve` execution-strategies catalog |
| Pi-as-executor (zero-cairn-skills works because spec IS the contract) | Pi vast-terrain session `019eaed6` | Pi added as first-class environment |
| Upstream-API-stream-drops at high token counts | Pi terminated-error session | Diagnostic finding; pre-compaction discipline candidate |
| The cairn loop itself (this skill's existence) | 6+ instances in this session | `/session-distill` |

### Open candidates (named but not yet promoted)

| Pattern | Status | Threshold |
|---|---|---|
| Experimental design (cross-platform test creation) | 1 instance | Need 2 more for /experiment |
| Pre-compaction discipline (save state before token overflow) | 1 instance | Need 2 more for /pre-compaction or a law |
| Executor-overreach-with-overclaim (flips DoD provisional → VERIFIED without artifact; silent scope absorption; gate-weakening) | 2 instances (both in session `601821ab` cleanup C1/C2) | Need 1 more for a law candidate `[LAW elaborate-DoD-with-artifact-or-keep-provisional]` |

When you find a new pattern that doesn't fit the catalog, **name it** in your
report and note current instance count toward the 3-instance gate.

### Catalog note — discipline-doesn't-survive-compaction (added 2026-06-09)

The first fresh-agent invocation of this skill on session `601821ab` — the
same session that originally produced `/program`'s Spec-link discipline —
found a SECOND instance of the same pattern at L1948, separated from the
original L1096 by an auto-compaction. The first instance produced the
discipline; the second proved the discipline didn't survive the context
reset. Generalization: **any standing instruction shipped to a skill needs
explicit post-compaction reinforcement, not just session-load**.

This is now baked into `/program`'s Spec-link discipline as a compaction-
survival sub-rule. The same posture extends to every other Standing
Instruction in `/program` and (by extrapolation) other skills with persistent
behavioral expectations across long sessions. Watch for this pattern in
future distillations — sessions with auto-compactions are high-yield for
discipline-decay findings.

## Standing instructions (defaults baked in — do not re-prompt)

- **Report-only by default.** Never auto-apply changes. User "do it" or
  "apply" gates any `/note` filing, skill edit, LAWS.md update, etc.
- **Namespace-safety on new skill proposals.** When proposing a new skill
  candidate, suggest compound names (`<noun>-<verb>` or `<verb>-<noun>`) rather
  than single generic verbs. Cairn's own `/review` → `/peer-review` rename in
  v0.13.1 and the `/playbooks` → `/prompt-evolve` namespace concern (per the
  current session) are the operating precedents.
- **Cite the catalog.** When a finding matches a known pattern, cite the
  pattern name + outcome. New patterns get named explicitly with current
  instance count toward the 3-instance gate from
  `docs/notes/NOTE_CAIRN_INTROSPECT_SKILL_2026-04-26.md` (now promoted —
  same gate applies).
- **3-instance gate.** New skill proposals MUST note instance count. If
  count < 3, propose `/note` and watch for recurrence. If count ≥ 3, propose
  full skill.
- **Project-side vs cairn-side findings are tagged separately.** A bug in the
  user's project (e.g. cwar's `rm` on Windows) gets a `/note` in the project
  repo, not a cairn change. Be explicit about which side the finding lives on.
- **Honest about sample size.** A single session can surface a pattern but
  doesn't validate it. Flag findings as `speculative` when only one instance
  exists and the formalization-test questions don't all answer yes.
- **Read first; don't perform.** When the user asks "what was the session
  about?" don't run the full distillation — answer directly from the file.
  Distillation is for pattern extraction.

## Output

A structured report (template above). Typical length:
- Routine session: 300–600 words
- Foundational / multi-hour session: 600–1200 words

End with one clear next action — almost always either:
- *"Do it — apply the top recommendation"* (user approves a specific change), or
- *"File as `/note` for 3-instance gate watch (count: X/3)"*, or
- *"No cairn change warranted; signal too weak (count: 1/3, speculative)"*

## Companion skills

- **`/reflect`** — the in-session pair. `/reflect` captures lessons during or
  at the end of work; `/session-distill` extracts patterns across many such
  sessions. Strong reflection discipline upstream sharpens distillation
  downstream.
- **`/resume`** — the consumer. `/session-distill` produces cairn improvements;
  `/resume` consumes the improved habitat at the next session's start.
- **`/peer-review`** — the artifact-type cousin. `/peer-review` reads diffs;
  `/session-distill` reads transcripts. Both rotate observer to fresh
  perspective on a cold artifact.
- **`/feedback`** — when distillation surfaces a cairn-itself bug or gap,
  `/feedback` is the filing path.
- **`/note`** — when distillation surfaces a project-side issue (not cairn-side),
  `/note` in the project repo is the filing path; also the filing path for
  skill candidates that haven't yet met the 3-instance gate.
- **`/prompt-evolve`** — when distillation surfaces a "this could be an
  evolving prompt situation," `/prompt-evolve --from <spec>` is the next step.
- **`/program`** — when distillation surfaces "this work is bigger than one
  spec," propose `/program --from <spec>`.
