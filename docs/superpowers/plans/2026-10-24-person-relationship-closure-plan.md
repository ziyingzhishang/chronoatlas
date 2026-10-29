# Person Relationship Closure Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with TDD and keep the closure commit independent from unrelated working-tree changes.

**Goal:** Add source-bounded person-to-person claims for the current 12 coverage tasks and make `person-person-relationship-missing` equal zero.

**Architecture:** Keep the existing catalog model. Add one evidence endpoint (`dou-xian`) needed to represent the 91 CE Han–Northern Xiongnu conflict, add precise source notes, append claims to `src/data/claims.ts`, and regenerate the derived knowledge coverage JSON. A standalone audit test will validate claim semantics and the zero-task invariant.

**Tech Stack:** TypeScript, Vitest, JSON-derived coverage report, existing historical claim/source types.

## Global Constraints

- Do not infer a person relationship from shared polity membership alone.
- Do not invent names for the 91 CE Northern Chanyu entity; keep it as a title-based person endpoint.
- Use `datePrecision: unknown` for undated genealogy rather than fabricating bounds.
- Every new claim must have a resolvable subject/object, `perspective: person`, a source ID present in `sourceNotes`, and a non-empty uncertainty note.

---

### Task 1: Add the failing closure audit

**Files:**
- Create: `src/data/person-relationship-closure.audit.test.ts`

- [ ] **Step 1: Write the failing test**

Assert the 12 target people have the planned claim tuples, all claim sources resolve, all bounded dates are ordered, undated genealogy is explicitly marked `unknown`, all claim endpoints are people, and the knowledge report has no `person-person-relationship-missing` task.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/data/person-relationship-closure.audit.test.ts`

Expected: FAIL because the planned claim IDs and at least one person endpoint do not yet exist and the report still contains 12 missing tasks.

### Task 2: Add source-bounded data and claims

**Files:**
- Modify: `src/data/sources.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/claims.ts`

- [ ] **Step 1: Add the exact primary/authoritative source notes**

Add source IDs for the detailed Hou Hanshu lineage and Dou Xian record, Jinshu Liu Yuan–Liu Yao kinship, and Old/New Tang histories for the Turkic relations.

- [ ] **Step 2: Add Dou Xian as the explicit 91 CE opposing-person endpoint**

Add `dou-xian` with Eastern Han polity membership, source-backed description, and a matching person detail entry.

- [ ] **Step 3: Add the planned claims**

Add the direct claim tuples from the design: Bi–Huhanye grandchild, Zhizhi–Huhanye sibling, Northern Chanyu–Dou Xian enemy, Liu Yuan–Liu Yao conservative related-to, Jieli–Li Shimin enemy, Tonyukuk served Qutlugh and Bilge, Qapaghan–Qutlugh sibling, Bilge–Kül Tigin sibling in the 716–731 political window, and the reciprocal Ozmiş–Bayanchur conflict edges.

- [ ] **Step 4: Run the focused audit to verify it passes**

Run: `npm test -- --run src/data/person-relationship-closure.audit.test.ts`

Expected: PASS, including zero `person-person-relationship-missing` tasks.

### Task 3: Regenerate and verify derived coverage

**Files:**
- Modify: `internal/audits/knowledge-coverage.json`

- [ ] **Step 1: Regenerate the knowledge coverage artifact**

Run: `npm run build:knowledge-coverage`

- [ ] **Step 2: Run targeted and full validation**

Run: `npm test -- --run src/data/person-relationship-closure.audit.test.ts src/data/knowledge-coverage.test.ts src/data/person-details.test.ts src/data/catalog-integrity.test.ts`

Then run: `npm test -- --run`

Expected: all tests pass and the generated coverage task list contains no `person-person-relationship-missing` item.

- [ ] **Step 3: Review and commit only this closure**

Run `git diff --check`, inspect the staged file list, and commit the implementation, audit test, source notes, person endpoint/detail, claims, and regenerated coverage as one independent commit without staging existing temporary files.
