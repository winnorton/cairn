# Notes

Pre-emptive intent capture. Single-paragraph thoughts, debug findings, feature sketches
filed via the [`/note`](../../files/skills/note/SKILL.md) skill so they don't evaporate.
Cheap to write, cheap to delete, cheap to promote later.

## Filename pattern

```
NOTE_<TOPIC>_<YYYY-MM-DD>.md
```

`<TOPIC>` is 1–3 `UPPERCASE_UNDERSCORE_KEYWORDS`. The date in the filename means age is
visible at `ls` time with no frontmatter parsing.

## Folder-as-status (no `Status:` field)

Move-on-state, not flip-a-field. Three terminal directories carry the lifecycle:

| Folder | Meaning |
|---|---|
| `docs/notes/` (here) | Active — open thought, not yet acted on. |
| `docs/notes/_promoted/` | Promoted once via `/spec --from <note>`. The note stays as a breadcrumb pointing at the spec; file separate notes or child stubs when follow-up threads split off. |
| `docs/notes/_done/` | Work completed without ever needing a spec. |

A note that becomes obsolete or superseded is deleted with user authorization — no
`_archive/` here. `_promoted/` and `_done/` are created on first use (`mkdir -p`).

## Promotion path

When a note matures into real work:

```
/spec --from docs/notes/NOTE_<TOPIC>_<DATE>.md
```

The `/spec` skill reads the note for intent, does research, writes a structured spec in
`docs/specs/`, and moves the note to `_promoted/` (`git mv` when tracked, plain `mv`
when untracked) with a header line pointing at the new spec, repairing relative links in
the moved note and in files that link to it. Original intent paragraph stays preserved.

## Hygiene

Periodic sweep (manual) of notes older than ~30 days still in the active folder is
healthy — most should have either matured, gotten done, or been deleted by then. Notes
are ephemeral by design.

See [`/note` skill](../../files/skills/note/SKILL.md) for full conventions and the
disambiguation table for `/note` vs cross-session memory.
