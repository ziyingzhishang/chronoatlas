# Immersive Map-First Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ChronoAtlas 改造成地图优先的沉浸式工作台，并为时间轴视窗、地图镜头、事件详情和面板提供可理解、可恢复的返回路径。

**Architecture:** 保留当前 React/MapLibre 数据流，把“当前年份、时间轴视窗、地图镜头、面板状态”作为相互独立的交互状态。默认使用地图全屏探索模式；完整时间轴、图层、事件和详情作为分析模式按需展开。时间轴和地图定位分别维护语义级返回栈，不记录连续拖动或逐帧播放。

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, MapLibre GL JS, CSS media queries.

## Global Constraints

- 地图是第一视觉层，默认打开时不被大面积固定顶部栏和展开时间轴遮挡。
- 完整时间轴和面板通过明确入口召唤；关键操作不能只依赖悬停。
- 时间轴下钻、地图定位、事件详情都必须有返回路径。
- “全历史”“亚洲复位”是预设动作，不替代“返回上一级”或“返回上个视角”。
- 保留现有来源说明、许可证、历史语义提示、键盘操作和焦点恢复。
- 所有新动画尊重 `prefers-reduced-motion`，并使用可中断的短时镜头动画。
- 年份拖动预览不应触发不必要的重型详情和世界资料刷新。

## File Map

- Modify: `src/test/setup.ts` — 明确注册 Testing Library 的 Vitest matchers。
- Create: `src/workspace/navigation-history.ts` — 语义导航栈的纯函数实现。
- Create: `src/workspace/navigation-history.test.ts` — 返回栈去重、回退和上限测试。
- Modify: `src/app/App.tsx` — 维护时间轴视窗历史、探索/分析模式和面板返回上下文。
- Modify: `src/components/Timeline.tsx` — 增加视窗面包屑、返回上一级、当前年份不在视窗内提示，并避免朝代聚焦隐式改年。
- Modify: `src/workspace/TimeController.tsx` — 默认轻量底部 HUD、展开/收起入口和分析模式入口。
- Modify: `src/components/MapView.tsx` — 增加地图镜头返回入口、探索/分析状态提示和更清晰的复位语义。
- Modify: `src/components/HistoricalMapCanvas.tsx` — 暴露可保存/恢复的镜头快照，并为定位动作保留上一个镜头。
- Modify: `src/components/EventExplorer.tsx` — 将事件列表和事件详情组织成可返回的两级结构。
- Modify: `src/workspace/WorkspacePanel.tsx` — 桌面侧面板和移动底部抽屉的遮罩、返回和焦点边界。
- Modify: `src/styles/workspace.css` — 地图优先 HUD、底部时间条、抽屉/遮罩、分析模式布局和 reduced-motion 样式。
- Modify: `src/app/integration.test.tsx`、`src/components/Timeline.test.tsx`、`src/components/EventExplorer.test.tsx`、`src/components/MapView.test.tsx`、`src/workspace/TimeController.test.tsx` — 覆盖新交互契约。
- Modify: `README.md` — 更新探索模式、分析模式和返回操作说明。

---

### Task 1: 修复测试 matcher 并建立导航栈纯函数

**Interfaces:**

- Produces `NavigationHistory<T>` with `push(value): void`, `back(): T | undefined`, `peek(): T | undefined`, `canBack(): boolean`, and `clear(): void`.
- `push` 对连续相同值去重，默认最多保存 20 个语义状态；`back` 返回并移除最近状态。

- [ ] **Step 1: Add navigation-history tests**

