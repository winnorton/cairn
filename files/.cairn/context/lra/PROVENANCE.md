# lra prompt provenance — DO NOT EDIT THE PROMPTS HERE

These three templates are **verbatim copies** from the lra repo (the "lab"). They are the
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
| source commit | `7ea2050` (2026-06-30) |

## File fingerprints (md5 — re-sync if the lab's differ)

| file | md5 |
|---|---|
| `PROMPT_RESEARCHER_BOOTSTRAP.md` | `e26111cbe38586a14691730c2325d04e` |
| `PROMPT_LIBRARY_BOOTSTRAP.md`    | `12b3b53deaa6a313e33daf28b08bd76d` |
| `AGENTS_SUBJECT.md`              | `81732f743a8a254e021d8bf9226b66f6` |

## Re-sync (run from the lra repo)

```bash
# verify whether cairn's copies match the lab
for f in PROMPT_RESEARCHER_BOOTSTRAP.md PROMPT_LIBRARY_BOOTSTRAP.md AGENTS_SUBJECT.md; do
  diff -q engine/templates/$f ../cairn/cairn/files/.cairn/context/lra/$f
done
# if they differ AND the lab's version passed its gates, copy lab → cairn and update the
# commit + md5 rows above. The lab is always upstream; cairn never edits these.
```

See the cross-repo link doc in each repo: `docs/CROSS_REPO_LRA_CAIRN.md`.
