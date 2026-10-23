# Round 107 Person Governance Relationship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three directly evidenced Nanzhao `ruled` relationships and verify that required governance gaps fall from 26 to 23.

**Architecture:** Keep the existing data model and coverage parser unchanged. Project existing `person-details` office facts into three explicit person-to-polity claims, then validate them with a round-specific test and document the evidence and rejected inference boundaries.

**Tech Stack:** TypeScript, Vitest, existing `validateClaims` and person relationship coverage utilities.

## Global Constraints

- Only explicit ruler/king offices with valid dates and polity endpoints qualify.
- Ordinary officials and military ministers do not become `served` claims in this round.
- Do not modify components, kinship/alliance/heritage files, or existing baseline tests.
- Preserve unrelated working-tree changes.

---

### Task 1: Add the failing round107 evidence test

**Files:**
- Create: `src/data/person-relationship-round107-governance.test.ts`

**Interfaces:**
- Consumes: `claims`, `people`, `personDetails`, `polities`, `sourceNotes`, `validateClaims`, and `buildPersonRelationshipCoverageReport`.
- Produces: Assertions for three claim IDs and a governance missing count of 23.

- [ ] **Step 1: Write the test**

  Define the three expected claim tuples for `geluofeng`, `yimouxun`, and `quanfengyou`; assert explicit-record/high-confidence `ruled` claims, endpoints, date ranges, source IDs, uncertainty notes, office evidence, and `validateClaims` success.

- [ ] **Step 2: Run the test to verify it fails**

  Run: `npm test -- --run src/data/person-relationship-round107-governance.test.ts`

  Expected: FAIL because the three round107 claim IDs are not yet present and the report still has 26 required governance gaps.

### Task 2: Add the minimal production claims

**Files:**
- Modify: `src/data/claims.ts`

**Interfaces:**
- Consumes: Existing person-detail office records and source IDs for the three Nanzhao rulers.
- Produces: Three resolvable `HistoricalClaim` records with IDs ending in `-round107`.

- [ ] **Step 1: Add exactly three `ruled` claims**

  Add claims with ranges 748–779, 779–808, and 824–859; use `['zizhi-tongjian', 'china-chronology']`, `datePrecision: 'range'`, `perspective: 'person'`, `evidenceType: 'explicit-record'`, `confidence: 'high'`, and uncertainty notes distinguishing each reign from the 738 formation event.

- [ ] **Step 2: Run the focused test to verify it passes**

  Run: `npm test -- --run src/data/person-relationship-round107-governance.test.ts`

  Expected: PASS with the three claims validated and governance missing count 23.

### Task 3: Add the audit record and run regression checks

**Files:**
- Create: `docs/audits/2026-10-23-round107-person-relationship-governance.md`

**Interfaces:**
- Consumes: The three claims and round107 test results.
- Produces: An auditable table of evidence plus explicit exclusions for ordinary officials, military ministers, and inferred relationships.

- [ ] **Step 1: Write the audit document**

  Record each claim, person, polity, range, source IDs, office evidence, validation result, and the final governance gap count of 23.

- [ ] **Step 2: Run targeted regression tests**

  Run: `npm test -- --run src/data/person-relationship-round107-governance.test.ts src/data/person-relationship-coverage.test.ts src/data/person-relationship-round105-governance.test.ts`

  Expected: PASS without changing existing baseline expectations.
