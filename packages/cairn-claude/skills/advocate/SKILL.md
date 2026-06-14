---
name: advocate
description: Rotate the observer position from builder to end-user. Simulate how a
  first-time user would experience what's about to ship. Use before finalizing user-
  facing output (docs, flows, install previews, UI copy, onboarding), when the user
  says "advocate", "fresh eyes", "user perspective", or when you're about to declare
  something done that others will interact with. Supports the user's UX-observer role —
  the move captured in feedback like "confusing for first time user" or "this is
  taking the new agent along time." Do NOT use for internal code with no user-facing
  surface, or mid-work (wait for a completion point).
---

# Advocate

Rotate the observer position. The builder sees the system they built. The end-user
sees a cold start. Before shipping anything with a user-facing surface, simulate the
first-time user's experience so obvious friction gets caught *before* real users hit it.

## Why this skill exists

An agent builds things; the human watches other people use them. In the cairn build
session, the human provided UX observations the builder could not generate on its own —
*"confusing for first time user"*, *"this is taking the new agent a long time in the
adopt process."* Each observation required an external user the builder had never seen.

The agent has enough information to simulate that perspective. It just doesn't think to
do it unprompted. This skill is the prompt.

## When to use

- Before finalizing anything with a user-facing surface: docs, flows, install previews,
  error messages, UI copy, onboarding text, skill descriptions, prompts.
- User says "advocate", "fresh eyes", "what would a user think", "first-time UX".
- You're about to call something done. Run `/advocate` as a pre-ship check, like
  running tests.

Do NOT invoke for:
- Internal code with no user-facing surface.
- Mid-work — /advocate is a completion-point check, not an interruption.
- Configuration, infrastructure, build scripts — anything the end user never reads.

## Steps

1. **Name the user being advocated for.** Specificity matters. "A first-time cairn
   adopter reading adopt.md." "A user 30 seconds after invoking `/tour`." "A developer
   skimming this skill description to decide whether to invoke." Different users see
   different friction.

2. **Simulate a cold read.** What do they see first? Do they know what to do? What's
   unexplained? What assumes vocabulary they haven't learned yet? What takes too long?

3. **Surface 2–4 specific friction points.** Not "needs more polish" — specific:
   *"The 4-option tier picker assumes the user knows what 'seed/grow/structure/full'
   mean; a first-time user is picking unexplained words."* Concrete, located, actionable.

4. **Propose mitigations.** For each friction point, one-sentence fix: cut the menu,
   reorder the fields, rename the jargon, add a one-line explainer.

5. **Return to the human with the list.** They judge which mitigations to accept. Don't
   auto-apply — the mitigations are surfaced as options, not mandates.

## Output

- One line naming the simulated user
- 2–4 friction points, each located specifically
- One mitigation per friction point
- Short ask at end: *"Mitigate which?"*

Under ~200 words. The advocacy is the value — no preamble, no reassurance.

## Relationship to other skills

- `/reframe` rotates the *problem axis*. `/advocate` rotates the *observer position*.
  Different moves; both expand what the agent considers.
- `/tour` is what the user receives. `/advocate` is what the builder runs before
  producing a `/tour`-quality artifact.
- `/reflect` looks backward (what happened). `/advocate` looks forward (what will the
  user hit).
