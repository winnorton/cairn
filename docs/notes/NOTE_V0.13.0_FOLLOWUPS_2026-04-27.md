# v0.13.0 follow-ups — Note

> **Filed:** 2026-04-27 · **By:** Claude (auto mode, post-v0.13.0 ship) · **Status:** open

The cairn v0.13.0 release shipped clean (PR #37 squash-merged 2026-04-27, tagged at `da4c9e4`), but a short list of small items was deliberately deferred from the release branch and should be picked up in a v0.13.1 doc patch or folded into whatever the next substance release touches. None are blocking; the second `/review` explicitly recommended deferring them; the chips spawned mid-session are independent low-risk fixes. The natural moment to land them is the next time someone touches the involved files for any reason.

- **`tour/SKILL.md` fixes** — chips already spawned, waiting on click. Line 35 says *"5 domain-agnostic seed laws"* but the template ships 6. Line 39 lists only 4 of 13 shipped skills and still says *"Drop new `.md` files here"* (pre-v0.12.1 flat-format guidance — should reference `<name>/SKILL.md` subdirs and point at categories per `files/skills/README.md`).
- **Cosmetic doc-patch items from the v0.13.0 second `/review`** — neither blocks tag, both are nice-to-have. (1) `README.md:472-474` v0.9.0 changelog: *"Numbers remain...(removed entirely in v0.13.0). /audit matches both forms during transition."* — past-tense the surrounding clauses to match the parenthetical retraction. (2) `HANDOFF.md:46` references *"lines 116-117 + 122"* in the empirical-confirmation entry; line refs go brittle on the next README edit. Replace with section-name reference (e.g. *"in the 'Usage signal (citations)' section"*).
- **Carried over from `[MEM project/cairn_at_v0.13.0]`** — `/cairn-introspect` skill candidate (still 1/3 instances, gate at 3+); `/review` name collision with Anthropic's built-in `review` skill (unresolved across v0.12.x and v0.13.0 — worth asking adopters which Antigravity / other harnesses actually load); `adopt.md` install-preview version strings still hardcoded (v0.13/v0.14 candidate: make preview pull `manifest.version` dynamically rather than hardcode — three patch releases in a row paid that drift tax).

---

*Note — pre-emptive intent capture. If any item becomes real work, promote via `/spec --from docs/notes/NOTE_V0.13.0_FOLLOWUPS_2026-04-27.md`.*
