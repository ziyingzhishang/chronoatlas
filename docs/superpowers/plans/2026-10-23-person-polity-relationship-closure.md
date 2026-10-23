# Person–Polity Relationship Closure Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with a test-first cycle.

**Goal:** Close the audited person→polity relationship gaps for the 17 named polities with source-backed, time-valid claims, while leaving any unsupported gap explicitly documented.

**Architecture:** Keep the existing flat `claims` model as the canonical explicit relationship layer. Reuse existing people wherever possible; add only the missing Southern Liang person node needed to make its relationship resolvable, including a matching person detail. Add one focused batch test that validates endpoints, predicate, dates, sources, confidence/evidence, and Southern Liang discoverability.

**Tech Stack:** TypeScript, Vitest, existing `validateClaims`, people/polities/source catalogs, Markdown audit records.

## Global Constraints

- Do not modify `src/data/event-details.ts` or event references outside the repository directory.
- Use explicit `founded`/`ruled`/governance semantics; do not infer a person→polity relation from shared event participation.
- Every added claim must have valid person and polity endpoints, `validFrom <= validTo`, at least one source in `sourceNotes`, and an uncertainty note.
- Preserve unrelated pre-existing worktree changes.

### Task 1: Add the failing closure test

**Files:**
- Create: `src/data/person-polity-relationship-closure.test.ts`

- [ ] Define the expected claim IDs and endpoint/date/predicate/source metadata for the 17 target polities, including one explicit `tufa-wugu`→`southern_liang` relationship.
- [ ] Assert the selected claims exist, validate with `validateClaims`, resolve all endpoints and sources, use governance predicates, have valid date ranges, and are not inference evidence.
- [ ] Assert Southern Liang has a resolvable person with `polityIds` containing `southern_liang`.
- [ ] Run the focused test and verify it fails because the new claims/person are absent.

### Task 2: Add the minimum relationship data

**Files:**
- Modify: `src/data/claims.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`

- [ ] Add source-backed `ruled` claims for the evidenced existing people and target polity IDs, with conservative reign/formation ranges and notes distinguishing nominal rule, de facto control, or formation-stage uncertainty where needed.
- [ ] Add `tufa-wugu` with `polityIds: ['southern_liang']`, source IDs, and a concise historical description.
- [ ] Add the matching `tufa-wugu` person detail and office range so the relationship is navigable and structurally consistent.
- [ ] Run the focused test and fix only data/fixture issues until it passes.

### Task 3: Record audit closure and residuals

**Files:**
- Create: `docs/audits/2026-10-23-person-polity-relationship-closure.md`

- [ ] Record every target polity, claim ID, person, predicate, date range, and source.
- [ ] State explicitly that no target was fabricated; if any target cannot meet the evidence threshold, list it as residual with the reason and leave its gap open.
- [ ] Record that `event-details.ts` was intentionally not changed.

### Task 4: Verify the repository change

- [ ] Run the new focused batch test.
- [ ] Run existing person relationship coverage, applicability, person details, claims, and build/type checks.
- [ ] Confirm `git diff --check` and confirm `event-details.ts` is unchanged.
