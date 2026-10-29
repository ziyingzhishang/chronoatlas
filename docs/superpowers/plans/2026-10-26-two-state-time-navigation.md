# Two-State Time Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current collapsed/compact/expanded timeline density model with a 52px map exploration bar and one responsive time-analysis panel.

**Architecture:** `TimeController` owns only `bar | analysis` mode and delegates rendering to focused exploration-bar and analysis-panel components. Timeline state remains separate from map camera and topic navigation; a container observer, not window width alone, selects wide, narrow, mobile, and short-height presentations.

**Tech Stack:** React 18, TypeScript, ResizeObserver, CSS container queries, Vitest, Testing Library, MapLibre integration tests.

## Global Constraints

- Preserve current year, timeline window, map camera, layers, topic selection, and navigation history when opening or closing time analysis.
- Preserve no-year-zero stepping and final-frame MapLibre update behavior.
- The exploration bar is at most 52px plus safe-area inset.
- There is one visible entry to open time analysis; remove the competing “刻度”, “展开”, and handle-click density actions.
- Wide bars retain compact year and era context; mobile may omit visible context but must include it in the accessible group name.
- Events and boundary/data changes are mutually exclusive annotation layers and default to `none`.
- Selecting a dynasty changes only the timeline window, not the current map year.
- Floating layout is an advanced wide-screen option and never appears on mobile, portrait tablet, short-height, or an approximately 560px split map pane.
- Responsive decisions use the actual `MapPane` container dimensions.

---

## Planned File Structure

- `src/workspace/time-navigation-state.ts`: reducer and state transitions.
- `src/workspace/time-navigation-state.test.ts`: pure transition tests.
- `src/workspace/TimeExplorationBar.tsx`: compact year/era, playback, step, scrub, open action.
- `src/workspace/TimeExplorationBar.test.tsx`: bar behavior and accessibility.
- `src/workspace/TimeAnalysisPanel.tsx`: structured time analysis shell.
- `src/workspace/TimeAnalysisPanel.test.tsx`: ranges, annotations, close/focus behavior.
- `src/workspace/usePaneSize.ts`: ResizeObserver-based map-pane classification.
- `src/workspace/usePaneSize.test.tsx`: container-size behavior.
- `src/workspace/TimeController.tsx`: two-state orchestration and optional advanced layout.
- `src/components/Timeline.tsx`: analysis content without duplicate header/actions.
- `src/styles/workspace.css`: two-state responsive layout.

### Task 1: Define the two-state navigation model

**Files:**
- Create: `src/workspace/time-navigation-state.ts`
- Create: `src/workspace/time-navigation-state.test.ts`

**Interfaces:**
- Produces: `TimeNavigationMode = 'bar' | 'analysis'`.
- Produces: `TimelineAnnotationLayer = 'none' | 'events' | 'changes'`.
- Produces: `timeNavigationReducer(state, action)`.

- [ ] **Step 1: Write reducer tests**

```ts
expect(reducer(initial, { type: 'open-analysis' }).mode).toBe('analysis');
expect(reducer(open, { type: 'close-analysis' })).toMatchObject({
  mode: 'bar', annotationLayer: open.annotationLayer,
});
expect(reducer(initial, { type: 'show-events' }).annotationLayer).toBe('events');
expect(reducer(events, { type: 'show-changes' }).annotationLayer).toBe('changes');
```

