# agy install github target rejected — Note

> **Filed:** 2026-11-19 · **By:** agent (Claude Code session, during the v0.16.1 install refresh)

`agy` 1.4.6 rejects the install command cairn documents everywhere: `agy plugin install github:winnorton/cairn//packages/cairn-agy@main` fails with `Error: install target must be a directory`. Its help now reads `install <target>  Install a plugin (supports plugin[@marketplace])`, so the GitHub-subpath form validated on 2026-06-13 no longer exists. Installing from a local directory works (`agy plugin install <path-to>/packages/cairn-agy` printed `[ok] cairn — skills: 20 processed` and replaced the 0.15.0 copy cleanly), which is how the maintainer machine was moved to 0.16.x. Every adopter on a current agy hits the error at adopt.md Step 4a. Likely next step: find agy's marketplace form (`agy plugin link <mp> <target>` looks related), validate it end to end, then replace the command in one sweep.

- Command appears in `adopt.md` (lines 250, 728, 946), `AGENTS.md:120`, `packages/cairn-agy/README.md`, and every `delivery.agy` string in `manifest.json`.
- Interim workaround: clone the repo and run `agy plugin install <clone>/packages/cairn-agy`.
- Prior context: [NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md](NOTE_AGY_DISTRIBUTION_IMPORT_GAP_2026-06-13.md).
