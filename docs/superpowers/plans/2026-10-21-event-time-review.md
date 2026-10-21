# Event Time Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立覆盖当前 37 个非精确事件的可审计时间证据目录，并输出可供学习界面解释的 coverage report。

**Architecture:** 静态目录只保存人工判断，审计函数从既有事件和事件详情读取 `datePrecision` 与 `sourceIds`，避免事实复制。返回值同时包含逐项记录、状态计数和数据一致性问题。

**Tech Stack:** TypeScript、Vitest、现有 `HistoricalEvent` / `HistoricalEventDetail` 数据模型。

## Global Constraints

- 不补年份，不修改现有事件时间字段。
- 不修改政权详情、`people`、`person-details` 或 UI 文件。
- 证据来源必须复用 `eventDetails[*].sourceIds`，时间精度必须复用 `events[*].datePrecision`。

### Task 1: 定义失败测试

**Files:**
- Create: `src/data/event-time-review.test.ts`

**Interfaces:**
- Tests will consume `eventTimeReview`, `reviewEventTimeCoverage`, and the report types from `src/data/event-time-review.ts`.

- [ ] **Step 1: Write tests for complete coverage, derived evidence, and audit failures.**
- [ ] **Step 2: Run `npm test -- --run src/data/event-time-review.test.ts` and confirm the module is missing or assertions fail for the intended reason.**

### Task 2: Implement the directory and coverage audit

**Files:**
- Create: `src/data/event-time-review.ts`

**Interfaces:**
- Produces `eventTimeReview`, `EventTimeReviewStatus`, `EventTimeTimelineStrategy`, `EventTimeReviewRecord`, `EventTimeCoverageReport`, and `reviewEventTimeCoverage()`.

- [ ] **Step 1: Add one metadata entry for each of the 37 events whose existing precision is not `year`.**
- [ ] **Step 2: Implement the audit by joining entries to `events` and `eventDetails`, reporting missing entries, missing details, unknown sources, and mismatches without changing source data.**
- [ ] **Step 3: Run the focused test and then the full suite.**
- [ ] **Step 4: Run `npm run build` and `git diff --check`.**
- [ ] **Step 5: Commit the implementation and test with `feat: add auditable event time review catalog`.**

## Self-review

The plan covers the requested independent directory, tests, auditable callable report, source/date reuse, and explicit non-UI scope. No year calculation or unrelated entity data is included.
