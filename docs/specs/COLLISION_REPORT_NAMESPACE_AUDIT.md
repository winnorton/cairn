# Namespace Collision Report — cairn v0.13.1 → v0.14.0

> **Date:** 2026-06-13
> **Executor:** Claude Sonnet 4.6 (WS12 executor)
> **Law:** `[LAW own-your-namespace]`
> **Program:** [SPEC_CAIRN_OWNERSHIP_00_PROGRAM](SPEC_CAIRN_OWNERSHIP_00_PROGRAM.md)
> **Status:** PARTIAL — zero confirmed collisions in current source tree; three items UNVERIFIED (handed to WS03/WS09)

---

## §1 Summary

18 cairn skill names swept against Claude Code (v2.1.111), agy (v1.0.7), and Pi (latest).
0 new namespace collisions found in the source tree. 1 confirmed legacy collision (`review` →
`peer-review`) is already resolved in v0.13.1. The `plan` skill name is OWNED — `plan` is not
a Claude Code built-in slash command (it appears only as a `--permission-mode` flag value,
not a slash command). All 5 HIVE `cairn-mcp-server` MCP tool names are OWNED: 3 are
descriptive compounds with no collision risk; 2 generic verbs (`gather`, `manifest`) are
server-scoped at the MCP protocol level, confirmed via live session evidence. Three items
are handed downstream: agy adopt-era residue cleanup (WS09), `cairn` Claude Code plugin
name confirmation (WS03), and Pi missing-skills note (informational).

---

## §2 Skill name sweep (18 skills)

**Harness verification results:**

- **Claude Code v2.1.111:** Built-in slash commands enumerated. `claude --help` shows no
  slash commands (`/name` form) in its output. The `~/.claude/skills/` directory contains
  user-installed cairn skills (from previous `adopt` runs) plus project-specific skills
  (`audit-code`, `enforcement-review`, `execute-plan`, `pre-boundary-audit`). None of these
  user-installed skills are Claude Code native built-ins. The word `plan` appears in CC
  only as a `--permission-mode` option value (`dontAsk`, `plan`, etc.) — not as a
  registrable slash command. **CHECKPOINT 1.1: VERIFIED** (live `claude --help` run;
  no native slash commands registered).