Also prove there is no compact/expanded state and that layout preference is orthogonal to navigation mode.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx vitest --run src/workspace/time-navigation-state.test.ts`  
Expected: FAIL because the model does not exist.

- [ ] **Step 3: Implement the minimal reducer**

```ts
export interface TimeNavigationState {
  mode: TimeNavigationMode;
  annotationLayer: TimelineAnnotationLayer;
}
```

Actions are `open-analysis`, `close-analysis`, `show-none`, `show-events`, and `show-changes`. Do not place current year, timeline window, map camera, or topic selection in this reducer.

- [ ] **Step 4: Run tests and commit**

```bash
npx vitest --run src/workspace/time-navigation-state.test.ts
git add src/workspace/time-navigation-state.ts src/workspace/time-navigation-state.test.ts
git commit -m "refactor: define two-state time navigation"
```

### Task 2: Classify the actual map-pane size

**Files:**
- Create: `src/workspace/usePaneSize.ts`
- Create: `src/workspace/usePaneSize.test.tsx`
- Modify: `src/workspace/layout.ts`
- Modify: `src/workspace/layout.test.ts`

**Interfaces:**
- Produces: `usePaneSize(ref): { width, height, presentation }`.
- Presentation values: `wide`, `narrow`, `mobile`, `short`.

- [ ] **Step 1: Write ResizeObserver-driven tests**

Simulate:

- 900×800 → `wide`
- 560×800 → `narrow`
- 390×844 → `mobile`
- 844×390 → `short`

Assert resizing only the pane, without changing `window.innerWidth`, changes the classification.

- [ ] **Step 2: Run tests and verify current window-only logic fails**

Run: `npx vitest --run src/workspace/usePaneSize.test.tsx src/workspace/layout.test.ts`.

- [ ] **Step 3: Implement pane measurement**

Observe the `MapPane` element with `ResizeObserver`, use a synchronous initial rectangle, and avoid state updates when width/height are unchanged. Define thresholds in one pure `presentationForPane(width, height)` function so tests and components share them.

- [ ] **Step 4: Run tests and commit**

```bash
npx vitest --run src/workspace/usePaneSize.test.tsx src/workspace/layout.test.ts
git add src/workspace/usePaneSize.ts src/workspace/usePaneSize.test.tsx src/workspace/layout.ts src/workspace/layout.test.ts
git commit -m "fix: adapt time navigation to the map pane"
```

### Task 3: Build the 52px exploration bar

**Files:**
- Create: `src/workspace/TimeExplorationBar.tsx`
- Create: `src/workspace/TimeExplorationBar.test.tsx`
- Remove after migration: `src/workspace/CollapsedTimeControls.tsx`
- Remove after migration: `src/workspace/CollapsedTimeControls.test.tsx`
- Modify: `src/i18n/text.ts`

**Interfaces:**
- Props: `year`, `eraLabel`, `viewWindow`, `isPlaying`, `presentation`, `analysisOpen`, `onYearChange`, `onYearCommit`, `onPlayToggle`, `onOpenAnalysis`.
- Preserves `input` preview and `change` commit for the optional quick scrubber.

- [ ] **Step 1: Write behavior and accessibility tests**

Assert:

- wide shows year/era, step, play, scrubber, and one “打开时间轴” button;
- mobile shows step, play, and open controls without visual year duplication;
- mobile group accessible name includes the formatted current year;
- step from `-1` forward produces `1`;
- manual step and scrub commit call the supplied stop/commit path;
- there are no “刻度” or “展开” actions.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest --run src/workspace/TimeExplorationBar.test.tsx`.

- [ ] **Step 3: Implement the bar**

Use the existing timeline index helpers and `viewWindow` for stepping and scrubbing. Render the quick range input only for `wide`; render compact year/era for `wide` and `narrow` if the controls still meet 44px target sizes. The single open button uses `aria-expanded={analysisOpen}` and `aria-controls="time-analysis-panel"`.

- [ ] **Step 4: Add CSS height and overflow assertions**

