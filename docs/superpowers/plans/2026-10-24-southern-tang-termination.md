# Southern Tang Termination Implementation Plan

> **For agentic workers:** Execute the steps in order and keep the test-first gate visible in the commit history.

**Goal:** Close the Southern Tang termination chain with a canonical 975 termination node while preserving the existing historical event.

**Architecture:** Add a canonical termination event and detail alongside the legacy `southern-tang-falls` record. Link the canonical node to Li Yu, the Song successor, Jiankang and Southern Tang heritage, then update polity and coverage baselines. The legacy node remains as a compatibility alias in existing timelines.

**Tech Stack:** TypeScript, React data catalogs, Vitest, Vite knowledge-coverage generator.

## Global Constraints

- Preserve the distinction between Jinling city fall and later local administrative reception.
- Use existing source IDs and modern place/heritage records; do not invent a modern building as a Southern Tang original.
- Write the closure test before production data changes and observe the expected failure.
- Run targeted tests, the full suite, `npm run build`, and `git diff --check` before commit.

### Task 1: Define the missing closure contract

**Files:**
- Create: `src/data/southern-tang-termination-closure.test.ts`

- [ ] Assert the canonical event, detail, participants, 975 date, Jiankang location, successor polity and source IDs.
- [ ] Assert Li Yu's termination participation and the canonical event in polity/person details.
- [ ] Assert the Jiankang heritage detail links the canonical event and the canonical coverage report has no missing detail for it.
- [ ] Run the test and confirm it fails because `southern-tang-ended-975` is absent.

### Task 2: Implement the canonical data graph

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/heritage-details.ts`

- [ ] Add the event/detail and relationships with the established source vocabulary.
- [ ] Add canonical IDs to Li Yu, Southern Tang, and Jiankang heritage navigation while retaining `southern-tang-falls`.
- [ ] Run the new closure test and the affected coverage tests.

### Task 3: Refresh generated coverage and verify

**Files:**
- Modify: `public/data/knowledge-coverage.json`
- Modify: affected coverage baseline tests only if counts change.

- [ ] Run `npm run build:knowledge-coverage`.
- [ ] Run all tests, `npm run build`, and `git diff --check`.
- [ ] Commit the complete closure with a descriptive message.
