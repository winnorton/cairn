# lra prompt provenance — DO NOT EDIT THE PROMPTS HERE

These four templates are **verbatim copies** from the lra repo (the "lab"). They are the
single most protected asset in this pack: the researcher prompt is **immutable** (hard-won
over ~36 commits, ratchet-pinned, guarded by a complexity ratchet and a benchmark bench-pin),
and the librarian prompt is 1:1 with the lab by default.

**Never edit these files.** If a prompt needs to change, it changes in the lra lab,
passes lra's gates (`npm run validate` → complexity ratchet + bench-pin), and is re-synced
here. Editing here forks your most protected asset off its gates — exactly the drift the
bench-pin exists to prevent.

**These files auto-refresh on re-adopt** (manifest `mode: overwrite`) — they are cairn-owned
and track upstream, so any local edit is replaced on the next `adopt`. That is intended: the
masters must stay byte-identical to the lab.

## Synced from

| field | value |
|---|---|
| source repo | `lra` |
| source path | `engine/templates/` |
| source commit | `d0d8ec4` (2026-08-12) |
| notes | upstream renamed `AGENTS_SUBJECT.md` → `STNEGA_BOOTSTRAP.md` (commit `a9cf0e8`); cairn keeps the destination name `AGENTS_SUBJECT.md` for skill clarity. New file: `LIBRARY_DICTIONARY.md` (librarian-only pattern dictionary). |

## File fingerprints (md5 — re-sync if the lab's differ)

| file | md5 |
|---|---|
| `PROMPT_RESEARCHER_BOOTSTRAP.md` | `F0361572111E878BB9720254EAE31E08` |
| `PROMPT_LIBRARY_BOOTSTRAP.md`    | `9AB0CA9B745646A7C6698240EA3CD5E8` |
| `AGENTS_SUBJECT.md`              | `7C961A887EA69AA8FC19E892D1FD4ECF` |
| `LIBRARY_DICTIONARY.md`          | `E04A735401B5D1EEC464F54BF4B72690` |

## Re-sync (run from the lra repo)

```bash
# verify whether cairn's copies match the lab
for f in PROMPT_RESEARCHER_BOOTSTRAP.md PROMPT_LIBRARY_BOOTSTRAP.md LIBRARY_DICTIONARY.md; do
  diff -q engine/templates/$f ../cairn/cairn/files/.cairn/context/lra/$f
done
# STNEGA_BOOTSTRAP.md → AGENTS_SUBJECT.md (name differs, content identical)
diff -q engine/templates/STNEGA_BOOTSTRAP.md ../cairn/cairn/files/.cairn/context/lra/AGENTS_SUBJECT.md
# if they differ AND the lab's version passed its gates, copy lab → cairn and update the
# commit + md5 rows above. The lab is always upstream; cairn never edits these.
```

See the cross-repo link doc in each repo: `docs/CROSS_REPO_LRA_CAIRN.md`.