Add a DOM class contract test that requires `time-exploration-bar`; CSS must set `min-height` and `height` to 52px, plus bottom safe-area padding on its outer controller. No child uses absolute positioning outside the `MapPane`.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest --run src/workspace/TimeExplorationBar.test.tsx
git add src/workspace/TimeExplorationBar.tsx src/workspace/TimeExplorationBar.test.tsx src/workspace/CollapsedTimeControls.tsx src/workspace/CollapsedTimeControls.test.tsx src/i18n/text.ts
git commit -m "feat: add the map exploration time bar"
```

### Task 4: Restructure Timeline as analysis content

**Files:**
- Modify: `src/components/Timeline.tsx`
- Modify: `src/components/Timeline.test.tsx`
- Create: `src/workspace/TimeAnalysisPanel.tsx`
- Create: `src/workspace/TimeAnalysisPanel.test.tsx`

**Interfaces:**
- `Timeline` consumes `annotationLayer` and no longer consumes density.
- `TimeAnalysisPanel` owns close, range menu, annotations, and advanced-tools entry.

- [ ] **Step 1: Write red presentation tests**

Assert an open analysis panel has exactly one play button in the overall controller, no duplicate large year heading, one range label, one timeline slider, and annotation controls `无/历史事件/资料变化`. Assert only the selected annotation content is mounted.

- [ ] **Step 2: Run tests and capture the current duplicate controls**

Run: `npx vitest --run src/components/Timeline.test.tsx src/workspace/TimeAnalysisPanel.test.tsx`  
Expected: FAIL against current density-based markup.

- [ ] **Step 3: Split analysis shell from chronology content**

Move range/menu/close and annotation selection to `TimeAnalysisPanel`. Keep chronology bands, ruler, slider, precise year, and “回到当前年份” in `Timeline`. Remove the second large year/era heading and duplicate play/step controls from `Timeline`.

- [ ] **Step 4: Make annotations mutually exclusive and unmounted when inactive**

`events` mounts event clusters; `changes` mounts nearby published change nodes; `none` mounts neither. Keep full event discovery in the existing top search, not the analysis panel.

- [ ] **Step 5: Prove dynasty selection preserves current year**

Add a test selecting a period and assert `onViewWindowChange` is called while `onYearChange` is not.

- [ ] **Step 6: Run tests and commit**

```bash
npx vitest --run src/components/Timeline.test.tsx src/workspace/TimeAnalysisPanel.test.tsx
git add src/components/Timeline.tsx src/components/Timeline.test.tsx src/workspace/TimeAnalysisPanel.tsx src/workspace/TimeAnalysisPanel.test.tsx
git commit -m "refactor: turn the timeline into an analysis panel"
```

### Task 5: Orchestrate two states in TimeController

**Files:**
- Modify: `src/workspace/TimeController.tsx`
- Modify: `src/workspace/TimeController.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: reducer, pane presentation, exploration bar, and analysis panel.
- Produces only `bar` and `analysis` user-visible modes.

- [ ] **Step 1: Write red orchestration tests**

Assert:

- initial mode is bar;
- one open action mounts analysis;
- close and Escape unmount it and restore focus to open;
- opening/closing does not call year, view-window, camera, layer, or topic reset callbacks;
- no density attributes or compact/expanded labels remain;
- narrow/mobile/short panes do not expose floating layout;
- an existing stored floating preference is ignored when unsupported.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest --run src/workspace/TimeController.test.tsx src/app/App.test.tsx`.

- [ ] **Step 3: Replace density state with the reducer**

Delete `collapsed | compact | expanded`. The handle no longer toggles density. In bar mode render only `TimeExplorationBar`; in analysis render the bar-level primary actions once plus `TimeAnalysisPanel`.

- [ ] **Step 4: Move layout actions under advanced controls**

Retain the existing floating preference parser for compatibility, but expose floating/docked/reset only through the analysis panel’s “更多时间工具 → 布局” and only when `presentation === 'wide'`.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest --run src/workspace/TimeController.test.tsx src/app/App.test.tsx
git add src/workspace/TimeController.tsx src/workspace/TimeController.test.tsx src/app/App.tsx src/app/App.test.tsx
git commit -m "refactor: orchestrate two-state time navigation"
```

### Task 6: Implement responsive analysis presentations

**Files:**
- Modify: `src/styles/workspace.css`
- Modify: `src/workspace/TimeAnalysisPanel.tsx`
- Modify: `src/workspace/TimeAnalysisPanel.test.tsx`
- Modify: `src/workspace/WorkspaceShell.tsx`
- Modify: `src/workspace/WorkspaceShell.test.tsx`

**Interfaces:**
- Wide/narrow: docked panel inside `MapPane`.
- Mobile portrait: bottom panel no higher than 42dvh.
- Short/phone landscape: exclusive time-analysis view with inert map background.

- [ ] **Step 1: Add layout-contract tests**

