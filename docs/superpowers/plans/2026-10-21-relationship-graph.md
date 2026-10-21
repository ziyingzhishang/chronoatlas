# RelationshipGraph Classification Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render existing historical claims in five relationship categories with auditable metadata and preserved accessible entity navigation.

**Architecture:** Keep claims immutable. Add a small pure presentation-model layer beside `RelationshipGraph`, then render that model in grouped SVG/text views. The model resolves source availability from the existing source catalog and formats missing/approximate dates without inventing precision.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, existing `useLocale` i18n.

## Global Constraints

- Do not modify `src/data/claims.ts` or any claim records.
- Reuse `HistoricalClaim`, existing relationship category names, and i18n.
- Preserve `onOpenEntity` behavior and Enter/Space keyboard activation.
- Keep source status explicit; unresolved source IDs must not be presented as verified sources.

### Task 1: Presentation model and tests

**Files:**
- Modify: `src/components/RelationshipGraph.tsx`
- Test: `src/components/RelationshipGraph.test.tsx`

- [ ] Write failing tests for five-category classification and metadata formatting.
- [ ] Run the focused test and verify the new assertions fail because the model is absent.
- [ ] Implement the minimal model and grouped rendering.
- [ ] Run focused tests, then refactor shared metadata formatting while keeping green.
- [ ] Commit the component and focused tests.

### Task 2: i18n and styling validation

**Files:**
- Modify: `src/i18n/text.ts`, `src/styles/theme.css`
- Test: `src/components/RelationshipGraph.test.tsx`

- [ ] Add only the labels needed by the graph model and metadata badges to the existing translation map.
- [ ] Add compact styles for category headings, edge metadata, source state, and direction marker without changing layout contracts.
- [ ] Assert translated/default Chinese labels and keyboard-safe controls.
- [ ] Run focused tests, full tests, build, and `git diff --check`.
- [ ] Commit the verified batch.
