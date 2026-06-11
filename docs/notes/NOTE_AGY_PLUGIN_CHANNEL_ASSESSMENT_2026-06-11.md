# NOTE — Antigravity CLI (agy) plugin channel: assessment + empirical probe

> Filed: 2026-06-11 · Status: open · Source: maintainer pointed at
> https://antigravity.google/docs/cli-plugins the same day `@winnorton/cairn-pi`
> published. Official page is JS-walled; facts below were **verified hands-on
> against agy 1.0.7 on this machine** (probe plugin: validate → install →
> list → uninstall round-trip, all clean) except where tagged *web-sourced*.

## Verified facts (agy 1.0.7, 2026-06-11)

- Subcommands: `agy plugin list | import [gemini|claude] | install <target> |
  uninstall <name> | enable <name> | disable <name> | validate [path] |
  link <mp> <target>`.
- `install <target>` requires a **directory** (no direct git-URL); help also
  names a `plugin@marketplace` form. `validate` checks five resource
  categories: skills, agents, commands, mcpServers, hooks.
- Minimal `plugin.json` is just `{name, version, description}` — validated
  `[ok]`, staged verbatim.
- **Skills load in BOTH forms: cairn's `<name>/SKILL.md` subdir AND flat
  `<name>.md`** — a probe shipping one of each reported `skills: 2 processed`.
  Cairn's existing skill files work unchanged; no transform step needed.
- Staging: `~/.gemini/config/plugins/<name>/` (tree copied as-given), tracked
  in `~/.gemini/config/import_manifest.json`
  (`{name, source, importedAt, components}`). Note: the community-documented
  `~/.gemini/antigravity-cli/plugins/` path is **stale** — that tree holds
  runtime state (brain/, conversations/, settings.json); the config root with
  plugins/, skills/, mcp_config.json is `~/.gemini/config/`.
- Uninstall is clean: staged dir + manifest entry both removed.
- `agy plugin import claude` exists — agy can import **Claude Code plugin
  format** directly. (`import gemini` migrates Gemini CLI extensions.)
- `agy inspect` appears interactive/TUI — not usable as a scripted probe.

## Channel assessment vs cairn-pi

A `cairn-agy` plugin is feasible with the exact `packages/cairn-pi` pattern —
same sync-script + drift-guard, different manifest (3-field `plugin.json`
instead of the npm `pi` field). But distribution is weaker than pi's today: no
npm/registry; options are (a) GitHub release tarball → `agy plugin install
./cairn-agy`, (b) the `plugin@marketplace` form (registration via
`agy plugin link <mp> <target>`, mechanics unprobed), or (c) — the
interesting one — **ship the v0.15 Claude Code plugin and let agy
`import claude` it**. One artifact, two harnesses. That makes (c) a design
input for the v0.15 plugin-packaging thread rather than a reason to build a
third bespoke package now.

## Strategic finding for SPEC_AGENTS_UMBRELLA (v0.14)

Antigravity CLI discovers workspace skills at `.agents/skills/`
(*web-sourced*, not yet locally verified) — the same dotted path Pi scans.
Two of cairn's three primary environments now converge on `<project>/.agents/`
while the umbrella spec moves cairn state to undotted `<project>/agents/`.
The dot is now load-bearing: skills at `.agents/skills/` would auto-load in
Pi AND agy with zero install. Resolve `agents/` vs `.agents/` in the umbrella
spec **before** executing it.

## adopt.md gap

The Antigravity section (validated 2026-04-25) predates the CLI entirely —
it documents IDE paths (`~/.gemini/antigravity/`). agy's real paths:
`~/.gemini/config/{plugins,skills,mcp_config.json}` global +
`.agents/skills/` workspace (web-sourced). Needs an agy branch in the Step 1
detection tree + Step 3 resolutions when Antigravity-CLI adoption becomes
real.

## Next triggers

1. Umbrella-spec execution → resolve the `.agents/` dot question first.
2. v0.15 plugin-packaging design → evaluate route (c): Claude Code plugin as
   the master artifact, agy consumes via `import claude`, pi keeps npm.
3. First user asking for cairn in agy → empirically verify `.agents/skills/`
   workspace discovery + marketplace/link mechanics, then decide tarball vs
   import route.
