# Xiongnu Termination Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Xiongnu three-layer termination and succession closure with source-backed entities and independent tests.

**Architecture:** Extend the existing data catalogs in place. Add three historical events and their detailed records, then connect people, claims, places, heritage, sources, polity detail, and time review through existing IDs. Use one independent Vitest closure test to enforce referential integrity and editorial distinctions.

**Tech Stack:** TypeScript data catalogs, Vitest, existing domain types and coverage helpers.

## Global Constraints

- Keep Xiongnu as a mobile tribal polity, not a fixed-capital dynasty.
- Treat 48, 91, and 93 as different political and editorial layers.
- Do not equate the 93 directory upper bound with disappearance of all Xiongnu groups.
- Every new reference must resolve to an existing entity and source.

### Task 1: Add the failing closure test

**Files:**
- Create: `src/data/xiongnu-termination-closure.test.ts`

- [ ] Write assertions for the three events, late figures, claims, places, heritage, and source/entity closure.
- [ ] Run `npx vitest run src/data/xiongnu-termination-closure.test.ts`; expect failure because the new records do not yet exist.

### Task 2: Add the source-backed catalog records

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/event-time-review.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/places.ts`
- Modify: `src/data/heritage.ts`
- Modify: `src/data/heritage-details.ts`
- Modify: `src/data/sources.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/polity-details.ts`

- [ ] Add the 48, 91, and 93 events with bounded phases and references.
- [ ] Add late figures and details with dated offices and key events.
- [ ] Add claims for termination, succession, participation, relation, and heritage.
- [ ] Add regional places and mobile/archaeological heritage records with modern mappings.
- [ ] Connect all new IDs to the Xiongnu polity detail.

### Task 3: Verify and review

- [ ] Run the focused test and full `npm test -- --run`.
- [ ] Run `npm run build` and inspect git diff for unrelated changes.
- [ ] Request an independent code review against the parent commit and fix all important findings.
- [ ] Commit all scoped changes as one independent commit.
