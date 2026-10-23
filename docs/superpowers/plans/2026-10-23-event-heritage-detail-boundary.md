# Event and Heritage Detail Boundary Implementation Plan

**Goal:** Preserve the summary-card/detail-drawer hierarchy while making heritage evidence navigable and keeping event/heritage learning labels consistent with the locale system.

**Architecture:** Keep `EventDetailCard` as the compact search summary and keep `EventDetail`/`HeritageDetail` as the complete entity-drawer views. Update only `HeritageDetail` presentation behavior and its tests, plus the smallest i18n entries and a boundary audit document; do not change relationship or capital data.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Vite.

## Global Constraints

- Change only `EventDetail`/`HeritageDetail` presentation, their tests, i18n, and related documentation.
- Do not modify person-relationship data, capital data, or the pre-existing user change in `docs/audits/2026-10-20-short-gap-decisions.md`.
- Keep `EventDetailCard` summary-level; full time, people, places, sources, uncertainty, and related-entry navigation remain in the 50vw entity drawer.
- Use existing source IDs and locale translation infrastructure; do not invent historical facts or sources.

### Task 1: Establish the display boundary and source-link regression tests

**Files:**
- Modify: `src/components/EventDetailCard.test.tsx`
- Modify: `src/components/EventDetail.test.tsx`
- Modify: `src/components/HeritageDetail.test.tsx`

- [ ] Add assertions that the summary card exposes its compact narrative but not full detail sections, while the full event detail exposes time, people, places, sources, uncertainty, and related-event navigation.
- [ ] Add a failing heritage test that requires a source URL to render as an external link.
- [ ] Add a failing heritage test that verifies the detail labels use the locale translation boundary.
- [ ] Run the focused tests and confirm the failures are caused by the missing link/i18n behavior.

### Task 2: Implement the two presentation gaps

**Files:**
- Modify: `src/components/HeritageDetail.tsx`
- Modify: `src/i18n/text.ts`
- Modify: `src/i18n/text.test.ts`

- [ ] Use `useLocale` in `HeritageDetail` for all visible structural labels and preserve the existing data text through `t`.
- [ ] Render `source.urlOrCitation` as an external anchor with `target="_blank"` and `rel="noreferrer"`, while retaining citation-only text when no URL exists.
- [ ] Run the focused tests and confirm they pass.

### Task 3: Document and verify the final boundary

**Files:**
- Create: `docs/audits/2026-10-23-event-heritage-detail-boundary.md`

- [ ] Record the verified summary-card boundary, 50vw drawer field coverage, the two fixed gaps, and the explicitly untouched data domains.
- [ ] Run the complete relevant component/i18n test set.
- [ ] Run `npm run build` from `chronoatlas` and report the result.
