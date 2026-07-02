---
name: tour
description: Walk the user through a freshly-installed cairn habitat — what each file is for,
  what to fill in first, and how to extend. Use right after adoption, when the user says
  "tour", "what did cairn install", "show me my habitat", "what do I do next", or seems
  lost after install. Do NOT use if the user has clearly been using cairn for a while —
  tour is for the cold start, not for seasoned users.
---

# Tour

Onboard the user to their freshly-installed cairn habitat. The goal is to turn "I have
some empty templates" into "I have one concrete first action to take right now."

## When to use

- Immediately after `adopt` finishes, if the user hasn't already been shown around.
- User asks: "tour", "what did cairn install", "show me my habitat", "what do I do now",
  "help me get started with cairn."
- User seems stalled — inspecting files but not editing them.

Do NOT invoke for:
- Users who have clearly customized their habitat already (non-empty MEMORY.md, populated
  LAWS.md beyond the seed laws).
- General "how does cairn work" questions — answer those directly without a full tour.

## Steps

1. **Confirm scope in one line.** "I'll walk you through the four things cairn installed
   and help you take the first concrete action. Sound good?" Wait for yes/no.

2. **The four layers, one line each:**
   - `.cairn/CLAUDE.md` — cairn's context sections, pulled into every session by the one
     import line in your project's `CLAUDE.md`/`AGENTS.md`. Needs one paragraph
     describing what this work effort is.
   - `.cairn/LAWS.md` — your non-negotiables. Ships with 7 domain-agnostic seed laws + a
     template. Add your own as you hit "never again" moments.
   - `.cairn/memory/MEMORY.md` — persistent cross-session memory index. Grows over time
     as the agent learns about you, your projects, and your preferences. Starts empty.
   - **Skills** — installed via your harness's cairn package (not files in the project),
     invoked as `/name`. Four categories: maintenance (`reflect`, `plan`, `prune`,
     `audit`, `tour`, `feedback`), collaboration (`reframe`, `bridge`, `advocate`),
     cross-perspective (`peer-review`, `session-distill`), and artifact
     (`note`, `spec`, `program`, `round-review`, `fast-execute`, `prompt-evolve`,
     `lra`). The skills README that ships with the package covers the taxonomy.

3. **Pick the highest-leverage first action.** Usually: fill in `.cairn/CLAUDE.md`'s
   "What this is" section. One paragraph. The agent reads this every session, so spending
   60 seconds here compounds across every future conversation.

4. **Offer to help right now.** "Want me to ask you a few questions and draft
   `.cairn/CLAUDE.md` based on your answers? Or would you rather write it yourself?"
   Either path is fine. Don't push.

5. **Point to the next step.** After `.cairn/CLAUDE.md` is drafted:
   - "Skim `.cairn/LAWS.md`. The 7 seed laws apply broadly — read them and decide which
     to keep, edit, or delete. Add one domain-specific law of your own."
   - "Memory will grow on its own as we work together. You don't need to populate it now."
   - "When this session ends, say `reflect` — I'll propose memory entries and write a
     `HANDOFF.md`. Next session, the agent reads `HANDOFF.md` and picks up where we
     stopped. Reflect → HANDOFF → read-at-start is cairn's session-loop ritual; it's
     how persistence stays alive."

## Output

Under ~250 words. Four layers explained, one concrete first action, one offer to help.
Skip the preamble and the outro. End with the help offer as a question.
