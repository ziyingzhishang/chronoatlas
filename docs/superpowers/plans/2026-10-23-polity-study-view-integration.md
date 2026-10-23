# 政权学习视图详情关联集成 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `PolityDetail` 的人物、事件、遗产入口在政权学习视图中可学习，同时把详情关联与当前年份事实严格分层。

**Architecture:** `StudyData` 可选接收真实 `PolityDetail[]`。`buildPolityStudyView` 保持现有按年份、有效期和事件显式 `polityIds` 构建的事实集合不变，另产出详情关联集合；展示层将其放入明确标注的上下文区块，关系网络只消费事实集合。

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Vite。

## Global Constraints

- 不修改 `claims.ts`、`people.ts`、`events.ts`、heritage 数据或既有用户审计文件。
- 保留年份、有效期和 `eventDetails.polityIds` 的证据边界。
- 跨政权遗产只能作为详情关联入口展示，不得变成本年确定归属。
- 先写失败测试，再写生产代码；完成定向测试、`tsc` 和 `build`。

---

### Task 1: 固化学习视图的事实/详情关联契约

**Files:**
- Modify: `src/domain/study-view.test.ts`
- Modify: `src/components/StudyRelationsPanel.integration.test.tsx`
- Test: `src/domain/study-view.test.ts`

**Interfaces:**
- `buildPolityStudyView` 返回 `detailLinkedPeople`、`detailLinkedEvents`、`detailLinkedHeritage` 三个详情关联集合。
- 事实集合 `people`、`events`、`heritage` 继续按当前年份规则工作。

- [ ] **Step 1: Write the failing tests**
  - 构造包含一个超出政权有效期但存在于 `PolityDetail.eventIds` 的事件，断言它只出现在 `detailLinkedEvents`，不出现在 `events`。
  - 构造一个 `eventDetails.polityIds` 明确只属于其他政权的共享来源事件，断言它不因 `PolityDetail.eventIds` 被提升到当前 `events`。
  - 断言详情引用的人物、事件、遗产能在详情关联集合中解析；遗产建设时段不覆盖所选年时不进入该年详情遗产集合。
  - 组件测试断言详情关联区块有明确“不等同于本年事实”标识，且入口可点击。
- [ ] **Step 2: Run tests to verify they fail**
  - Run `npm test -- --run src/domain/study-view.test.ts src/components/StudyRelationsPanel.integration.test.tsx`
  - Expected: FAIL because the new fields and contextual rendering do not exist.

### Task 2: 实现 StudyData 与政权学习视图的分层构建

**Files:**
- Modify: `src/domain/study-view.ts`
- Modify: `src/components/InfoPanel.tsx`
- Test: `src/domain/study-view.test.ts`

**Interfaces:**
- `StudyData.polityDetails?: PolityDetail[]`。
- `PolityStudyView.detailLinkedPeople: Person[]`。
- `PolityStudyView.detailLinkedEvents: HistoricalEvent[]`。
- `PolityStudyView.detailLinkedHeritage: HeritageAsset[]`。

- [ ] **Step 1: Implement the smallest passing data-model change**
  - 根据当前 `polityId` 查找详情。
  - 详情关联集合只解析真实存在的 ID 并去重。
  - 当前事实集合保留现有过滤。
  - 详情事件不改写事实事件集合；详情遗产仅在建设区间覆盖所选年或缺少建设年份时作为上下文入口保留。
  - `InfoPanel` 的政权 `StudyData` 传入 `polityDetails`，城市视图调用保持兼容。
- [ ] **Step 2: Run focused tests**
  - Run `npm test -- --run src/domain/study-view.test.ts`
  - Expected: PASS。

### Task 3: 展示详情关联入口并保留不确定性

**Files:**
- Modify: `src/components/StudyRelationsPanel.tsx`
- Modify: `src/styles/workspace.css` only if the new block needs layout alignment
- Test: `src/components/StudyRelationsPanel.integration.test.tsx`

**Interfaces:**
- 详情关联入口使用现有 `onOpenEntity` 回调，不改变实体详情路由。

- [ ] **Step 1: Implement contextual blocks**
  - 在政权视角下增加“详情关联入口”区块，标注“仅表示详情关联，不等同于本年事实”。
  - 分别展示人物、事件、遗产；事件展示原始年份和 `datePrecision` 的不确定提示。
  - 详情关联不进入 `featuredEvents`、`RelationshipGraph` 或城市时间线。
- [ ] **Step 2: Run focused component tests**
  - Run `npm test -- --run src/components/StudyRelationsPanel.integration.test.tsx src/components/InfoPanel.test.tsx`
  - Expected: PASS。

### Task 4: 新增 Round 110 独立集成审计

**Files:**
- Create: `docs/audits/2026-10-23-round110-polity-study-view-integration.md`
- Create: `src/data/polity-detail-round110-learning.integration.test.ts`

**Interfaces:**
- 审计只读取现有数据和新视图字段，不修改 Round 109 审计。

- [ ] **Step 1: Write the failing audit test**
  - 遍历 87 个政权详情，断言所有可解析的人物、事件、遗产进入详情关联入口。
  - 断言当前事实集合没有因详情引用绕过年份、政权有效期或显式事件 `polityIds`。
  - 断言旧的 116 个“当前事实学习集合”缺口被重新分类为详情关联入口，不宣称为本年事实。
- [ ] **Step 2: Run audit test and fix only implementation defects**
  - Run `npm test -- --run src/data/polity-detail-round110-learning.integration.test.ts`
  - Expected: PASS。
- [ ] **Step 3: Write the audit report**
  - 记录实际新增可学习详情入口数量、仍保留的当前事实边界、未关闭的目录/证据问题。

### Task 5: 全量验证

**Files:**
- No additional production files.

- [ ] **Step 1: Run the full test suite**
  - Run `npm test -- --run`
  - Expected: PASS。
- [ ] **Step 2: Run TypeScript and production build**
  - Run `npx tsc -b`
  - Run `npm run build`
  - Expected: both PASS。
- [ ] **Step 3: Review the final diff**
  - Run `git diff --check` and `git status --short`。
  - Confirm the pre-existing `docs/audits/2026-10-20-short-gap-decisions.md` modification is untouched and forbidden data files remain unchanged。
