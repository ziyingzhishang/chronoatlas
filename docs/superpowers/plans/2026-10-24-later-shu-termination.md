# Later Shu Termination Closure Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with a failing test before each production data change.

**Goal:** Complete the Later Shu (934–965) termination chain from the polity perspective and preserve Chengdu's transition into the Northern Song.

**Architecture:** Extend the existing append-only historical catalog across events, event details, people, person details, claims, polity details, and the existing Chengdu heritage layer. Keep 965 as the polity termination year, distinguish the surrender from subsequent local administrative absorption, and update generated coverage through the repository script.

**Tech Stack:** TypeScript, Vitest, Vite, generated JSON coverage.

## Global Constraints

- Reuse existing IDs and the existing `later-shu-chengdu-city-site` heritage asset.
- Do not present later buildings as surviving Later Shu original structures.
- Use a year-precision, checked event with explicit source IDs.
- Add no production code before the closure test demonstrates the missing behavior.

### Task 1: Add the failing closure contract

**Files:**
- Create: `src/data/later-shu-termination-closure.test.ts`

- [ ] Write assertions for the 965 Chengdu termination event, event detail participants, Chengdu capital/heritage continuity, and the final ruler/transition claims.
- [ ] Run the focused test and confirm it fails because the event, final ruler, and termination links are absent.

### Task 2: Add the minimum historical records

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/heritage-details.ts`

- [ ] Add `later-shu-ended-965` with Chengdu, checked year precision, causes, process, consequences, phases, sources, and related foundation event.
- [ ] Add Meng Chang as the final ruler and connect his detail to the termination event.
- [ ] Add participation, rulership, and adversarial/transition claims for Meng Chang and Zhao Kuangyin.
- [ ] Add the event and claims to the Later Shu polity detail, and associate the event with the existing Chengdu heritage layer.
- [ ] Run the focused closure test and confirm it passes.

### Task 3: Rebuild and verify the repository

- [ ] Run `npm run build:knowledge-coverage`.
- [ ] Run the full Vitest suite.
- [ ] Run `npm run build` and `git diff --check`.
- [ ] Commit the closure and report the SHA and verification totals.
