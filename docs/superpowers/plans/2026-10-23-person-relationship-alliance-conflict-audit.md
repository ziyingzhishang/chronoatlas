# Round 126 Alliance/Conflict Audit Implementation Plan

> **For agentic workers:** Execute inline in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-audit the current required `allianceConflict` gaps and record only evidence that meets the direct political-cooperation/hostility threshold, without changing `claims.ts` when no candidate closes the evidence loop.

**Architecture:** Keep the existing person-relationship coverage and event-detail catalogs as the source of truth. Add an isolated Vitest boundary audit for the current missing set and a dated audit document listing the scanned shared-context pairs and their exclusion reasons. Production relationship claims remain unchanged because the current scan found no direct `ally-of` or `enemy-of` evidence.

**Tech Stack:** TypeScript, Vitest, existing `buildPersonRelationshipCoverageReport`, people/event/event-detail/source catalogs, Markdown audit records.

## Global Constraints

- Inspect only `requiredMissingByCategory.allianceConflict`.
- Add at most three relationships, and only when both person endpoints, direct political cooperation/hostility semantics, valid years, registered sources, and uncertainty notes are closed.
- Do not modify `src/data/claims.ts` for this round because no candidate meets the threshold.
- Do not modify kinship, governance, or event-participation data, tests, or coverage logic.
- Preserve the existing uncommitted `docs/audits/2026-10-20-short-gap-decisions.md` change byte-for-byte.

### Task 1: Add the current alliance/conflict boundary audit

**Files:**
- Create: `src/data/person-relationship-round126-alliance.test.ts`

**Interfaces:**
- Consumes: `buildPersonRelationshipCoverageReport()`, `claims`, `people`, `events`, `eventDetails`, `sourceNotes`.
- Produces: A regression contract proving the current 69-item required gap boundary and documenting only parseable shared-context pairs whose relationship semantics remain insufficient.

- [x] **Step 1: Write the audit test**

Create a fixed boundary table for the 20 current both-required shared-event pairs identified by the read-only scan. The test must assert that every pair has two people, one event and detail endpoint, direct participant records, a valid event year/range, and source IDs registered in `sourceNotes`; it must also assert that no pair already has an `ally-of` or `enemy-of` claim.

The test must assert:

```ts
expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(69);
expect(boundaries).toHaveLength(20);
for (const boundary of boundaries) {
  expect(pairClaimExists(boundary.left, boundary.right)).toBe(false);
  expect(boundary.reason.trim()).toBeTruthy();
}
```

Use explicit reasons that distinguish succession/kinship, shared polity, shared founding event, shared diplomatic setting, and generic war/competition wording from a direct two-person political alliance or hostility claim.

- [x] **Step 2: Run the boundary test**

Run: `npm test -- --run src/data/person-relationship-round126-alliance.test.ts`

Expected: PASS, with the current required `allianceConflict` count remaining 69 and no new claim present.

- [x] **Step 3: Verify that no production claim is needed**

Run: `git diff -- src/data/claims.ts` and confirm there is no diff. If any candidate assertion unexpectedly fails because the source text contains direct two-person alliance or hostility semantics, stop the no-claim path and re-audit that candidate before changing any data.

### Task 2: Record the no-candidate audit result

**Files:**
- Create: `docs/audits/2026-10-23-round126-person-relationship-alliance.md`

**Interfaces:**
- Consumes: The boundary table and passing round126 test results.
- Produces: A dated audit record of the current baseline, scan criteria, all excluded boundary families, untouched scope, and exact verification command.

- [x] **Step 1: Write the audit document**

Record that the current required `allianceConflict` gap count is 69, the scan found 20 both-required shared-event pairs, and none passed the direct-semantic threshold. Include a compact table covering the 20 pairs, their event IDs, and precise exclusion reasons. State explicitly that no `claims.ts` change was made and that the 69-item baseline remains open.

- [x] **Step 2: Run the focused regression set**

Run:

```text
npm test -- --run \
  src/data/person-relationship-round126-alliance.test.ts \
  src/data/person-relationship-round109-alliance.test.ts \
  src/data/person-relationship-coverage.test.ts
```

Expected: All selected tests pass; the current 69-item alliance/conflict boundary remains unchanged, and no kinship, governance, or event-participation count changes.

- [x] **Step 3: Check the final scope**

Run: `git status --short` and `git diff --name-only`.

Expected task additions: the new round126 alliance test, the new round126 alliance audit document, and this alliance/conflict plan only. Any unrelated pre-existing or concurrently appearing untracked files must remain untouched. The pre-existing modification to `docs/audits/2026-10-20-short-gap-decisions.md` must remain present but untouched; `src/data/claims.ts` must remain unchanged.
