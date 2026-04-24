---
name: feedback
description: File structured feedback about cairn itself — the framework, templates, skills,
  docs — directly to the cairn repo, without requiring the active session user to relay it.
  Use when you (the agent) notice a gap, bug, confusing instruction, or missing skill in
  cairn. Do NOT use for issues in the user's own project, general bug reports unrelated to
  cairn, or as a substitute for in-session clarification the user can answer immediately.
  Tell the user after filing, never before. Never file without a clear, specific improvement.
---

# Feedback

When you (the agent) hit friction with cairn itself, file it. Cairn depends on agent reports
to improve — you're the one using the framework, so you see the gaps first. The active
session user should not need to relay your observations to the cairn maintainer.

> **What this skill adds:** a competent agent will often file feedback organically when
> it notices a gap. This skill's value is *standardization* (consistent issue body
> format), *discoverability* (new agents know filing is expected), and *sanitization
> reminders* (PII pre-flight). Not new behavior — enabled consistency.

## Scope

**File for:**
- Gaps in cairn's own files (LAWS.md seed laws, skill descriptions, adopt.md, README).
- Missing capabilities you reached for and didn't find (e.g., "no skill for X").
- Confusing or ambiguous instructions in cairn skills, templates, or adopt.md.
- Documentation errors (broken links, outdated references, typos).
- Design oversights you think another cairn user would hit too.

**Do NOT file for:**
- Issues in the user's own project (those go to the user's issue tracker).
- General AI/tooling complaints unrelated to cairn.
- Questions the user can answer in the current session.
- One-off friction that isn't likely to affect others.
- Anything you could fix yourself in-session by editing the user's local files (suggest that instead).

## Pre-flight checks

Before filing, confirm:
1. Is this cairn-specific? (If it's about the user's work, stop.)
2. Is the feedback actionable? (If it's just "this feels off," sharpen it or don't file.)
3. Does it contain any PII, credentials, file paths from the user's machine, or proprietary
   code? (If yes, sanitize before filing. Cairn issues are public.)

## Steps

1. **Structure the submission** as:
   ```
   Category: gap | bug | skill-idea | clarification | docs
   Severity: low | medium | high
   Title: <60 chars, specific>
   Body:
     What I observed: <what you hit, where>
     What I expected: <what would have worked>
     Suggested action: <concrete fix if you can think of one>
     Context: <cairn version, environment (Claude Code/Cowork), sanitized excerpt if useful>
   ```

2. **File it.** Preferred channel: `gh issue create` against `winnorton/cairn` if the `gh`
   CLI is available. Command shape:
   ```
   gh issue create \
     --repo winnorton/cairn \
     --title "<title>" \
     --body "<formatted body>" \
     --label "<category>,<severity>,agent-filed"
   ```

3. **Fallback if `gh` is unavailable.** Print the fully-formatted issue body and the URL
   `https://github.com/winnorton/cairn/issues/new` and tell the user: "I'd like to file
   this to cairn — can you paste it at this URL?" This is the *only* case where the user
   is asked to help.

4. **Notify the user, once, after filing.**
   - With `gh`: "I filed feedback to cairn about <title> — <issue URL>. Continuing."
   - Fallback: "I drafted feedback about <title> — paste it at the link above when convenient, then we'll continue."
   - Do not discuss further unless the user asks.

5. **Never file silently.** The user always hears about it. Once, briefly, with a link.

## Rate limit yourself

- Don't file more than once per session unless the items are genuinely distinct.
- If you're about to file and realize you'd be repeating an earlier filing this session, consolidate.
- If you've filed twice and are considering a third, step back — you may be over-reporting.

## Output

- Either: "Filed to cairn: <URL>" (one line)
- Or: a clean issue body + the new-issue URL (for user to paste), one request for them to help

Nothing else. No preamble.
