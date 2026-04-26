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

## Delivery (three-level degradation)

Try delivery channels in order — use the next only when the previous fails or isn't
available. The structured payload is the same for all three; only the transport differs.

### Level 1 — POST to the cairn feedback endpoint (preferred)

The manifest lists multiple endpoint URLs at `manifest.endpoints.feedback.urls`. Try them
in array order — on the first success, stop. Current array:

1. `https://cairn-feedback-591252228833.us-central1.run.app/feedback` — Cloud Run direct URL, always reliable.
2. `https://cairn.winnorton.com/feedback` — custom domain, may not resolve during initial CNAME propagation.

Build the JSON payload:

```
POST <url>
Content-Type: application/json

{
  "category": "gap" | "bug" | "skill-idea" | "clarification" | "docs" | "design",
  "severity": "low" | "medium" | "high",
  "title":    "<short, <=120 chars>",
  "body":     "<markdown body; What I observed / expected / Suggested action / Context>",
  "context":  "<optional>",
  "cairn_version": "<e.g. 0.6.1>",
  "environment":   "<Claude Code, Cowork, claude.ai, etc.>"
}
```

For each URL in the array, attempt the POST. On:

- **200** `{ "issue_url": "...", "issue_number": N }` — report the URL to the user, done.
- **400** (invalid payload) — don't retry with a different URL; fix the payload per
  `retry_strategy` and POST again to the same URL, or stop filing if the fix isn't clear.
- **429** (rate limited) — the limit is per-endpoint-IP; try the next URL or fall through
  to Level 2 if all URLs in the array are rate-limited.
- **502** (GitHub API failed) — upstream issue, not endpoint issue; try next URL, or
  fall through to Level 2.
- **Network error / DNS failure / timeout** — endpoint unreachable; try next URL.

If all URLs in the array failed, fall through to Level 2.

### Level 2 — `gh issue create` (CLI fallback)

If the endpoint is unreachable and `gh` CLI is available and authenticated, file directly:

```
gh issue create \
  --repo winnorton/cairn \
  --title "<title>" \
  --body "<formatted body>" \
  --label "agent-filed,<category>,<severity>"
```

Format the body as it would appear on GitHub — include all the fields from the JSON
payload as prose.

### Level 3 — Draft for user to paste (last resort)

If neither the endpoint nor `gh` is available, print the fully-formatted issue body and
tell the user: *"I'd like to file this to cairn — can you paste it at
https://github.com/winnorton/cairn/issues/new?"* This is the only path that requires
the active user's help.

## Notify the user (always)

After any of the three paths succeed, tell the user once, briefly:

- **Level 1/2 success:** *"I filed feedback to cairn about &lt;title&gt; — &lt;issue URL&gt;. Continuing."*
- **Level 3 draft:** *"I drafted feedback about &lt;title&gt; — paste it at the link above when convenient, then we'll continue."*

Do not discuss further unless the user asks.

**Never file silently.** The user always hears about it. Once, briefly, with a link.

## Rate limit yourself

- Don't file more than once per session unless the items are genuinely distinct.
- If you're about to file and realize you'd be repeating an earlier filing this session, consolidate.
- If you've filed twice and are considering a third, step back — you may be over-reporting.

## Output

- Either: "Filed to cairn: &lt;URL&gt;" (one line, Level 1 or 2)
- Or: a clean issue body + the new-issue URL (for user to paste, Level 3)

Nothing else. No preamble.
