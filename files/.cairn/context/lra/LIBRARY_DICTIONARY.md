# Librarian Pattern Dictionary — {{SUBJECT_NAME}}

> **LIBRARIAN-ONLY reference.** The researcher never reads this — discovery must stay unbiased. These are **analogies to recognize the SHAPE of your subject's data**, NOT a schema to impose and NOT an allowlist. Your subject's real types/axes/sets emerge from its own findings; use this only to recognize the *form* of what you already have, then name YOURS. Nothing here is required to appear; nothing here caps what you may mint.

The four forms below are the choices you make while structuring. The load-bearing test sits at the top of each.

## AXIS — a member-bearing recurring unit → entity per instance + `member-of` edges
**Test: does it have members?** (a roster, a setlist, a cast, a class of picks). A recurring unit that *other records belong to* is an AXIS: mint one canonical entity per instance, hang its members off it with `member-of`. The cluster is often `kind:"event"`/news findings sharing the unit — that's its generative source, not a reason to leave it in the timeline.

- team sports: season, draft class, playoff run, roster, conference
- music: album, tour, lineup, era, label roster
- politics / gov: term, administration, election cycle, legislative session, cabinet
- science: study, clinical trial, cohort, expedition, mission, survey wave
- film / TV: season, franchise, anthology, production
- business: fiscal year, funding round, product line, graduating batch/cohort
- military / history: campaign, deployment, operation, dynasty, expedition
- games / lit: tournament, league, edition, series, volume

## EVENT — a memberless point-occurrence → emergent event type (timeline)
**Test: no members, just a moment.** A lone dated point that nothing belongs to. The engine derives it into the app timeline.

- sports: trade, injury, signing, milestone, record broken
- music: concert, release, award, breakup, reunion
- politics: vote, appointment, speech, treaty, resignation
- business: launch, acquisition, recall, IPO, outage
- general: founding, death, disaster, discovery, ceremony

## ENTITY TYPE — the kinds of thing the subject is made of (the nouns)
The recurring noun a source keeps one record per. Mint freely as the data warrants (`Entity.type` is a free string).

- sports: player, coach, team, venue, executive, official
- music: musician, band, label, venue, producer, instrument
- politics: politician, party, office, bill, agency, district
- science: researcher, institution, paper, instrument, dataset, organism
- film / TV: actor, character, show, studio, director, network

## MEDIA ITEM — attribute or entity, according to its own structure
**Test: does the item have independently sourced facts or edges beyond its URL?** If no, keep it as a typed media attribute on the entity it represents. If yes, preserve the source's finest stable unit as an ordinary emergent entity, give its identity URL a singular typed media field even when the type is a singleton, and write its relationships. The same URL may support both projections. URL alone never promotes; no media type name is prescribed.

## LIST / INDEX — a bounded set with a knowable size → `datasets.json` cell
**Test: is there a dedicated, complete index of every member?** If yes, that index's full count is the `target_count` — fetch it, enumerate every member, not a recent slice or a summary table. In the cell, `target_source.url` is that external index and `target_source.path` is where its count lives *inside the source* — a JSON path for a feed (e.g. `metadata.totalEntries`), or **empty** for an HTML "List of…" page you count by hand. Never a `library/` store of your own: a `target_count` read from rows you wrote is circular, and the gate rejects it.

- sports: all-time roster, list of every season, hall of fame, retired numbers
- music: full discography, complete tour history, every member ever
- politics: list of all officeholders, every election, every bill
- general: catalog, register, filmography, bibliography, ranking, gazetteer

## SHAPE — what a complete instance of a kind carries (the depth target)
**Test: what would a complete record of this thing have?** A type's instances share a recurring set of fields + member sub-records + edges. Research is the floor; enrich each entity toward its kind's full shape, fetching from the web where findings stop. (LIST/INDEX is breadth — every member; SHAPE is depth — each member's complete record.)

- a season / cycle: record + standing, the roster (members) each with per-cycle stats, opponents faced, postseason result, leader of record
- a paper / study: authors, venue + date, the result, methods, cites / cited-by
- a person / member: role, tenure span, the units they belong to (per-unit stats), honors, predecessor / successor
- a product / tool: maker, version line over time, capabilities, pricing tier, integrations
- a place / venue: location, capacity, what it hosts, the active period

---

> If your subject fits none of these by analogy, that's fine — invent the form its findings demand. The dictionary is a lens, not a fence.
