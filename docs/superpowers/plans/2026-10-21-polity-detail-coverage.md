# Polity Detail Coverage Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an independent, read-only audit that reports polity-detail coverage across all 87 polities, missing association types, source completeness, and alignment with the existing knowledge-coverage detail status.

**Architecture:** Create `polity-detail-coverage.ts` as a pure catalog audit. It consumes the existing polity, detail, people, event, heritage, claim, source, and capital-history catalogs, and delegates the comparison status to `auditKnowledgeCoverage` using the same catalog. A focused Vitest suite exercises complete, missing, unresolved-reference, and status-alignment cases with injected miniature catalogs.

**Tech Stack:** TypeScript, existing domain types, Vitest, Vite build.

## Global Constraints

- Do not modify `src/data/polity-details.ts`.
- Do not modify UI files.
- Reuse existing catalogs; do not invent historical records.
- Preserve the pre-existing uncommitted audit-document change.
- Run the focused test, full test suite, production build, and `git diff --check` before commit.

---

### Task 1: Define the failing audit contract

**Files:**
- Create: `src/data/polity-detail-coverage.test.ts`

**Interfaces:**
- Produces the expected public contract for `buildPolityDetailCoverageReport` and the association/source/alignment summary types.

- [ ] **Step 1: Write tests for complete and missing polity details**

  Assert that the default report is based on all 87 polities, exposes explicit covered and uncovered IDs, and reports each missing association category. Add an injected catalog case where one polity has no detail and assert its detail status is `data-missing`, its ID appears in `uncoveredPolityIds`, and the coverage rate is calculated against the complete polity total.

- [ ] **Step 2: Write tests for source and reference integrity**

  Inject a detail with an unknown person, event, heritage, claim, source, and unmatched capital-history phase. Assert the corresponding association types are reported as missing/unresolved and source completeness is false.

- [ ] **Step 3: Write tests for knowledge-coverage alignment**

  Assert every report item exposes both independent detail status and `auditKnowledgeCoverage` detail status, and that the report lists status mismatches. Use a deliberately incomplete detail to prove the two statuses are compared rather than assumed equal.

- [ ] **Step 4: Run the focused test and verify the expected failure**

  Run `npm test -- --run src/data/polity-detail-coverage.test.ts`.

  Expected: FAIL because `polity-detail-coverage.ts` and its audit function do not yet exist.

### Task 2: Implement the independent coverage audit

**Files:**
- Create: `src/data/polity-detail-coverage.ts`

**Interfaces:**
- Consumes: an optional injected catalog containing `polities`, `polityDetails`, `people`, `events`, `eventDetails`, `heritageAssets`, `claims`, `sourceNotes`, and `capitalHistory`.
- Produces: `buildPolityDetailCoverageReport(options?)`, with per-polity detail status, missing association types, source completeness, uncovered IDs, coverage rates, and knowledge-status alignment.

- [ ] **Step 1: Implement catalog defaults and normalized lookup maps**

  Import the existing catalogs and build maps/sets by ID. Keep all returned arrays deterministically sorted by polity ID.

- [ ] **Step 2: Implement per-polity detail and association checks**

  Check summary/foundation/turning points/figures/capital phases/events/uncertainty fields independently from the knowledge audit. Mark an association type missing when the detail has no IDs/phases or when any referenced record cannot be resolved; verify capital phases against `capitalHistory` by polity, place, and validity bounds.

- [ ] **Step 3: Implement source completeness and knowledge alignment**

  Combine polity and detail source IDs, report unknown IDs, and expose `sourceComplete`. Call `auditKnowledgeCoverage` with the same catalog and compare each item’s detail status to `byKey[polity:<id>]`’s detail check. Compute total/covered/uncovered rates and mismatch IDs.

- [ ] **Step 4: Run focused tests and make them pass**

  Run `npm test -- --run src/data/polity-detail-coverage.test.ts`.

  Expected: all new tests pass, with no changes to polity details or UI.

### Task 3: Verify and commit

**Files:**
- No additional production files.

- [ ] **Step 1: Run the full test suite**

  Run `npm test -- --run`; expected: all tests pass.

- [ ] **Step 2: Run build and whitespace checks**

  Run `npm run build` and `git diff --check`; expected: both pass.

- [ ] **Step 3: Confirm scope and commit**

  Run `git status --short` and confirm only the new audit module/test plus the pre-existing audit document are present. Commit only the new module and test with `git add src/data/polity-detail-coverage.ts src/data/polity-detail-coverage.test.ts && git commit -m "feat: add polity detail coverage audit"`.
