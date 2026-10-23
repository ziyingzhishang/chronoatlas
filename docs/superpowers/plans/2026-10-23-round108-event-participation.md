# Round 108 Event Participation Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Independently audit the ten round-104 `eventParticipation` gaps against existing event-detail participants, person time ranges, and shared sources without changing production data or baseline tests.

**Architecture:** Add a read-only Vitest audit that imports the existing catalogs and computes candidate evidence from current data. Record only verified findings and integration recommendations in a dated audit document; no `events.ts`, `event-details.ts`, `claims.ts`, or existing baseline test is modified.

**Tech Stack:** TypeScript, Vitest, existing ChronoAtlas data catalogs.

## Global Constraints

- Do not modify `src/data/events.ts`, `src/data/event-details.ts`, `src/data/claims.ts`, or existing baseline tests.
- Keep unresolved gaps explicit unless all endpoint, participant-field, temporal, source, and semantic contracts pass.
- Any qualifying candidate is only recorded as pending main-agent integration; production data is not edited.

---

### Task 1: Add the independent evidence audit

**Files:**
- Create: `src/data/person-relationship-round108-event-participation.test.ts`

- [ ] **Step 1: Write the failing audit test**
- [ ] **Step 2: Run `npm test -- --run src/data/person-relationship-round108-event-participation.test.ts` and confirm the evidence assertion fails.**
- [ ] **Step 3: Refine only test-local evidence logic.**
- [ ] **Step 4: Re-run the focused test and preserve the passing result.**

### Task 2: Record findings and verification

**Files:**
- Create: `docs/audits/2026-10-23-round108-event-participation.md`

- [ ] **Step 1: Record each gap’s existing endpoint and evidence boundary.**
- [ ] **Step 2: Distinguish qualifying candidates from contextual or temporally invalid records.**
- [ ] **Step 3: Record the exact focused test command and result.**

### Task 3: Final regression check and review

- [ ] **Step 1: Run the focused test again after documentation.**
- [ ] **Step 2: Inspect git diff and confirm forbidden files are unchanged.**
- [ ] **Step 3: Request code review for the audit-only change.**
