# The Two-File Habitat: When Minimum Viable Meets Maximum Portable

## The convergence

Two independent questions — "what's the least an agent needs?" and "what works across any agent?" — arrived at the same answer: a context file and a memory index. Two files.

This wasn't planned. The minimum viable habitat analysis stripped cairn layer by layer, asking what breaks first. The portability analysis split cairn into a data layer (readable by any agent) and a protocol layer (Claude-specific). The minimum and the maximally portable turned out to be identical.

When two independent lines of inquiry converge on the same boundary, it usually means the boundary is real.

## Why context + memory is the floor

**Context** (a file describing what this work effort is) solves the cold-start problem. Without it, every session begins with "what are we doing?" — the agent either asks or guesses. A single file with a paragraph of orientation eliminates this entirely. It's the highest-leverage file in any agent's environment because it's read first and shapes everything that follows.

**Memory** (an index of things worth remembering) solves the amnesia problem. Without it, the agent repeats mistakes, asks questions already answered, and loses track of decisions made in prior sessions. A flat list of entries — who the user is, what went wrong last time, what external systems matter — is enough for continuity.

Everything beyond these two files is graduated:

- **Laws** arrive when you hit your first "never again" moment. Before that, they're empty templates.
- **Skills** arrive when you want to standardize a process you've already done manually. They don't enable new capabilities; they make existing ones consistent.
- **Typed memory** (subdirectories, citation conventions, hygiene rules) arrives when the flat memory index gets noisy. Below ~10 entries, it's overhead.

## Why this is also the portability boundary

The context file is just documentation. Any agent — Claude, GPT, Gemini, a local LLM with file access — can read a markdown file that says "here's what this project is." The concept is universal even if the filename (CLAUDE.md) isn't.

Memory entries are structured markdown with YAML frontmatter. The content — who the user is, what they've decided, what went wrong — is agent-agnostic. Any system that reads files gets this for free.

The protocol layer (citations, audit loops, skill trigger matching) is where portability drops off. These require the agent to follow conventions that aren't part of any agent's training. A Claude agent in cairn's ecosystem follows them because the habitat files explain how. A GPT agent reading the same files might follow them if it reads carefully — or might not.

This creates a natural gradient:

| Layer | Portable to | What you get |
|---|---|---|
| Context + memory | Any agent | Orientation + continuity |
| + Laws | Any agent that reads instructions | Behavioral constraints |
| + Skills | Agents with skill-matching harness | Process standardization |
| + Citations + audit | Agents following cairn protocols | Usage-aware hygiene |
| + Feedback | Claude/Cowork ecosystem | Maintainer feedback loop |

Each step adds value for agents that can follow the protocol. No step takes away value from agents that can't — the data layer works regardless.

## What this means for habitat design

**Start with the floor.** If you're designing a persistent environment for agents, begin with context + memory. Don't add structure until the content demands it. Templates without substance are worse than substance without templates — they signal "this is important" for things that are empty.

**Layer protocols on top, not underneath.** Citation conventions, audit loops, and skill matching are valuable but not foundational. An agent that reads context and memory but ignores citations still gets 60% of the value. Design so that each protocol layer is additive, not required.

**The minimum is the most universal thing you can build.** This is the practical takeaway: if you want to build something that works across agents, build the smallest possible thing. Complexity is where portability goes to die.
