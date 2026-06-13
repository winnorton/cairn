# NOTE — Antigravity CLI (agy) plugin channel: assessment + empirical probe

> Filed: 2026-06-11 · **Updated: 2026-06-13** (resume after a power failure
> interrupted the probe) · Status: open · Source: maintainer pointed at
> https://antigravity.google/docs/cli-plugins the same day `@winnorton/cairn-pi`
> published. Official page is JS-walled; facts below were **verified hands-on
> against agy 1.0.7 on this machine**. The 2026-06-13 pass added binary +
> filesystem + `agy changelog` verification after scripted `agy --print` proved
> non-viable (see Method note).

## Verified facts (agy 1.0.7)

- Subcommands: `agy plugin list | import [gemini|claude] | install <target> |
  uninstall <name> | enable <name> | disable <name> | validate [path] |
  link <mp> <target>`. There is **no `inspect` / `skill` / `skills`
  subcommand** in 1.0.7 (the community-documented `agy inspect` does not exist
  here; those args fall through to generic help).
- `install <target>` accepts a **local directory**, a `plugin@marketplace`
  form, **AND a GitHub subpath with branch resolution** — per `agy changelog`:
  *"installing plugins directly from GitHub subpaths (with branch resolution)."*
  So a git-hosted `cairn-agy` IS directly installable. (Corrects the 06-11
  "directory-only" read — that was a misread of an `install --help` error
  string, not a real source-type limit.) `validate` checks five categories:
  skills, agents, commands, mcpServers, hooks.
- Minimal `plugin.json` is just `{name, version, description}` — validated
  `[ok]`, staged verbatim.
- **Skills load in BOTH forms: cairn's `<name>/SKILL.md` subdir AND flat
  `<name>.md`** — a probe shipping one of each reported `skills: 2 processed`.
  Cairn's existing skill files work unchanged; no transform step needed.
  `SKILL.md` appears 10× in the agy binary's embedded strings — first-class.
- Staging: `~/.gemini/config/plugins/<name>/` (tree copied as-given), tracked
  in `~/.gemini/config/import_manifest.json`
  (`{name, source, importedAt, components}`). The community-documented
  `~/.gemini/antigravity-cli/plugins/` path is **stale** — that tree holds
  runtime state (brain/, conversations/, settings.json); the live config root
  with plugins/, skills/, mcp_config.json is `~/.gemini/config/`. `agy
  changelog` corroborates: MCP config migrated from legacy `mcp_config.json`
  to `config/mcp_config.json`.
- Uninstall is clean: staged dir + manifest entry both removed.
- `agy plugin import claude` exists — agy can import **Claude Code plugin
  format** directly. (`import gemini` migrates Gemini CLI extensions.)

## Follow-up verification — 2026-06-13 (the headline)

**Workspace skill path is binary-confirmed, not web-sourced.** The agy.exe Go
binary (142.9 MB) embeds the literal path templates:

- `{workspace}/.agents/skills` — workspace **skills**
- `{workspace}/.agents/agents` — workspace **subagents**

plus prose strings "path to your `.agents/`" and "skills live under `.agents/`".
This deterministically confirms agy auto-discovers `<project>/.agents/skills/` —
the exact dotted path Pi also scans. No model call needed; the path is hardcoded.

**Installed-state finding (cairn already in agy's global skills).** agy's global
skills dir `~/.gemini/config/skills/` already contains a cairn install:
`advocate, audit, bridge, feedback, note, plan, program, prune, reflect,
reframe, resume, review, spec, tour` as `<name>/` subdirs — PLUS stale
pre-v0.12.1 **flat** duplicates (`advocate.md, bridge.md, plan.md, reflect.md,
reframe.md, resume.md, README.md`) and the **legacy `review/`** (renamed to
`peer-review` in v0.13.1). Same residue class as the Pi `404`-bodies finding:
an old adopt-era install coexisting with newer format. Cleanup item — dedupe to
subdir form and drop `review/` once confirmed unused. (Confirms global path =
`~/.gemini/config/skills/`, the literal `config/skills` substring is absent from
the binary because the dir is composed at runtime from the config root.)

**Method note (why this pass used binary/fs/changelog, not behavioral).**
Scripted `agy --print -p "…"` produced **no captured output** across two
attempts (one killed by the power failure, one clean) under piped/non-TTY stdin
on Windows — agy print mode appears to require an interactive terminal. The
deterministic surfaces (binary string-grep, filesystem, `agy changelog`) gave
firmer answers than a model round-trip would have. If a future pass needs
behavioral proof (e.g. does a workspace skill actually fire), run agy
interactively and have the user paste the result — don't script `--print`.

## Channel assessment vs cairn-pi

A `cairn-agy` plugin is feasible with the exact `packages/cairn-pi` pattern —
same sync-script + drift-guard, different manifest (3-field `plugin.json`
instead of the npm `pi` field). Distribution options, now that GitHub install
is confirmed:

- (a) **`agy plugin install github:winnorton/cairn//packages/cairn-agy@main`**
  (subpath + branch) — direct from the repo, no tarball needed. Strongest path.
- (b) `plugin@marketplace` form (registration via `agy plugin link <mp>
  <target>`, mechanics still unprobed).
- (c) the interesting one — **ship the v0.15 Claude Code plugin and let agy
  `import claude` it.** One artifact, two harnesses.

But the cheapest channel of all needs **no plugin**: drop cairn skills at
`<project>/.agents/skills/` and both Pi and agy auto-load them (see below).
That reframes whether a bespoke `cairn-agy` package is even worth building
vs. leaning on `.agents/` + route (c) for the v0.15 thread.

## Strategic finding for SPEC_AGENTS_UMBRELLA (v0.14) — now binary-verified

Two of cairn's three primary environments (Pi, Antigravity-CLI) auto-discover
`<project>/.agents/skills/` — Pi per its docs, **agy per its own embedded
binary path template** (verified 2026-06-13). The umbrella spec moves cairn
state to **undotted** `<project>/agents/`, which NEITHER harness auto-loads.
The dot is load-bearing: skills at `.agents/skills/` auto-load in Pi AND agy
with zero install; skills at `agents/skills/` load in neither. **Resolve
`agents/` vs `.agents/` in the umbrella spec before executing it** — the
choice now has concrete cross-harness consequences, not aesthetic ones.

## adopt.md gap

The Antigravity section (validated 2026-04-25) predates the CLI entirely — it
documents IDE paths (`~/.gemini/antigravity/`). agy's real paths (verified):
`~/.gemini/config/{plugins,skills,mcp_config.json}` global +
`<project>/.agents/skills/` workspace. Needs an agy branch in the Step 1
detection tree + Step 3 resolutions when Antigravity-CLI adoption becomes real.
Add a re-adoption cleanup for the stale `~/.gemini/config/skills/` flat-format
+ `review/` residue (mirror of the Pi `404` cleanup just added to adopt.md).

## Next triggers

1. **Umbrella-spec execution → resolve the `.agents/` dot question first.** Now
   backed by binary evidence that both Pi and agy key on the dotted path.
2. v0.15 plugin-packaging design → evaluate route (c): Claude Code plugin as
   the master artifact, agy consumes via `import claude`, pi keeps npm — vs.
   the zero-package `.agents/skills/` drop.
3. If a bespoke `cairn-agy` is pursued → probe the still-unverified bits:
   `agy plugin link` marketplace mechanics, and a behavioral test that a
   `.agents/skills/` skill actually fires (run agy interactively, paste result —
   not scripted `--print`).
