# Laws — [Project / Effort Name]

Non-negotiable rules for this work effort. Violating one will break the project or the workflow.

This file is a living document. Agents should load it into every session. Users should review
it periodically — retire what's obsolete, add what you've learned the hard way.

---

## How to write a law

Every law in this file follows the same shape:

```
### N. <Rule>

**Why:** <The motivation. Often a past incident, a strong preference, or a constraint you
can't violate. Without a why, no one can judge edge cases.>

**How to apply:** <When and where this rule kicks in. Without this, agents over-apply
or miss the case entirely.>
```

Five meta-rules govern the laws themselves:

1. **Observable, not vibes.** "Be careful" is not a law. "Never run `rm -rf` without confirmation" is.
2. **Ranked by blast radius.** Most-harmful-if-violated first. Lower numbers are more dangerous.
3. **Why + How to apply are mandatory.** Without them, the law doesn't survive contact with edge cases.
4. **Laws expire.** Review this list periodically. Retire laws that no longer apply.
5. **Cite in written output when applying.** When an agent applies a law, it cites inline:
   `[LAW 3]`. The citation must appear in **durable output** — files the agent writes or
   edits, notes, commits, research documents — because that is what `/audit` can scan.
   Conversational citations in the reply that don't reach disk produce **zero** audit
   signal. The rule: when a law shapes something you're writing down, cite it in the
   thing you're writing down. If you're only talking (no files produced), a citation is
   optional courtesy. Noise is tolerable; the signal feeds the pruning loop.

---

## Seed laws (domain-agnostic)

These apply to nearly any work effort. Keep, edit, or delete as fits your domain.

### 1. Plan before executing anything hard to reverse

**Why:** Irreversible actions — deletions, force-pushes, published messages, database migrations,
sent emails — can't be undone by noticing the mistake afterward. The cost of a 30-second
plan is tiny; the cost of undoing a mistake can be hours or impossible.

**How to apply:** Before any action that can't be trivially reversed, state the plan in one
sentence and wait for confirmation. Local file edits in a clean git tree don't need this;
anything touching shared state, external systems, or published artifacts does.

### 2. Confirm before actions with blast radius beyond the local sandbox

**Why:** Users approve an action for a scope. That scope does not auto-extend. "Yes, commit"
is not "yes, push." "Yes, push" is not "yes, force-push to main." Scope creep on approvals
is how accidents happen.

**How to apply:** When an action affects shared state (remote branches, databases, external APIs,
other users), ask for explicit confirmation at that exact scope — even if the user approved
a smaller version minutes ago.

### 3. Surface assumptions — don't encode them silently

**Why:** A silent assumption that turns out wrong becomes a bug, a misleading doc, or a wasted
hour. Naming the assumption out loud lets the user correct it in seconds.

**How to apply:** When you infer something the user didn't state (their environment, their
preferences, what "done" means, which of two interpretations they meant), say it in one
line before acting on it. If the assumption is load-bearing, ask rather than state.

### 4. Prefer editing existing artifacts to creating new ones

**Why:** New files multiply surface area. Two partially-overlapping docs are worse than one
good doc. Scattered artifacts rot independently.

**How to apply:** Before creating a new file, check whether an existing one could hold the
change. Create new files only when genuinely needed, not when convenient.

### 5. Pause to reflect at natural checkpoints

**Why:** Substantive work produces signal worth persisting across sessions — memory
entries, law candidates, plans — but only if a reflection step fires to capture it.
Work without reflection accumulates output; reflection turns output into habitat. In
cairn's own early data, the agent that skipped reflection produced 1,600+ lines of
research and zero memory entries. The sessions that invoked `/reflect` produced
durable habitat artifacts.

**How to apply:** At natural checkpoints — end of a deep-dive, completed substantive
chunk, hit a milestone, before switching context — proactively propose `/reflect`.
Don't wait for the user to remember to ask. The user can decline any proposed
reflection; default to offering. For workspaces with declared downstream consumers
(see `CLAUDE.md`), reflection also produces distillate for those consumer habitats,
not just the current one.

### 6. Root-cause, don't route-around

**Why:** Bypassing a failing check (skipping a hook, ignoring a test, catching-and-swallowing
an error) makes the symptom disappear but leaves the underlying problem. The problem then
resurfaces somewhere more expensive.

**How to apply:** When blocked by a failing check or tool, diagnose why it's failing before
working around it. Workarounds are legitimate, but only after you understand what you're
working around and have flagged it.

---

## Your laws

<!--
  Add domain-specific laws below. Number them continuing from above.
  Most-harmful-if-violated first. Keep each law testable. Include Why and How to apply.
-->