在 `src/workspace/navigation-history.test.ts` 覆盖：空栈不可返回、连续重复值不入栈、后进先出、超过 20 项丢弃最旧项、`clear` 清空。

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/workspace/navigation-history.test.ts
```

Expected: FAIL because the module does not exist。

- [ ] **Step 3: Implement the pure navigation history**

创建 `src/workspace/navigation-history.ts`，只使用数组和泛型，不依赖 React、DOM 或 MapLibre。

- [ ] **Step 4: Make Testing Library matchers explicit**

在 `src/test/setup.ts` 保留现有清理和 mock，并显式加入：

```ts
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
expect.extend(matchers);
```

删除重复或冲突的 matcher 初始化，确保 `toBeInTheDocument`、`toHaveAttribute`、`toHaveTextContent` 和 `toHaveFocus` 可用。

- [ ] **Step 5: Run the focused tests and the existing interaction tests**

Run:

```bash
npm test -- --run src/workspace/navigation-history.test.ts src/app/integration.test.tsx src/components/Timeline.test.tsx
```

Expected: matcher 相关失败消失；剩余失败若存在，应是后续交互改造的明确行为差异。

- [ ] **Step 6: Commit**

```bash
git add src/test/setup.ts src/workspace/navigation-history.ts src/workspace/navigation-history.test.ts
git commit -m "test: restore interaction matchers and add navigation history"
```

### Task 2: 将时间轴下钻改为可返回的视窗导航

**Interfaces:**

- `Timeline` receives `viewLabel?: string`, `canGoBack?: boolean`, `onBackView?: () => void`, and `onOpenAnalysis?: () => void`.
- `Timeline` calls `onYearChange` only for explicit year actions, not merely because a dynasty range was focused.

- [ ] **Step 1: Add failing tests for timeline back navigation**

在 `src/components/Timeline.test.tsx` 增加测试：点击《资治通鉴》后显示返回按钮；点击朝代只改变 slider 的视窗范围而不调用 `onYearChange`（当当前年份在全历史范围内）；点击“返回上一级”调用回调。

- [ ] **Step 2: Run focused timeline tests**

```bash
npm test -- --run src/components/Timeline.test.tsx
```

Expected: FAIL because the new controls and callback do not exist。

- [ ] **Step 3: Implement Timeline view context**

在时间轴 heading 下增加当前视窗标签和语义返回入口；当 `year` 不在 `window` 内，显示“当前年份不在本视窗内”和“回到所选年份”。`focusPeriod` 只更新窗口；增加显式“跳到起始年”按钮。

- [ ] **Step 4: Wire App view history**

在 `App.tsx` 保存 `TimelineViewState`，只在专题、朝代和事件分组等语义下钻前调用 `history.push(previousView)`；普通拖动、缩放、平移和播放不入栈。返回时恢复上一个窗口，不改变当前年份。

- [ ] **Step 5: Run timeline and integration tests**

```bash
npm test -- --run src/components/Timeline.test.tsx src/app/integration.test.tsx
```

Expected: 通过原有年份联动测试和新的下钻/返回测试。

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx src/components/Timeline.tsx src/components/Timeline.test.tsx src/app/integration.test.tsx
git commit -m "feat: add reversible timeline drill-down"
```

### Task 3: 把时间控制器改造成探索模式 HUD

**Interfaces:**

- `TimeController` receives `mode?: 'explore' | 'analysis'` and `onModeChange?: (mode) => void`.
- Explore mode renders the year, play/pause, a compact scrubber and an “展开时间轴” action; analysis mode renders the existing full timeline.

- [ ] **Step 1: Add layout tests**

在 `src/workspace/TimeController.test.tsx` 增加测试：默认显示紧凑年份条；点击展开后显示完整历史时间轴；点击收起后返回轻量条；当前年份和播放按钮在两种模式都存在。

- [ ] **Step 2: Implement the two-level controller**

调整 `TimeController.tsx` 的 density/mode 映射：默认使用紧凑 HUD；保留用户偏好但不能让历史遗留的 expanded 状态导致默认遮挡。完整时间轴通过明确按钮打开。

- [ ] **Step 3: Update workspace layout CSS**

在 `workspace.css` 中让地图区域成为全屏视觉背景，顶部 HUD 使用半透明渐变，底部探索条高度固定；分析模式再允许时间轴占据可滚动空间。不得通过 `display:none` 隐藏唯一的年份、返回或关闭入口。

- [ ] **Step 4: Verify desktop and mobile layout contracts**

```bash
npm test -- --run src/workspace/TimeController.test.tsx src/app/integration.test.tsx
npm run build
```

Expected: 测试通过，构建通过；CSS 不引入 TypeScript 或 Vite 错误。

- [ ] **Step 5: Commit**

```bash
git add src/workspace/TimeController.tsx src/workspace/TimeController.test.tsx src/styles/workspace.css src/app/App.tsx
git commit -m "feat: make the map the primary exploration surface"
```

### Task 4: 增加地图镜头返回与定位反馈

**Interfaces:**

- `MapHandle` adds `getCamera(): CameraState | undefined`, `restoreCamera(camera: CameraState): void`, and `focus(entity): void`.
- `MapView` receives `onCameraBack?: () => void` and shows the action only when a previous intentional camera exists.

- [ ] **Step 1: Add failing map camera tests**

在 `src/components/MapView.test.tsx` 和 `src/components/HistoricalMapCanvas.test.tsx` 增加测试：定位动作保存原镜头；“返回上个视角”恢复原镜头；“亚洲复位”仍然执行固定预设，不清除返回语义。