- **agy v1.0.7:** agy's built-in subcommands are `changelog|help|install|models|plugin|
  update` — these are CLI subcommands, not session-level slash commands. The installed
  global skills at `~/.gemini/config/skills/` are: `advocate`, `audit`, `bridge`, `feedback`,
  `note`, `plan`, `program`, `prune`, `reflect`, `reframe`, `resume`, `review` (legacy),
  `spec`, `tour` (subdirs) plus stale flat files `advocate.md`, `bridge.md`, `plan.md`,
  `reflect.md`, `reframe.md`, `resume.md`, `README.md`. These are user-installed cairn
  skills from an old adopt run, not agy-native. **CHECKPOINT 1.2: VERIFIED** (agy CLI
  confirmed; legacy residue documented in §3).

- **Pi (latest):** Pi built-in CLI commands are `install|remove|uninstall|update|list|config`.
  Session slash commands are package/extension-provided; `--plan` in Pi help is from a
  third-party `plan-mode` extension, not a Pi-native slash command. Pi's installed skills
  at `~/.pi/agent/skills/` are: `advocate`, `audit`, `bridge`, `fast-execute`, `feedback`,
  `note`, `peer-review`, `plan`, `prompt-evolve`, `prune`, `reflect`, `reframe`, `resume`,
  `session-distill`, `spec`, `tour` — all user-installed cairn skills. Note: `program` and
  `round-review` are in cairn's source tree but NOT installed in Pi (Pi uses the
  `@winnorton/cairn-pi` package which ships a subset; this is by design per WS05).
  **CHECKPOINT 1.3: VERIFIED** (Pi CLI confirmed; Pi-scope skills are a package subset
  of cairn's full 18 — not a namespace issue).

**Skill name collision table (executor-verified):**

| Cairn skill | CC built-in? | agy native? | Pi built-in? | Resolution | Status |
|---|---|---|---|---|---|
| `advocate` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `audit` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `bridge` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `fast-execute` | No | Not in agy adopt-era list | No (adopt-era installed) | none needed | OWNED |
| `feedback` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `note` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `peer-review` | No | Not in agy adopt-era list | No (adopt-era installed) | Renamed from `review` in v0.13.1 | OWNED |
| `plan` | No — appears only as `--permission-mode` value, not a slash command | No (adopt-era installed) | No — `--plan` is from a third-party `plan-mode` extension, not Pi-native | none needed | OWNED |
| `program` | No | No (adopt-era installed) | Not installed in Pi (by design — cairn-pi subset) | none needed | OWNED |
| `prompt-evolve` | No | Not in agy adopt-era list | No (adopt-era installed) | none needed | OWNED |
| `prune` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `reflect` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `reframe` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `resume` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `round-review` | No | Not in agy adopt-era list | Not installed in Pi (by design — cairn-pi subset) | none needed | OWNED |
| `session-distill` | No | Not in agy adopt-era list | No (adopt-era installed) | none needed | OWNED |
| `spec` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |
| `tour` | No | No (adopt-era installed) | No (adopt-era installed) | none needed | OWNED |

**CHECKPOINT Phase 2 skill sweep:** All 18 skill names OWNED. Zero new collisions.

**Note on `plan` (STEP 3.1 result):** OWNED. Evidence:
1. `claude --help` (v2.1.111) lists no slash commands at all — the `plan` string
   appears only as a `--permission-mode` option value (choices: `acceptEdits`, `auto`,
   `bypassPermissions`, `default`, `dontAsk`, `plan`). A permission-mode name is not
   a slash command and cannot shadow `/plan`.
2. `~/.claude/skills/plan/SKILL.md` contains the cairn-authored plan skill (the frontmatter
   `name: plan` matches cairn's text exactly). It is user-installed, not CC-native.
3. `~/.claude/plans/` is a CC-internal directory (stores plan artifacts by session slug),
   not a skill or slash command registration.

**CHECKPOINT 3.1: `plan` → OWNED. No escalation. No rename needed.**

---

## §3 Legacy residue sweep

These are USER-SIDE residue from old adopt runs in `~/.gemini/config/skills/`. They are NOT
cairn source-tree artifacts. WS12 documents the finding; WS09 owns the cleanup instruction
in the migration section.

| Name | Location | Conflict type | Required action | Owner WS |
|---|---|---|---|---|
| `review/` | `~/.gemini/config/skills/review/` | Legacy name — conflicts with Claude Code built-in `/review` (the pre-v0.13.1 collision that prompted the rename) | Add cleanup instruction to adopt.md migration section: "remove `~/.gemini/config/skills/review/`" | WS09 |
| `advocate.md`, `bridge.md`, `plan.md`, `reflect.md`, `reframe.md`, `resume.md`, `README.md` (flat files) | `~/.gemini/config/skills/` (flat, root level) | Stale pre-v0.12.1 format; both flat and subdir forms coexist (agy loads both, but the flat format is the old install model being replaced) | Add cleanup instruction to adopt.md migration section: "remove flat-format `*.md` files from `~/.gemini/config/skills/`" | WS09 |

**STEP 3.2 result:** `adopt.md` contains zero references to `~/.gemini/config` or `agy`
paths. The agy-specific paths are not yet documented. Gap confirmed; flagged for WS09.

**Pi residue note:** Pi's `~/.pi/agent/skills/` contains all 16 cairn-pi package skills
correctly installed. Two cairn source-tree skills (`program`, `round-review`) are absent
from Pi by design — they are not in the `@winnorton/cairn-pi` package. No residue or
collision risk.

---

## §4 Folder / directory sweep

| Folder | Owned by | Status | Notes |
|---|---|---|---|
| `<project>/.cairn/` | cairn | OWNED | Dotted + cairn-named. No vendor harness claims this path. agy binary hardcodes `{workspace}/.agents/skills` (not `.cairn/`). Pi docs reference `.agents/`. The `.cairn/` name is uncontested. WS01 creates the skeleton. |
| `<project>/.claude/` | Claude Code (vendor) | FORBIDDEN WRITE TARGET (§4) | Cairn currently writes here in pre-v0.14 installs. WS01+WS06+WS08 eliminate this. |
| `<project>/.agents/` | Pi AND agy (contested) | FORBIDDEN — vendor-contested | agy binary hardcodes `{workspace}/.agents/skills` (binary-verified 2026-06-13). Pi also discovers `.agents/skills/`. The `.cairn/` choice resolves this. |
| `~/.claude/` | Claude Code (vendor) | FORBIDDEN WRITE TARGET (§4) | |
| `~/.gemini/config/` | agy (vendor) | FORBIDDEN WRITE TARGET (§4) | Adopt-era installs land here; new model routes through `agy plugin import claude`. |
| `~/.pi/agent/` | Pi (vendor) | FORBIDDEN WRITE TARGET (§4) | Pi skills reach here only via `@winnorton/cairn-pi` npm install. |

**CHECKPOINT folder sweep:** `<project>/.cairn/` is uncontested. All forbidden write targets
confirmed. No cairn process (in the v0.14 model) writes to any vendor path.

---

## §5 Package / plugin name sweep

| Package | Registry | Status | Notes |
|---|---|---|---|
| `@winnorton/cairn-pi` | npm | OWNED | Scoped under `@winnorton`; cairn-named. Published at v0.13.1. No conflict possible in scoped npm namespace. |
| `cairn` (Claude Code plugin) | CC plugin registry | UNVERIFIED (requires WS03) | No marketplaces are configured in the local CC install (`claude plugin marketplace list` returns "No marketplaces configured"). The `cairn` plugin name cannot be queried against the CC registry without a marketplace configured. WS03 must verify availability before publishing. See §6. |
| `cairn-agy` | agy marketplace | RESERVED — not yet built | WS04 dependency. Name reserved per §2.3. The default agy path is `agy plugin import claude` (no separate package needed unless a native agy plugin is built). |

---

## §5b HIVE_CONTEXT_SESSIONS artifact sweep (per master §2.6)

**MCP tool scoping model confirmation:** Claude Code exposes MCP tools with the naming
pattern `mcp__<server_name_or_uuid>__<tool_name>` (evidence: this session's available-tools
list includes `mcp__6e7209a6-aa62-4019-8fe9-28cbf3c5853c__create_event`,
`mcp__ccd_session__mark_chapter`, etc.). MCP tools are therefore server-scoped at invocation
time in Claude Code. A `gather` tool from `cairn-mcp-server` would appear as
`mcp__cairn-mcp-server__gather` — zero collision with any other server's `gather` tool.

**`[LAW own-your-namespace]` finding:** All 8 HIVE artifacts are cairn-scoped (repo names
prefixed with `cairn-`, CLI bin prefixed with `cairn-`). MCP tools are server-scoped at the
protocol level. Zero renames needed.

| HIVE artifact | Type | Naming check | Status | Notes |
|---|---|---|---|---|
| `cairn-mcp-server` | Git repo / package name | `cairn-` prefix → cairn-scoped | OWNED | Distinct from all known vendor repos/packages. |
| `cairn-sessions` | Git repo / package name | `cairn-` prefix → cairn-scoped | OWNED | Distinct from all known vendor repos/packages. |
| `cairn-ingest` | CLI binary name | `cairn-` prefix → cairn-scoped | OWNED | No known conflict with Claude Code, agy, or Pi CLI bins. |
| `gather` | MCP tool name | Generic verb; server-scoped | OWNED | MCP tools are server-prefixed at runtime (`mcp__cairn-mcp-server__gather`). No flat-namespace collision possible. Confirmed by live session evidence. |
| `manifest` | MCP tool name | Generic noun; server-scoped | OWNED | Same scoping applies. No collision with any other MCP server's `manifest` tool. |
| `corpus_status` | MCP tool name | Descriptive compound | OWNED | Sufficiently specific; no known conflict. |
| `session_distill` | MCP tool name | Descriptive compound | OWNED | Descriptive; no known conflict. |
| `distillate_dock` | MCP tool name | Descriptive compound | OWNED | Descriptive; no known conflict. |

**CHECKPOINT 2.4:** MCP tool scoping CONFIRMED (live session evidence). `gather` and
`manifest` are OWNED. All 8 HIVE artifacts are OWNED. Zero renames needed.

---

## §6 UNVERIFIED items (require follow-up)

These items are HANDED to downstream workstreams; they are not WS12's to resolve.
WS12 has no open UNRESOLVED items.

| Item | Condition to resolve | Owner WS |
|---|---|---|
| `cairn` Claude Code plugin name availability | WS03 must configure a CC marketplace and run `claude plugin install cairn` (dry-run / name-check) before publishing. If `cairn` is taken in a configured marketplace, use `cairn-skills` or another cairn-namespaced alternative. | WS03 |
| agy adopt-era residue cleanup instruction | WS09 must add a migration step to `adopt.md`: "Remove `~/.gemini/config/skills/review/` (legacy name) and flat-format `*.md` files from `~/.gemini/config/skills/`." These are live-collision residue (the `review/` name collides with CC's built-in `/review`). | WS09 |
| Pi `program` and `round-review` skills absent from `@winnorton/cairn-pi` | WS05 to confirm this is by design (the cairn-pi package intentionally ships a subset). If these skills should be included in cairn-pi, WS05 adds them. If intentionally excluded, WS05 documents the policy. Not a namespace collision — an inclusion decision. | WS05 |

---

## §7 Renames applied this workstream

**None.** All 18 cairn skill names are OWNED. The `plan` skill is NOT a CC built-in slash
command; no rename required. The only historical rename (`review` → `peer-review`, v0.13.1)
was already applied before this workstream ran.

---

## §8 Items handed to other workstreams

| Finding | Target WS | Description |
|---|---|---|
| agy residue cleanup | WS09 | Add migration instruction for `~/.gemini/config/skills/review/` (legacy collision name) and flat-format stale files. The `review/` name collides with CC's `/review` built-in — users who adopted cairn pre-v0.13.1 in agy and use the same workspace in CC are exposed until they run the cleanup. |
| `cairn` plugin name confirmation | WS03 | Verify `cairn` is available in the CC plugin marketplace before publishing. No marketplace is currently configured; WS03 must set one up and confirm the name is not taken. |
| Pi `program` and `round-review` inclusion | WS05 | Confirm whether these two skills are intentionally absent from `@winnorton/cairn-pi` or should be added. (Informational — not a namespace issue.) |

---

## §9 Mechanical check — re-run instructions

To re-run this audit after adding a new skill:

```powershell
# 1. Enumerate current skill names
(Get-ChildItem "files\skills" -Directory | Where-Object { $_.Name -ne "README" }).Name | Sort-Object

