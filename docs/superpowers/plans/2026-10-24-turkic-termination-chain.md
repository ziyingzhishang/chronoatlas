# Turkic Termination Chain Implementation Plan

**Goal:** Close the `turkic` overview entity's termination chain without migrating existing IDs, while explicitly modeling the First Turkic Khaganate, the interregnum, the Second Turkic Khaganate, and the 744 termination upper bound.

**Architecture:** Extend `PolityDetail` with bounded period records; add 682 revival and 744 termination events with complete detail, timing audit, claims, late people/relations, mobile-court place and Orkhon heritage links; keep `turkic` as the only polity ID. Add one independent closure test asserting references, date precision, phases, people, relations, heritage, places and sources are all connected.

**Tech Stack:** TypeScript, Vitest, existing static data catalogs.

## Global Constraints

- Preserve all existing `turkic` IDs and references.
- Treat 630/661 as a first-khaganate termination/interregnum boundary, not as proof of one uninterrupted polity.
- Treat 682 as the Second Turkic Khaganate restoration node and 744 as the year-level termination upper bound.
- Keep mobile courts as regional modern-place references, never fixed-city certainty.
- Every new event, claim, person, place and heritage reference must resolve to an existing catalog entry and source.

### Task 1: Add failing independent closure test

- Create `src/data/turkic-termination-closure.test.ts`.
- Assert the four periods, 682 and 744 events, year-level timing, all late people/details, relation claims, mobile-court place, Orkhon heritage, detailed event links, and source/entity closure.
- Run the focused test and confirm it fails because the new IDs and period field do not exist.

### Task 2: Implement the minimum data closure

- Extend `src/domain/types.ts` with an optional bounded polity-period shape and `PolityDetail.periods`.
- Add `turkic` period records, late people, details, events, event details, time-review entries, claims, heritage/place/source records, and link them from the overview detail.
- Run the focused test until green, then run the related data suites and TypeScript build.

### Task 3: Review and commit

- Inspect the diff for accidental edits or unresolved IDs.
- Run the focused closure test, full test suite, and production build.
- Commit only the Turkic implementation files plus this plan, leaving unrelated pre-existing untracked files untouched.