- [ ] **Step 2: Add camera snapshot handling**

在 `HistoricalMapCanvas.tsx` 中以 `CameraState` 记录定位前的中心、缩放、方位和俯仰，使用 `easeTo`/`flyTo` 恢复，动画时长控制在 350—700ms，并在 reduced-motion 时使用无动画路径。

- [ ] **Step 3: Wire map view and App state**

在 `MapView.tsx` 增加返回上个视角按钮和轻量定位提示；在 `App.tsx` 区分 `亚洲复位`、`中原放大`、`全球` 和用户定位历史，不把每次年份变更写入镜头栈。

- [ ] **Step 4: Run map tests and build**

```bash
npm test -- --run src/components/MapView.test.tsx src/components/HistoricalMapCanvas.test.tsx
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MapView.tsx src/components/MapView.test.tsx src/components/HistoricalMapCanvas.tsx src/components/HistoricalMapCanvas.test.tsx src/app/App.tsx
git commit -m "feat: restore previous map camera after focus"
```

### Task 5: 将事件面板改为列表与详情两级抽屉

**Interfaces:**

- `EventExplorer` receives `detailMode?: 'inline' | 'stacked'`, `onBackToList?: () => void` and keeps `selectedId` as the single source of selected event.
- `WorkspacePanel` receives `variant?: 'side' | 'bottom-sheet'` and exposes an optional backdrop close callback.

- [ ] **Step 1: Add failing event navigation tests**

在 `src/components/EventExplorer.test.tsx` 和 `src/app/integration.test.tsx` 增加测试：从事件列表进入详情后显示“返回事件列表”；返回后搜索条件和列表滚动状态保留；定位后仍可返回事件详情和地图原镜头。

- [ ] **Step 2: Implement event list/detail navigation**

将选中事件详情放在列表的明确子状态中；详情顶部显示“事件 / 事件名”和返回列表按钮；不通过滚动位置隐式承担返回操作。

- [ ] **Step 3: Implement responsive panel behavior**

在 `WorkspacePanel.tsx` 增加移动端遮罩、点击遮罩关闭和 `aria` 语义；保留 Escape 关闭与焦点返回；桌面端不遮挡地图全部宽度，移动端底部抽屉限制高度并保持内部滚动。

- [ ] **Step 4: Update panel CSS and interaction tests**

```bash
npm test -- --run src/components/EventExplorer.test.tsx src/app/integration.test.tsx
```

Expected: 事件列表/详情返回、面板关闭和焦点恢复测试通过。

- [ ] **Step 5: Commit**

```bash
git add src/components/EventExplorer.tsx src/components/EventExplorer.test.tsx src/workspace/WorkspacePanel.tsx src/app/integration.test.tsx src/styles/workspace.css
git commit -m "feat: add reversible event drawer navigation"
```

### Task 6: 年份拖动预览、动效约束和文档验收

**Interfaces:**

- Timeline preview updates the visible year label immediately but commits heavy selection work on slider `change`/release.
- `prefers-reduced-motion` disables map and drawer transitions while preserving state changes.

- [ ] **Step 1: Add a regression test for preview vs commit**

在 `src/components/Timeline.test.tsx` 和 `src/app/integration.test.tsx` 验证连续 `input` 只更新预览回调，`change` 才触发完整提交；播放过程中不创建时间轴或镜头返回记录。

- [ ] **Step 2: Implement preview boundary**

保持当前 `onYearCommit` 接口，把完整详情、事件分组和世界资料更新绑定到提交回调；地图历史层继续使用已有 `createLatestFrameUpdater` 合并渲染，避免重建 MapLibre 实例。

- [ ] **Step 3: Add reduced-motion and HUD transitions**

在 `workspace.css` 增加面板、HUD 和定位反馈的短时过渡，并在 `@media (prefers-reduced-motion: reduce)` 中将持续时间归零；不使用持续闪烁。

- [ ] **Step 4: Update README interaction documentation**

说明探索模式、分析模式、时间轴返回、地图镜头返回、事件详情返回，以及桌面/移动端面板行为。

- [ ] **Step 5: Run the complete verification suite**

```bash
npm test -- --run
npm run build
git status --short --branch
```

Expected: 全部测试通过，生产构建通过，工作区只包含已提交内容。

- [ ] **Step 6: Commit the completed phase**

```bash
git add README.md src docs/superpowers/specs/2026-10-21-immersive-map-first-workspace-design.md
git commit -m "feat: finish immersive map-first workspace phase"
```
