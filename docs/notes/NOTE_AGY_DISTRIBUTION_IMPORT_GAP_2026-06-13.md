# NOTE — agy skills-distribution gap: `agy plugin import claude` doesn't pick up the cairn plugin

> **RESOLVED 2026-06-14** via `packages/cairn-agy/` (option 2 below): a native agy plugin
> (root `plugin.json` + the shared sync-guard, 18 skills). `agy plugin validate` passes and
> `agy plugin install` round-trips cleanly (`[ok] cairn, 18 skills processed`). adopt.md's
> agy branch now uses `agy plugin install github:winnorton/cairn//packages/cairn-agy@main`.
> The investigation below stands as the record of why `import claude` was a dead end.
>
> Filed: 2026-06-13 · Status: RESOLVED · Surfaced by the v0.14.0 post-push validation
> (program `SPEC_CAIRN_OWNERSHIP`, WS04). Not a v0.14.0 blocker — agy still reads
> `.cairn/` STATE via the AGENTS.md import line; only the SKILLS channel to agy is open.

## What was validated (works)

- **Claude Code:** `claude plugin marketplace add winnorton/cairn` + `claude plugin install
  cairn@cairn` → installs end-to-end (after the v0.14.0 patch fixing the marketplace.json
  git-subdir url to HTTPS so it doesn't require SSH host-key trust). `claude plugin list`
  shows `cairn@cairn`. ✅
- **Pi:** `@winnorton/cairn-pi` published to npm; `pi install` validated earlier. ✅

## The gap (agy)

With the cairn plugin installed in Claude Code (`~/.claude/plugins`, scope user),
`agy plugin import claude` returns **"No claude extensions found."** WS04 assumed agy
would ingest the installed Claude *plugin* via `import claude`, but empirically agy's
`import claude` scans for the older Claude/Gemini **extension** shape, not the new
marketplace **plugin** format. So the documented agy path does not actually deliver
cairn skills to agy.

## Hypotheses / next steps (a future WS04-followup or a `cairn-agy` package)

1. **Probe what `agy plugin import claude` actually scans** — `agy plugin import --help`,
   and whether it reads `~/.claude/settings.json` extensions vs `~/.claude/plugins/`.
   If it only reads the legacy extensions surface, import-claude is a dead end for plugins.
2. **Native `cairn-agy` plugin** (the reserved fallback in master §2.3) — agy's own plugin
   format is a root `plugin.json` + `skills/` (binary-verified 2026-06-13, see
   `NOTE_AGY_PLUGIN_CHANNEL_ASSESSMENT_2026-06-11.md`). The cairn-claude plugin puts its
   manifest at `.claude-plugin/plugin.json` (Claude's location), so `agy plugin install`
   of it won't find a root manifest. A small `packages/cairn-agy/` (root `plugin.json` +
   synced `skills/`, same shared sync-guard) would give agy a first-class install:
   `agy plugin install` from the repo / a local path.
3. **Stopgap for agy users today:** drop the skills into `<project>/.agents/skills/`
   (agy's binary-verified workspace skill path) — works with zero packaging, but it's a
   hand-copy (mild tension with `[LAW own-your-namespace]`'s "vendor installer places them").

## Recommendation

Add a `packages/cairn-agy/` (option 2) in a v0.14.x follow-up — it reuses the shared
`scripts/sync-skills.mjs` guard and gives agy a real package install, closing the third
harness cleanly. Until then, agy gets cairn STATE (`.cairn/` via AGENTS.md import) but
not the skills-via-package path. Relates to `[MEM feedback/own-namespace-no-vendor-folder-deps]`.