For each presentation, assert the intended class, that the panel remains under the map pane, and that short mode marks the map background inert while analysis is open. Verify closing restores the exact previous workspace state.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest --run src/workspace/TimeAnalysisPanel.test.tsx src/workspace/WorkspaceShell.test.tsx`.

- [ ] **Step 3: Implement CSS and exclusive-view wiring**

Use container queries where styling alone suffices. Wide analysis max height is 220px; portrait mobile max height is 42dvh; short mode uses the workspace’s single-view mechanism instead of overlaying a half-height map. Keep attribution and scale visible whenever the map remains visible.

- [ ] **Step 4: Test focus and inert behavior**

Assert background controls cannot receive focus in exclusive analysis and that close/Escape restores focus and state.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest --run src/workspace/TimeAnalysisPanel.test.tsx src/workspace/WorkspaceShell.test.tsx
git add src/styles/workspace.css src/workspace/TimeAnalysisPanel.tsx src/workspace/TimeAnalysisPanel.test.tsx src/workspace/WorkspaceShell.tsx src/workspace/WorkspaceShell.test.tsx
git commit -m "feat: adapt time analysis across screen shapes"
```

### Task 7: Preserve map update and navigation semantics

**Files:**
- Modify: `src/app/integration.test.tsx`
- Modify: `src/workspace/frame-updates.test.ts`
- Modify: `src/components/HistoricalMapCanvas.test.tsx`
- Modify production files only if these tests expose a real regression

**Interfaces:**
- Preserves preview/final update protocol and stale-frame protection.

- [ ] **Step 1: Add interaction integration coverage**

Test:

1. Start at year 800 with a known camera.
2. Open analysis, select a dynasty range, and confirm year/camera unchanged.
3. Drag the slider through several previews and commit the final year.
4. Confirm rendered map year equals the committed year.
5. Close analysis and confirm camera, layers, topic, and range are preserved.
6. Play, pause, and verify the final rendered year stabilizes.
7. Step from -1 to 1 with no year zero.

- [ ] **Step 2: Run integration tests**

Run:

```bash
npx vitest --run src/app/integration.test.tsx src/workspace/frame-updates.test.ts src/components/HistoricalMapCanvas.test.tsx
```

Expected: PASS without recreating MapLibre or resetting camera.

- [ ] **Step 3: Commit tests and any minimal verified fix**

```bash
git add src/app/integration.test.tsx src/workspace/frame-updates.test.ts src/components/HistoricalMapCanvas.test.tsx
git commit -m "test: preserve map state through time analysis"
```

### Task 8: Browser acceptance and documentation

**Files:**
- Create: `docs/2026-10-26-两态时间导航验收.md`
- Modify: tests/CSS only for defects found during acceptance

**Interfaces:**
- Records exact measured dimensions and screenshots/observations for the approved viewport matrix.

- [ ] **Step 1: Run automated validation**

```bash
npx vitest --run --exclude '.worktrees/**'
npm run build
git diff --check
```

Expected: all tests and build PASS.

- [ ] **Step 2: Verify the required viewport matrix in the real browser**

Check:

- 1440×900
- 1024×768
- 809×934
- 390×844
- 844×390
- desktop split with an approximately 560px `MapPane`

For each, record exploration-bar height, analysis height, horizontal overflow, attribution/scale visibility, focus behavior, open/close state restoration, and whether floating actions are correctly absent or available.

- [ ] **Step 3: Verify keyboard and screen-reader semantics**

Check Tab order, 44px targets, `aria-expanded`, slider value text, Escape, focus return, background inertness, no hidden annotation nodes, and non-spamming playback announcements.

- [ ] **Step 4: Write the acceptance record and commit**

```bash
git add docs/2026-10-26-两态时间导航验收.md
git commit -m "docs: record two-state time navigation acceptance"
```

## Completion Boundary

This plan is complete when users see only an exploration bar and an analysis panel, all approved viewports pass, and map/timeline/topic state remains stable. It does not redesign playback speed, introduce story tours, change historical data, or remove the advanced floating layout from wide screens; those are separate product decisions.
