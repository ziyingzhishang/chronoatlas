# 西凉终止链闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Western Liang (`western_liang`) foundation-to-termination chain without changing unrelated Liang or Tuyuhun baselines.

**Architecture:** Extend the existing append-only catalog across events, event details, people, person details, claims, polity details, capital history, heritage, and event-time review. Keep Dunhuang (400—404) and Jiuquan (405—421) as separate phases, then connect the 421 Northern Liang conquest through Li Xin and Juqu Mengxun.

**Tech Stack:** TypeScript, Vitest, Vite, existing typed historical data modules.

## Global Constraints

- Scope is limited to `western_liang` and its focused closure test.
- Preserve Southern Liang, Former Liang, Tuyuhun, and unrelated relationship baselines.
- Use year precision for the 421 termination boundary and preserve the existing 400/405 capital split.
- Every new reference must resolve to an entity and an existing source.

### Task 1: Write and run the failing closure test

**Files:**
- Create: `src/data/western-liang-termination-closure.test.ts`

- [ ] Assert the 421 termination event/detail, Li Xin and Juqu Mengxun participants, year precision, and source resolution.
- [ ] Assert the polity closure, two capital phases, modern place mapping, Jiuquan heritage, person details, relationships, and no orphaned references.
- [ ] Assert the test only changes/observes Western Liang IDs and explicitly distinguishes Southern Liang and Former Liang.
- [ ] Run `npx vitest run --exclude '.worktrees/**' src/data/western-liang-termination-closure.test.ts`; expected failure is missing `western-liang-ended-421` / Li Xin / closure links.

### Task 2: Add the minimal Western Liang termination data

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/event-time-review.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/heritage.ts`
- Modify: `src/data/heritage-details.ts`
- Modify: `src/data/capital-history.ts`

- [ ] Add the 421 Jiuquan termination event and detail with Northern Liang succession context.
- [ ] Add Li Xin as Western Liang final ruler and connect his 417—421 office/detail to the termination event.
- [ ] Add Li Xin/Juqu Mengxun termination, enemy, and succession claims with year boundaries and existing sources.
- [ ] Add the termination event, Li Xin, and Jiuquan heritage to the Western Liang polity detail; preserve separate 400—404 and 405—421 capital phases.
- [ ] Add the Jiuquan heritage asset/detail with modern location and layered-heritage caveat; keep the existing Dunhuang asset scoped to 400—421 continuity.
- [ ] Add confirmed year-level time review for 421.

### Task 3: Verify and commit

- [ ] Run the focused closure test and the related Western Liang foundation test.
- [ ] Run coverage, `tsc`, build, and repository diff-check commands.
- [ ] Review `git diff` for only Western Liang and focused-test changes, then commit with a Western Liang closure message.
