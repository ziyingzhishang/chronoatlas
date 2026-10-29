# 辽终结闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the missing 1125 辽 termination chain without conflating 辽亡, 五京城市史, and 西辽 formation.

**Architecture:** Extend the existing append-only catalogs (`events`, `event-details`, `event-time-review`, `people`, `person-details`, `claims`, `heritage-details`, `polity-details`) and regenerate the checked-in knowledge coverage artifact. The closure test is the contract across those catalogs.

**Tech Stack:** TypeScript, Vitest, Vite, existing historical data catalogs.

## Global Constraints

- Preserve the existing `khitan` polity ID and five-capital place IDs.
- Use `liao-ended-1125` as a year-precision event and retain uncertainty notes for the 1125 transition and later Western Liao formation.
- Use existing source IDs unless a new source record is required by catalog integrity.
- Write the failing closure test before production data edits.

### Task 1: Red closure contract

**Files:**
- Create: `src/data/liao-termination-closure.test.ts`

- [ ] **Step 1: Write assertions for event, detail, review, people, claims, polity, and five-city heritage association.**
- [ ] **Step 2: Run `npx vitest run src/data/liao-termination-closure.test.ts` and confirm failure because `liao-ended-1125` is absent.**

### Task 2: Implement the catalog chain

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/event-time-review.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/heritage-details.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/sources.ts` only if catalog integrity requires a dedicated source

- [ ] **Step 1: Add the event and event detail with 1125 year-level uncertainty wording.**
- [ ] **Step 2: Add the末代人物 and participating/opposing/承接 claims.**
- [ ] **Step 3: Link the event to the polity and all five existing heritage details without changing their modern mappings.**
- [ ] **Step 4: Run the targeted closure test and confirm green.**

### Task 3: Coverage and verification

**Files:**
- Modify: `internal/audits/knowledge-coverage.json`

- [ ] **Step 1: Run `npm run build:knowledge-coverage`.**
- [ ] **Step 2: Run `npm test -- --run`.**
- [ ] **Step 3: Run `npm run build` and `git diff --check`.**
- [ ] **Step 4: Commit the complete closure with a focused message.**
