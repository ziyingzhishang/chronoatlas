# 人物关系类别适用性目录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为全部 170 位人物建立四类关系适用性目录，并让人物关系审计区分 required 缺失、review 和明确不适用。

**Architecture:** 独立适用性模块从现有人物角色、关系 claims 和事件详情生成完整目录；覆盖审计只消费目录元数据，关系证据仍从既有事实目录解析。报告新增按类别状态计数、覆盖率、真正待补人物和待复核人物。

**Tech Stack:** TypeScript、Vitest、现有 `Person`、`HistoricalClaim`、`HistoricalEventDetail` 类型。

## Global Constraints

- 不修改 `src/data/claims.ts`。
- 不修改 UI 或人物详情组件。
- 不把 `review` 当作已完成，也不把无法判断的类别标记为 `not-applicable`。
- 保留 `notApplicableByPersonId` 作为测试/兼容覆盖入口。

### Task 1: 适用性目录与专项测试

**Files:**
- Create: `src/data/person-relationship-applicability.ts`
- Create: `src/data/person-relationship-applicability.test.ts`

**Interfaces:**
- Produces `personRelationshipApplicabilityCategoryKeys`, `PersonRelationshipApplicabilityStatus`, `PersonRelationshipApplicabilityRecord`, `PersonRelationshipApplicabilityCatalog`, `buildPersonRelationshipApplicabilityCatalog()` and `personRelationshipApplicability`.

- [ ] **Step 1: 写失败测试**，验证 170 人×4 类、状态枚举、理由/证据、状态计数与未解析人物拒绝。
- [ ] **Step 2: 运行专项测试确认在模块不存在或断言失败时红灯。**
- [ ] **Step 3: 实现最小目录生成器**，默认 `review`，仅以可解释角色/已有证据规则产生 `required` 或 `not-applicable`。
- [ ] **Step 4: 运行专项测试转绿。**

### Task 2: 接入人物关系覆盖审计

**Files:**
- Modify: `src/data/person-relationship-coverage.ts`
- Modify: `src/data/person-relationship-coverage.test.ts`

**Interfaces:**
- Consumes `personRelationshipApplicability` and `PersonRelationshipApplicabilityCatalog`.
- Produces `requiredMissingCategoryKeys`、`reviewCategoryKeys`、`requiredMissingByCategory`、`reviewByCategory`、`applicabilityStatusCounts`、`coverageByCategory`、`needsReviewPersonIds`。

- [ ] **Step 1: 写失败测试**，验证默认读取目录、required/review/not-applicable 分流和覆盖率。
- [ ] **Step 2: 运行定向测试确认红灯。**
- [ ] **Step 3: 接入默认目录并扩展报告字段，保持显式兼容覆盖入口。**
- [ ] **Step 4: 运行定向测试和全量测试。**

### Task 3: 验收与提交

- [ ] 运行 `npm run build`。
- [ ] 运行 `git diff --check`。
- [ ] 确认 `claims.ts`、UI、人物详情组件未变更。
- [ ] 提交 `feat: add person relationship applicability catalog`。
