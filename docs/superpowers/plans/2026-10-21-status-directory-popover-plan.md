# 状态入口与政权地点目录浮层 Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with a test after each behavior change.

**Goal:** 将当前历史状态标签变为左上角政权与地点目录入口，并在搜索框下方显示紧凑浮层。

**Architecture:** `App` 管理目录浮层的打开状态和当前选择；目录内容复用 `InfoPanel` 的数据与本地化逻辑，通过紧凑变体呈现。搜索、目录和地图详情不再依赖右侧面板布局。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、现有 workspace CSS。

## Global Constraints

- 地图主体保持全屏，不因目录浮层出现横向挤压。
- 左上角组件统一使用 16px 边缘间距和 8px 组件间距。
- 目录浮层内容过长时内部滚动，不能撑开页面。
- 复用现有政权、地点、本地化和地图定位逻辑，不新增历史数据。

### Task 1: 提取紧凑目录内容

**Files:**
- Create: `src/components/DirectoryPopover.tsx`
- Test: `src/components/DirectoryPopover.test.tsx`

**Interfaces:**
- Consumes: `HistoricalState`, `SelectedEntity`, `onSelectEntity`, `onYearChange`, `onClose`。
- Produces: `DirectoryPopover`，展示当前年份政权和地点列表，支持选择条目和关闭。

- [ ] 写失败测试：目录显示政权、地点，点击条目调用选择回调。
- [ ] 运行 `npm test -- --run src/components/DirectoryPopover.test.tsx`，确认组件尚不存在。
- [ ] 实现紧凑目录，复用 `InfoPanel` 的字段与本地化文案，政权和地点列表均支持滚动。
- [ ] 运行同一测试并确认通过。
- [ ] 提交目录组件和测试。

### Task 2: 接入状态入口和浮层布局

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/styles/workspace.css`
- Test: `src/app/integration.test.tsx`

**Interfaces:**
- `App` 使用 `directoryOpen` 控制浮层；状态入口按钮切换该状态。
- 搜索框聚焦时设置 `directoryOpen=false`。
- 目录浮层位于搜索框容器下方，与搜索框同宽。

- [ ] 写失败集成测试：点击状态入口显示目录，点击搜索框后目录收起。
- [ ] 实现状态入口按钮语义、目录挂载和左上角间距变量。
- [ ] 增加窄视口的最大宽度、最大高度和内部滚动规则。
- [ ] 运行 App 与集成测试，修复状态切换回归。
- [ ] 提交接入和布局改动。

### Task 3: 浏览器验收与完整验证

**Files:**
- Verify: `src/app/App.test.tsx`, `src/app/integration.test.tsx`, `src/components/DirectoryPopover.test.tsx`。

- [ ] 运行 `npm test -- --run`，确认全部测试通过。
- [ ] 运行 `npm run build`，记录已有的大包体积警告。
- [ ] 在本地浏览器验证状态入口、目录展开、搜索聚焦收起、目录内部滚动和地图空白关闭。
- [ ] 运行 `git diff --check`，确认工作树无格式错误。
