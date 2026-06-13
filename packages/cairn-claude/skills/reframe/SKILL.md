---
name: reframe
description: Generate 2-4 alternative framings of the current problem so the user can
  break out of convergent thinking. Use when the user says "reframe", "another angle",
  "what am I missing", "try again differently", or when work has been circling a
  solution that feels inadequate. This is a user-supporting skill — it helps the human
  do the reframing job, which is their complement to context provision. Do NOT invoke
  for clear questions with clear answers, or when the user is deliberately converging.
---

# Reframe

Generate alternative framings of the current problem or decision so the user can see
solutions their current framing hides.

## Why this skill exists

Agents converge toward patterns in training data. When the right answer is outside that
convergence, agents can't reach it alone — they need the human to rotate the solution
space. But humans often can't generate reframes on demand either; it's genuinely hard
to see past your own framing.

This skill is cairn's direct support for the human's reframing job. The user invokes,
the agent generates alternative framings, the user picks one to explore (or rejects all
and the conversation continues).

## When to use

- User says: "reframe", "another angle", "what am I missing", "am I stuck", "think
  about this differently", "is there a different way to look at this?"
- Work has been circling a solution that feels wrong but you can't name why.
- Two candidate solutions both feel inadequate — might mean the *problem* is framed
  wrong, not the solution.
- You (the agent) notice you're producing near-duplicate candidates — all variations
  on one axis. That's a convergence signal; offer `/reframe` proactively.

Do NOT invoke for:
- Clear questions with clear answers.
- When the user is happily converging on a solution.
- Every problem by default — reframing is a sometimes-move.

## Steps

1. **State the current framing in one sentence.** "You're treating this as [X, with
   axis Y]." Naming the current frame is half the work — it makes the constraint visible.

2. **Generate 2-4 alternative framings.** Each is a genuinely different lens:
   - *Axis rotation*: "What if the axis isn't <current> but <orthogonal>?"
   - *Unit decomposition*: "What if this isn't one thing but several with different rules?"
   - *Layer shift*: "What if we're solving the wrong layer — the problem is one level up/down?"
   - *Constraint inversion*: "What if the constraint is the solution? What if the 'problem' is load-bearing?"
   - *Time flip*: "What if the question is 'what happens next' rather than 'what is now'?"
   - *Actor swap*: "What if this is the user's problem to solve, not the system's?"

   Mix styles — don't produce three axis-rotations. Cover different dimensions.

3. **For each framing, name the solution space it opens.** Not just "another frame"
   but "with this frame, the solutions available are X, Y, Z — which don't exist in
   the current frame."

4. **Wait for the user to pick one** — or to say "none of these, keep going." Don't
   recommend a frame; the user is the one reframing. Your job is to surface options.

## Output

Compact. Current framing + 2–4 alternatives (each with solution-space preview) + the
pick-or-reject prompt. Under ~250 words. No preamble, no meta-commentary.

End with: "Pick one to explore, or none to stay in the current frame?"
