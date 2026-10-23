# 遗产地点关联与端点闭合实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 闭合西明寺遗产的既有专属事件关联，并让遗产详情可以打开其结构化地点，同时保留其他遗产的明确审计边界。

**Architecture:** 继续使用现有 `HeritageAsset.placeId` 作为地点关系的单一来源，由 App 将该 ID 传给 `HeritageDetail`；详情组件复用现有实体导航回调，不引入新的地点数据层。Coverage 只根据已存在的事件目录判断端点，西明寺移除无法解析的共享事件 ID 后回到 complete，其余四项维持 needs-review。

**Tech Stack:** React 18、TypeScript、Vitest、Testing Library、Vite。

## Global Constraints

- 只修改 heritage/place 相关生产数据、coverage、详情交互、测试和审计/设计/计划文档。
- 不修改 `capital-*`、`city-*`、事件目录/事件详情、人物关系、政权关系或用户已有未提交文件。
- 不把西明寺约址升级为精确坐标，不新增统一玄奘译经事件。
- 必须遵守 TDD：先写能失败的测试，再写最小生产代码。

---

### Task 1: 闭合西明寺遗产事件关联并更新 coverage 回归

**Files:**
- Modify: `src/data/heritage-details.ts`，仅修改 `ximing-temple-site` 的 `associatedEvents` 与对应不确定性文案。
- Test: `src/data/heritage-detail-coverage.test.ts`，更新 103/5 统计与审计列表，增加西明寺闭合断言。
- Test: `src/data/heritage-details.integration.test.ts`，增加西明寺地点、专属事件和约址边界断言。

**Interfaces:**
- Consumes: `heritageDetails`、`events`、`places`、`sourceNotes`。
- Produces: `buildHeritageDetailCoverageReport()` 返回 104 项 complete、4 项 needs-review；西明寺 `unresolvedReferenceIds.events` 为空。

- [ ] **Step 1: Write the failing test**

在 coverage 测试中将正常报告期望改为 104 项 complete、四项 review，并断言 `ximing-temple-site` 为 complete 且没有未解析事件。在集成测试中断言西明寺仍有 `changan` 地点参照、现代位置仍含“约址”、两个专属事件端点存在、所有关联事件都能在 `events` 目录解析，并且不含 `xuanzang-translations`。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/data/heritage-detail-coverage.test.ts src/data/heritage-details.integration.test.ts`

Expected: FAIL because the existing report still has 103 complete/5 needs-review and `ximing-temple-site` still references the unresolved `xuanzang-translations` ID.

- [ ] **Step 3: Write minimal implementation**

In the `ximing-temple-site` detail, remove only `xuanzang-translations` from `associatedEvents`, retaining `ximing-temple-built`, `xuanzang-at-ximing-658`, and `tang-founded`. Update the uncertainty sentence to say the cross-heritage unified event remains unclosed and is intentionally not attached to this detail.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/data/heritage-detail-coverage.test.ts src/data/heritage-details.integration.test.ts`

Expected: PASS with the four remaining review IDs unchanged.

- [ ] **Step 5: Commit**

Run: `git add src/data/heritage-details.ts src/data/heritage-detail-coverage.test.ts src/data/heritage-details.integration.test.ts && git commit -m "feat: close Ximing heritage event endpoints"`

### Task 2: Add heritage-to-place detail navigation

**Files:**
- Modify: `src/components/HeritageDetail.tsx`，增加 `place` 导航目标、地点标签解析和地点按钮。
- Modify: `src/app/App.tsx`，把 `asset.placeId` 传给 `HeritageDetail`。
- Test: `src/components/HeritageDetail.test.tsx`，增加地点按钮导航断言。

**Interfaces:**
- Consumes: `HeritageAsset.placeId`、`places`、existing `openDetail` callback and `DetailEntity` union。
- Produces: clicking the heritage detail location button calls `onNavigate({ type: 'place', id: placeId })`.

- [ ] **Step 1: Write the failing test**

在 `HeritageDetail.test.tsx` 渲染 `ximing-temple-site`，传入 `placeId="changan"` 和 mock `onNavigate`，点击名称为“长安”的地点按钮，并断言收到 `{ type: 'place', id: 'changan' }`。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/HeritageDetail.test.tsx`

Expected: FAIL because the component has no `placeId` prop or place navigation button.

- [ ] **Step 3: Write minimal implementation**

在 `HeritageDetail.tsx` 引入 `places`，把 `HeritageNavigationTarget` 扩展为包含 `place`，为 props 增加可选 `placeId`，解析地点历史名并在现代位置旁渲染地点按钮。`App.tsx` 从 `heritageById` 传入 `placeId={asset.placeId}`，不复制或修改地点数据。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/HeritageDetail.test.tsx src/components/EntityDrawer.test.tsx`

Expected: PASS and existing person/polity/event navigation assertions remain green.

- [ ] **Step 5: Commit**

Run: `git add src/components/HeritageDetail.tsx src/components/HeritageDetail.test.tsx src/app/App.tsx && git commit -m "feat: navigate from heritage details to places"`

### Task 3: Record the audit boundary and verify the release slice

**Files:**
- Create: `docs/audits/2026-10-23-heritage-place-closure.md`
- Review: `docs/superpowers/specs/2026-10-23-heritage-place-closure-design.md`
- Review: `docs/superpowers/plans/2026-10-23-heritage-place-closure.md`

**Interfaces:**
- Consumes: updated coverage report and test results.
- Produces: an audit record listing one closed candidate, four retained candidates, explicit location precision limits, and the untouched scope.

- [ ] **Step 1: Write the audit document**

Record the closed candidate `ximing-temple-site`, its existing sources and endpoints, the preserved `changan` city reference/approximate location boundary, and the four remaining review IDs. State that no capital/city data, event/person relationship, or user dirty file was modified.

- [ ] **Step 2: Run focused verification**

Run the targeted heritage/data/UI/App tests, then `npm run build` and `git diff --check`. Expected: all selected tests pass, TypeScript/Vite build succeeds, and `git diff --check` has no output.

- [ ] **Step 3: Verify scope and commit**

Run `git status --short` and `git diff --name-only HEAD~2..HEAD`; confirm changed files are limited to the planned heritage/place data, coverage, detail wiring, tests, and docs. Then stage and commit the audit document with `git commit -m "docs: audit heritage place closure boundary"`.
