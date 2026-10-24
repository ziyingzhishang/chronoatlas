# 高句丽终止链闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成高句丽 668 年终止链的数据、引用和专项闭环测试。

**Architecture:** 复用现有静态历史知识图谱数据结构；通过新增末期人物、来源、claims 和事件详情，把 668 年平壤失守、中央政权终止、唐/新罗承接、遗民与渤海后续拆成可验证节点。专项测试直接读取 canonical data 并调用知识覆盖审计，避免修改通用运行时逻辑。

**Tech Stack:** TypeScript, Vitest, Vite, existing knowledge coverage audit.

## Global Constraints

- 仅修改高句丽终止链及其专项测试、设计/计划文档。
- 不修改新罗数据或无关政权基线。
- 668 年事件保持 `datePrecision: 'year'`；669—676 年和 698 年后续使用明确的 `range`/`approximate` 语义。
- 高句丽中央政权终止、遗民复兴、渤海后续和城市遗产延续不得合并成同一事实。

### Task 1: Add the failing closure test

**Files:**
- Create: `src/data/goguryeo-termination-closure.test.ts`

- [ ] **Step 1: Write assertions for all closure dimensions**

Assert the canonical polity, 668 event/detail, late figures, person claims, Pyongyang and Ji’an heritage, source references, exact time review, and that every high-level Goguryeo closure reference resolves.

- [ ] **Step 2: Run the focused test**

Run: `npm test -- --run src/data/goguryeo-termination-closure.test.ts`

Expected: FAIL because the late-person records, claims, event phases, source links, and closure references are not complete.

### Task 2: Add source-backed Goguryeo termination data

**Files:**
- Modify: `src/data/sources.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/event-time-review.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/heritage.ts`
- Modify: `src/data/heritage-details.ts`

- [ ] **Step 1: Add canonical sources**

Add official Korean-history and UNESCO records for the 668 fall, Bojang Wang, Goguryeo revival/remnant history, Balhae formation, and capital-city heritage. Every new `sourceIds` value must resolve through `sourceNotes`.

- [ ] **Step 2: Add late people and details**

Add `bojang-goguryeo`, `yeon-gaesomun`, `yeon-namsaeng`, `yeon-namgeon`, `go-yeonmu`, and `dae-joyeong` with bounded roles, dates, polity membership, key events, and uncertainty notes. Keep Dae Joyeong as later Balhae context, not as a Goguryeo ruler.

- [ ] **Step 3: Add claims and event closure**

Add Bojang’s rule/participation, Yeon family succession/power relationships, late Goguryeo participation, Tang/Silla direct participants, and remnant/ Balhae contextual links. Expand event phases to separate the September 668 fall, Tang An dong administration, 669–676 remnant conflict, and c.698 Balhae formation.

- [ ] **Step 4: Complete polity/capital/heritage links and time audit**

Link the new people, event, claims, and Pyongyang heritage into `goguryeo` detail; add 668 event time review as confirmed year; extend Pyongyang detail with the modern-city and post-668 archaeological continuity boundary.

- [ ] **Step 5: Run focused test and refactor only within scope**

Run the focused closure test until green, fixing data links rather than weakening assertions.

### Task 3: Run required verification and commit

**Files:**
- Modify: only files listed in Tasks 1–2.

- [ ] **Step 1: Run the专项 test and coverage audit**

Run: `npm test -- --run src/data/goguryeo-termination-closure.test.ts` and `npm run audit:coverage`.

- [ ] **Step 2: Run TypeScript and production build**

Run: `npx tsc -b` and `npm run build`.

- [ ] **Step 3: Run diff-check and inspect scope**

Run the repository’s available diff-check command or script, then `git diff --check` and `git diff --name-only`; reject any changed file outside the high句丽 closure scope and docs.

- [ ] **Step 4: Run the full test suite**

Run: `npm test -- --run`.

- [ ] **Step 5: Commit the verified closure**

```bash
git add docs/superpowers/specs/2026-10-24-goguryeo-termination-closure-design.md docs/superpowers/plans/2026-10-24-goguryeo-termination-closure.md src/data
git commit -m "feat: close Goguryeo termination chain"
```
