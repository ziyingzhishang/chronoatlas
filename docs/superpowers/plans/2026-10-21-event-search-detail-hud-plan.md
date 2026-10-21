# Event Search Detail HUD Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with a test after each behavior change.

**Goal:** 将历史事件详情从右侧抽屉迁移到左上角事件搜索浮层下方的二级详情卡片。

**Architecture:** 保留 `App` 作为事件搜索状态与地图年份跳转的协调者；抽取一个可复用的 `EventDetailCard`，由搜索浮层直接渲染。时间轴事件标记仍调用同一事件选择状态，但不再打开事件右侧 `WorkspacePanel`。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、现有 workspace CSS。

## Global Constraints

- 地图主体不因事件详情出现右侧抽屉或横向挤压。
- 搜索筛选和事件列表在详情打开时继续可见。
- 详情内容独立滚动，浮层宽度与搜索框对齐。
- 地图空白点击关闭事件详情和疆域详情，不改变地图年份。
- 复用现有本地化、事件字段、出处和地图定位逻辑。

### Task 1: 抽取事件详情卡片

**Files:**
- Create: `src/components/EventDetailCard.tsx`
- Test: `src/components/EventDetailCard.test.tsx`

**Interfaces:**
- Consumes `HistoricalEvent`, `year`, `onYearChange`, `onBack` and optional `onLocate`.
- Produces a compact card with event title, metadata, narrative sections, references, and a back/close action.

- [ ] Write failing tests for title, narrative fields, back action, and year navigation.
- [ ] Run the focused test and confirm the component is missing.
- [ ] Implement the card by moving the detail rendering semantics from `EventExplorer` without changing content.
- [ ] Run the focused test and confirm it passes.
- [ ] Commit the component and tests.

### Task 2: Move event detail into the search floating stack

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/components/EventExplorer.tsx`
- Modify: `src/styles/workspace.css`
- Test: `src/app/App.test.tsx`
- Test: `src/app/integration.test.tsx`

**Interfaces:**
- `App` owns `selectedEntity.type === 'event'` and renders `EventDetailCard` below the event search results.
- `selectEvent` updates the year and selected event but does not set `panel='events'`.
- `EventExplorer` continues to support timeline event groups and list semantics, while its detail branch delegates to `EventDetailCard` or is removed from the workspace-only path.

- [ ] Add failing integration assertions that selecting a search result leaves no `历史转折` complementary drawer and renders the detail card inside the search popover.
- [ ] Add failing assertions for selecting another event replacing the detail card and for the back action preserving the list.
- [ ] Update `App` to render the selected event card in the search popover and keep the search popover open after selection.
- [ ] Change `selectEvent` to preserve the search context instead of opening the workspace panel.
- [ ] Add CSS for the stacked list/detail card, max height, internal scrolling, selected list item, and narrow screens.
- [ ] Run App and integration tests, then fix regressions in timeline event selection.
- [ ] Commit the floating event detail behavior.

### Task 3: Clear event detail on blank map interaction

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/components/HistoricalMapCanvas.tsx`
- Test: `src/app/integration.test.tsx`

**Interfaces:**
- Existing `onClearSelection` clears polity/place details; extend it to clear an event selection while retaining the search query and filters as appropriate.

- [ ] Add a failing test for selecting an event, clicking blank map, and dismissing the detail card.
- [ ] Update the clear-selection coordinator and map click path.
- [ ] Run the integration test and confirm the map remains at the selected event year.
- [ ] Commit the interaction fix.

### Task 4: Full verification and browser QA

**Files:**
- Verify: `src/app/App.test.tsx`, `src/app/integration.test.tsx`, `src/components/EventDetailCard.test.tsx`.

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build` and record the existing chunk-size warning if present.
- [ ] Reload the local browser app and verify the stacked search list/detail behavior at desktop and narrow viewport sizes.
- [ ] Run `git diff --check`, inspect status, and commit any final test-only adjustments.