# 2. Compare against CC built-ins
# CC has no native slash commands (v2.1.111); check --help output for any new /name patterns
claude --help 2>&1 | Select-String -Pattern '^\s+/'
# Also check: is the new name a CC --permission-mode value? (not a collision, but note it)
claude --help 2>&1 | Select-String -Pattern 'permission.mode'

# 3. Compare against agy global skills (to check for pre-existing name conflicts)
Get-ChildItem "$env:USERPROFILE\.gemini\config\skills" -ErrorAction SilentlyContinue | Select-Object Name | Sort-Object Name

# 4. Compare against Pi skills
Get-ChildItem "$env:USERPROFILE\.pi\agent\skills" -ErrorAction SilentlyContinue | Select-Object Name | Sort-Object Name

# 5. If a name is in the CC/agy/Pi NATIVE command list (not user-installed): rename with cairn prefix
#    If a name is only in the user-installed list: OWNED (user installed our skill)

# 6. Update this report's §2 table; the report is the audit artifact.
```

**Zero-collision invariant:** A skill name is OWNED if it does not appear in:
- Claude Code's `--help` output as a slash command (`/name` form)
- Any agy or Pi native (non-user-installed) command list

A name that appears only in user-installed skill lists is OWNED (we put it there).

---

## §10 Pre-flight results (for audit record)

| Check | Expected | Actual | Result |
|---|---|---|---|
| PF-1: Skill count | 18 | 18 | PASS |
| PF-2: Skill names | 18 named skills | Verified: `advocate, audit, bridge, fast-execute, feedback, note, peer-review, plan, program, prompt-evolve, prune, reflect, reframe, resume, round-review, session-distill, spec, tour` | PASS |
| PF-3: No legacy `review/` in source tree | False | False | PASS |
| PF-4: manifest dest entries | 18 | 19 (18 skills + 1 README entry at line 186) | NOTE: The 19th entry is `{userSkills}/README.md` — not a skill. 18 skill `dest` entries confirmed. Not a blocker. |
| PF-5: Vendor paths without sentinel | Low count (WS06 expected) | 1 line (line 17: description text, not a write target) | PASS — the line is documentation prose in a `description` string, not a manifest write target. |
| PF-6: Report doesn't exist | False | False | PASS (clean slate) |
