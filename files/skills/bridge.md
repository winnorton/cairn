---
name: bridge
description: Structure cross-session context relay when the user carries output, observations,
  or findings from another agent session into this one. Use when the user pastes agent
  output from elsewhere, shows a screenshot of another session, says "the other agent said",
  "check the X session", or similar. Also use proactively when this session produces output
  clearly relevant to another effort — flag it for bridging. Supports the human's inter-
  session communication job (the most frequent human move observed in the cairn build
  transcript). Do NOT use for standalone code snippets the user is asking about, or as
  a substitute for plain "read this file" / "answer this question" prompts.
---

# Bridge

Cross-session relay is the highest-frequency, highest-cognitive-load move the human
makes in multi-agent collaboration — read the other session, judge what matters, copy
it, contextualize it, paste it. This skill structures that handoff so less is lost in
transit and the human doesn't have to invent the shape each time.

## Why this skill exists

Humans running parallel agent sessions become the inter-session communication layer.
They do the work of: *read agent A's output → decide what agent B needs → rewrite it
enough that B can act on it*. That's cognitively expensive. The agent can't do the
first two steps (it can't see the other session), but it CAN structure the third
(receive context cleanly, confirm what to do with it).

## When to use

**Incoming bridge** (human → this session):
- User pastes output from another agent (screenshot, excerpt, copied text).
- User says "check the X session," "the other agent said," "they found that…"
- User references work happening in parallel without explicit paste ("the research agent thinks…").

**Outgoing bridge** (this session → elsewhere):
- You produce output clearly relevant to another effort the user has mentioned.
- Flag it proactively: *"This finding is relevant to [the X session]. Want me to
  summarize for bridging, or paste as-is?"*

Do NOT invoke for:
- Standalone code/doc requests ("write this function"). That's a request, not a bridge.
- File reads / explicit references to artifacts in this workspace. Those are direct.
- Every mention of "the other thing" — only when context is actually being carried.

## Steps

1. **Identify the source.** Which session, workspace, or agent is the context coming
   from? If unclear, ask in one line: *"This is from the [research / build / test]
   session, right?"* Source identification is free orientation for future readers.

2. **Extract the key finding.** One sentence. Not a summary of the pasted text — the
   specific claim, observation, or request. Strip framing and restate.

3. **Ask what to do with it.** Three options cover most cases:
   - **Assess** — judge it, agree/disagree, note what's sharp or off.
   - **Integrate** — incorporate into current work (memory, a doc, a plan).
   - **Act** — execute something based on it (write code, file an issue, ship a fix).

4. **If acting, preserve attribution.** When committing, writing to memory, or filing
   an issue, note the source in durable output. "Per [Cairn Research session's analysis]…"
   or "(Originated in [session name])." Future sessions can trace the lineage.

5. **For outgoing bridges**, offer a compact handoff package: source + key finding +
   recommended action. Let the human carry it.

## Output

**Incoming:** source identification + one-sentence key finding + assess/integrate/act
question. Under ~100 words.

**Outgoing:** one-sentence flag + source ("this current work" or specific artifact) +
key finding + one suggested action for the receiving session.

No preamble. The bridge is the value; padding is noise.
