# Map Status and Collapsed Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current year, dynasty, time range, and distance from the present immediately readable while turning the collapsed timeline into a genuinely useful one-line controller.

**Architecture:** Add pure presentation selectors for the present-distance and primary-polity labels, extract the map status button into a focused component, and add a dedicated collapsed-control component inside `TimeController`. Keep `App` as the owner of year/playback state and keep the existing `Timeline` mounted only for compact and expanded densities.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, MapLibre integration tests.

## Global Constraints

- Historical year arithmetic has no year zero: 800 to 2026 is 1226 years; BCE 221 to 2026 is 2246 years.
- At 2026, the status label for year 800 must read “距今1226年”.
- The visible status card and search input are both 64px high at the 809×934 acceptance viewport.
- The vertical gap between status card and search input is exactly 18px.
- Collapsed mode is one line, 48–52px high plus safe-area padding, and does not expose clipped timeline body content.
- The state card still opens the directory; the search box still opens search; the two popovers remain mutually exclusive.
- All timeline representations share the same `year`, `isPlaying`, `onYearChange`, and `onPlayToggle` values.
- Topic split mode continues to constrain the timeline to `MapPane`; no viewport-wide positioning is introduced.
- Chinese and English labels must be readable and must not expose entity IDs.

---

## File Structure

- Create `src/presentation/map-status.ts`: pure year-distance calculation, bilingual formatting, and primary Chinese polity selection.
- Create `src/presentation/map-status.test.ts`: arithmetic and readable-label tests.
- Create `src/components/MapStatusHud.tsx`: semantic status-card button.
- Create `src/components/MapStatusHud.test.tsx`: information order, missing-era fallback, and accessible-button behavior.
- Create `src/workspace/CollapsedTimeControls.tsx`: one-line year stepping and playback UI.
- Create `src/workspace/CollapsedTimeControls.test.tsx`: no-year-zero stepping, playback, and accessible names.
- Modify `src/app/App.tsx`: derive the era label and render the new status and collapsed-controller inputs.
- Modify `src/app/App.test.tsx`: verify the integrated status card, search stack, and timeline containment.
- Modify `src/workspace/TimeController.tsx`: render dedicated collapsed controls and omit the full timeline body while collapsed.
- Modify `src/workspace/TimeController.test.tsx`: verify density state and shared callbacks.
- Modify `src/styles/workspace.css`: shared height/gap variables, status-card typography, and collapsed-controller responsive rules.
- Modify `src/i18n/text.ts`: add static interface labels used by the new controls.

---

### Task 1: Pure Historical Status Selectors

**Files:**
- Create: `src/presentation/map-status.ts`
- Create: `src/presentation/map-status.test.ts`

**Interfaces:**
- Consumes: `Polity` from `src/domain/types.ts`; locale values `'zh' | 'en'`.
- Produces: `yearsFromPresent(historicalYear: number, presentYear: number): PresentDistance`, `formatPresentDistance(distance: PresentDistance, locale: 'zh' | 'en'): string`, and `primaryPolityName(polities: Polity[]): string | undefined`.

- [ ] **Step 1: Write failing arithmetic and polity-selection tests**

```ts
import { describe, expect, test } from 'vitest';
import { formatPresentDistance, primaryPolityName, yearsFromPresent } from './map-status';
import type { Polity } from '../domain/types';

test.each([
  [800, 2026, { relation: 'past', years: 1226 }],
  [-221, 2026, { relation: 'past', years: 2246 }],
  [2026, 2026, { relation: 'present', years: 0 }],
  [2027, 2026, { relation: 'future', years: 1 }],
] as const)('calculates %s relative to %s without a year zero', (year, present, expected) => {
  expect(yearsFromPresent(year, present)).toEqual(expected);
});

test('formats distance labels for readers in both locales', () => {
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'zh')).toBe('距今1226年');
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'en')).toBe('1,226 years ago');
  expect(formatPresentDistance({ relation: 'present', years: 0 }, 'zh')).toBe('今年');
  expect(formatPresentDistance({ relation: 'future', years: 1 }, 'zh')).toBe('距今尚有1年');
});

test('selects the first Chinese polity and never falls back to an internal id', () => {
  const base = { type: 'regime', startYear: 618, endYear: 907, color: '#000', description: '', sourceIds: [] } as const;
  const polities = [
    { ...base, id: 'world-test', name: 'Rome', region: 'world' },
    { ...base, id: 'tang', name: '唐', region: 'china' },
  ] as Polity[];
  expect(primaryPolityName(polities)).toBe('唐');
  expect(primaryPolityName([{ ...base, id: 'world-test', name: 'Rome', region: 'world' }] as Polity[])).toBeUndefined();
});
```

- [ ] **Step 2: Run the focused test and confirm it fails because the module does not exist**

Run: `npx vitest --run src/presentation/map-status.test.ts`

Expected: FAIL resolving `./map-status`.

- [ ] **Step 3: Implement the pure selectors**

```ts
import type { Polity } from '../domain/types';

export interface PresentDistance {
  relation: 'past' | 'present' | 'future';
  years: number;
}

function historicalOrdinal(year: number) {
  if (!Number.isInteger(year) || year === 0) throw new Error('Historical years must be non-zero integers.');
  return year < 0 ? year + 1 : year;
}

export function yearsFromPresent(historicalYear: number, presentYear: number): PresentDistance {
  const difference = historicalOrdinal(presentYear) - historicalOrdinal(historicalYear);
  if (difference === 0) return { relation: 'present', years: 0 };
  return difference > 0
    ? { relation: 'past', years: difference }
    : { relation: 'future', years: Math.abs(difference) };
}

export function formatPresentDistance(distance: PresentDistance, locale: 'zh' | 'en'): string {
  if (distance.relation === 'present') return locale === 'en' ? 'This year' : '今年';
  const count = distance.years.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN');
  if (locale === 'en') return distance.relation === 'past' ? `${count} years ago` : `${count} years from now`;
  return distance.relation === 'past' ? `距今${count}年` : `距今尚有${count}年`;
}

export function primaryPolityName(polities: Polity[]): string | undefined {
  return polities.find((polity) => polity.region !== 'world' && polity.name.trim())?.name;
}
```

- [ ] **Step 4: Run the focused test and type-check the module**

Run: `npx vitest --run src/presentation/map-status.test.ts && npx tsc -b --pretty false`

Expected: PASS with no TypeScript diagnostics.

- [ ] **Step 5: Commit the selector unit**

```bash
git add src/presentation/map-status.ts src/presentation/map-status.test.ts
git commit -m "feat: add readable historical status selectors"
```

---

### Task 2: Structured Map Status Card and Search Stack

**Files:**
- Create: `src/components/MapStatusHud.tsx`
- Create: `src/components/MapStatusHud.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/workspace.css`

**Interfaces:**
- Consumes: `formatPresentDistance`, `primaryPolityName`, and `yearsFromPresent` from Task 1; `formatHistoricalYear`; the existing directory-open state and click handler.
- Produces: `MapStatusHud(props: MapStatusHudProps)` with `yearLabel`, `eraLabel`, `viewLabel`, `distanceLabel`, `windowLabel`, `expanded`, and `onToggle` props.

- [ ] **Step 1: Write failing status-card component tests**

```tsx
render(<LocaleProvider><MapStatusHud
  yearLabel="800年"
  eraLabel="唐"
  viewLabel="王朝至今"
  distanceLabel="距今1226年"
  windowLabel="当前视窗 · 前2070年—2026年"
  expanded={false}
  onToggle={toggle}
/></LocaleProvider>);

const button = screen.getByRole('button', { name: '当前历史状态' });
expect(within(button).getByText('800年')).toHaveClass('map-status-year');
expect(button).toHaveTextContent('800年唐王朝至今距今1226年');
expect(button).toHaveTextContent('当前视窗 · 前2070年—2026年');
await userEvent.click(button);
expect(toggle).toHaveBeenCalledOnce();
```

Add a second render without `eraLabel` and assert that neither an empty badge nor a supplied internal ID appears.

- [ ] **Step 2: Run the focused component test and confirm it fails**

Run: `npx vitest --run src/components/MapStatusHud.test.tsx`

Expected: FAIL resolving `MapStatusHud`.

- [ ] **Step 3: Implement the semantic card component**

```tsx
export interface MapStatusHudProps {
  yearLabel: string;
  eraLabel?: string;
  viewLabel: string;
  distanceLabel: string;
  windowLabel: string;
  expanded: boolean;
  onToggle: () => void;
}

export function MapStatusHud(props: MapStatusHudProps) {
  const { t } = useLocale();
  return <button className="map-status-hud" type="button" aria-label={t('当前历史状态')}
    aria-expanded={props.expanded} aria-controls="directory-popover" onClick={props.onToggle}>
    <span className="map-status-primary">
      <strong className="map-status-year">{t(props.yearLabel)}</strong>
      {props.eraLabel && <span className="map-status-era">{t(props.eraLabel)}</span>}
      <span className="map-status-view">{t(props.viewLabel)}</span>
      <span className="map-status-distance">{props.distanceLabel}</span>
    </span>
    <span className="map-status-window">{props.windowLabel}</span>
  </button>;
}
```

- [ ] **Step 4: Integrate the card and readable labels in `App`**

Calculate once per render:

```ts
const eraLabel = primaryPolityName(historicalState.activePolities);
const distanceLabel = formatPresentDistance(
  yearsFromPresent(currentYear, new Date().getFullYear()),
  locale,
);
const timelineWindowLabel = `${t('当前视窗')} · ${formatHistoricalYear(timelineWindow[0])}—${formatHistoricalYear(timelineWindow[1])}`;
```

Replace the inline `.map-status-hud` button with `MapStatusHud`. Wrap the visible search caption in `<span className="sr-only">` so the label remains associated with the input without adding height.

- [ ] **Step 5: Add shared size variables and structured card styles**

Use these exact workspace rules:

```css
.workspace-header {
  --workspace-status-height:64px;
  --workspace-header-stack-gap:18px;
}
.workspace-header-left { gap:var(--workspace-header-stack-gap); }
.map-status-hud,.event-search-dock input { height:var(--workspace-status-height); }
.map-status-hud { padding:10px 12px; align-content:center; }
.map-status-primary { display:flex; align-items:baseline; gap:8px; min-width:0; }
.map-status-year { flex:none; font-size:20px; font-variant-numeric:tabular-nums; }
.map-status-era,.map-status-view { font-size:12px; white-space:nowrap; }
.map-status-distance { margin-left:auto; padding:3px 7px; border:1px solid #b9995c88; border-radius:999px; white-space:nowrap; }
.map-status-window { overflow:hidden; color:#aeb8a8; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
.event-search-dock { display:block; }
.event-search-dock input { min-height:0; padding:0 12px; }
```

At `max-width:640px`, keep both controls equal using `--workspace-status-height:58px`; allow `.map-status-view` to hide before the year, era, or distance labels.

- [ ] **Step 6: Extend the `App` integration test**

Assert that the initial status button contains `800年`, `唐`, `王朝至今`, and `距今1226年` when the test clock is fixed to 2026. Assert that `.workspace-header-left` contains the status button immediately followed by `.event-search-dock-wrap`, and that the search accessible name remains “搜索历史事件”.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest --run src/components/MapStatusHud.test.tsx src/app/App.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the status and search unit**

```bash
git add src/components/MapStatusHud.tsx src/components/MapStatusHud.test.tsx src/app/App.tsx src/app/App.test.tsx src/styles/workspace.css
git commit -m "feat: clarify the current historical status"
```

---

### Task 3: Functional One-Line Collapsed Timeline

**Files:**
- Create: `src/workspace/CollapsedTimeControls.tsx`
- Create: `src/workspace/CollapsedTimeControls.test.tsx`
- Modify: `src/workspace/TimeController.tsx`
- Modify: `src/workspace/TimeController.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/workspace.css`
- Modify: `src/i18n/text.ts`

**Interfaces:**
- Consumes: `year`, optional `eraLabel`, `isPlaying`, `onYearChange`, `onPlayToggle`, `TIMELINE_MAX_YEAR`, `yearToIndex`, `indexToYear`, and `formatHistoricalYear`.
- Produces: `CollapsedTimeControls(props: CollapsedTimeControlsProps)`; extends `TimeController` props with `eraLabel?: string`.

- [ ] **Step 1: Write failing collapsed-control tests**

```tsx
const change = vi.fn();
const play = vi.fn();
render(<LocaleProvider><CollapsedTimeControls
  year={-1}
  eraLabel="西汉"
  isPlaying={false}
  onYearChange={change}
  onPlayToggle={play}
/></LocaleProvider>);

expect(screen.getByText('前1年')).toBeInTheDocument();
expect(screen.getByText('西汉')).toBeInTheDocument();
await userEvent.click(screen.getByRole('button', { name: '下一年' }));
expect(change).toHaveBeenCalledWith(1);
await userEvent.click(screen.getByRole('button', { name: '播放' }));
expect(play).toHaveBeenCalledOnce();
```

Add a second render with `isPlaying` and assert that the button is named “暂停”.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest --run src/workspace/CollapsedTimeControls.test.tsx`

Expected: FAIL resolving `CollapsedTimeControls`.

- [ ] **Step 3: Implement no-year-zero stepping in the collapsed component**

```tsx
export interface CollapsedTimeControlsProps {
  year: number;
  eraLabel?: string;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onPlayToggle: () => void;
}

export function CollapsedTimeControls(props: CollapsedTimeControlsProps) {
  const { t } = useLocale();
  const index = yearToIndex(props.year);
  return <div className="collapsed-time-controls" aria-label={t('简明时间控制')}>
    <div className="collapsed-time-reading">
      <strong>{t(formatHistoricalYear(props.year))}</strong>
      {props.eraLabel && <span>{t(props.eraLabel)}</span>}
    </div>
    <div className="collapsed-time-actions">
      <button aria-label={t('上一年')} disabled={index === 0} onClick={() => props.onYearChange(indexToYear(index - 1))}>−1</button>
      <button className="collapsed-play" aria-label={t(props.isPlaying ? '暂停' : '播放')} onClick={props.onPlayToggle}>{t(props.isPlaying ? '暂停' : '播放')}</button>
      <button aria-label={t('下一年')} disabled={props.year === TIMELINE_MAX_YEAR} onClick={() => props.onYearChange(indexToYear(index + 1))}>+1</button>
    </div>
  </div>;
}
```

- [ ] **Step 4: Render collapsed controls instead of a clipped `Timeline`**

Define:

```ts
type TimeControllerProps = ComponentProps<typeof Timeline> & { eraLabel?: string };
```

When `effectiveDensity === 'collapsed'`, place `CollapsedTimeControls` inside `.controller-handlebar` and do not render `.controller-content`. When density is compact or expanded, omit `CollapsedTimeControls` and render the existing `.controller-content` with `Timeline`. Keep the existing layout-action buttons, but hide nonessential “悬浮” text through CSS on narrow map panes instead of removing its accessible button.

- [ ] **Step 5: Pass `eraLabel` from `App` and add translations**

Pass the same `eraLabel` used by `MapStatusHud` into `TimeController`. Add the exact entry `'简明时间控制':'Concise time controls'` to `src/i18n/text.ts`; “上一年”“下一年”“播放”“暂停”“刻度”“展开” already use existing translations. Retain dynamic year and polity localization through existing content translation.

- [ ] **Step 6: Add one-line controller styles**

```css
.time-controller[data-density="collapsed"] .controller-handlebar {
  min-height:50px;
}
.collapsed-time-controls { min-width:0; flex:1; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.collapsed-time-reading { min-width:0; display:flex; align-items:baseline; gap:8px; }
.collapsed-time-reading strong { font-size:18px; font-variant-numeric:tabular-nums; white-space:nowrap; }
.collapsed-time-reading span { overflow:hidden; color:#c7cdbb; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
.collapsed-time-actions { display:flex; flex:none; gap:4px; }
.collapsed-time-actions button { min-width:44px; min-height:44px; padding:0 9px; }
.collapsed-time-actions .collapsed-play { color:#18241c; background:#c6a15b; }
```

At map-pane widths below 640px, visually reduce the grip to its icon and hide lower-priority layout text before hiding the year, era, or playback buttons.

- [ ] **Step 7: Update controller tests for true collapse**

In `TimeController.test.tsx`, assert initially that:

- the collapsed-controls region is present;
- the current year and era label are visible;
- `.controller-content` and the year slider are absent;
- the next-year action crosses BCE 1 directly to CE 1;
- play calls the shared callback;
- clicking “刻度” mounts compact timeline content;
- clicking “收起” removes it again without changing the current year.

- [ ] **Step 8: Run focused controller and application tests**

Run: `npx vitest --run src/workspace/CollapsedTimeControls.test.tsx src/workspace/TimeController.test.tsx src/app/App.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit the collapsed timeline unit**

```bash
git add src/workspace/CollapsedTimeControls.tsx src/workspace/CollapsedTimeControls.test.tsx src/workspace/TimeController.tsx src/workspace/TimeController.test.tsx src/app/App.tsx src/styles/workspace.css src/i18n/text.ts
git commit -m "feat: make collapsed timeline controls useful"
```

---

### Task 4: Responsive and Full-System Verification

**Files:**
- Verify: `src/styles/workspace.css`
- Verify: `src/app/App.test.tsx`
- Verify: `src/workspace/TimeController.test.tsx`

**Interfaces:**
- Consumes: completed status card, search stack, and collapsed timeline.
- Produces: validated behavior at 809×934, 390×844, 1440×900, short landscape, and split-topic widths.

- [ ] **Step 1: Run the complete automated validation suite**

Run:

```bash
npm run build:knowledge-coverage
npx vitest --run --exclude '.worktrees/**'
npm run build
git diff --check
```

Expected: knowledge coverage succeeds; all Vitest files pass; TypeScript and Vite build successfully; diff check has no output.

- [ ] **Step 2: Verify 809×934 in the browser**

At year 800, measure computed rectangles and visible copy:

- status card height equals search input height at 64px;
- vertical distance from the status card bottom to the search input top is 18px;
- status card shows `800年`, `唐`, `王朝至今`, and `距今1226年`;
- collapsed controller is a single visible row between 48px and 52px before safe-area padding;
- timeline body is absent while collapsed;
- previous, play, next, scale, and expand controls are keyboard reachable.

- [ ] **Step 3: Verify playback and year stepping**

Use the collapsed row to move from BCE 1 to CE 1 and confirm year zero never appears. Start playback, confirm “播放” changes to “暂停” and the year advances, then stop playback. Expand and collapse the controller and confirm the selected year is preserved.

- [ ] **Step 4: Verify responsive widths**

At 390×844 and short landscape, confirm no horizontal scrolling, no clipped year/distance label, 44px touch targets, and no map-navigation overlap. At 1440×900, open a topic detail, drag the divider, and confirm the status/search stack and timeline remain entirely inside `MapPane`.

- [ ] **Step 5: Commit only if verification required a repair**

```bash
git add src/styles/workspace.css src/**/*.test.ts src/**/*.test.tsx
git commit -m "fix: polish responsive map time controls"
```

If verification exposes a concrete defect, first add a failing assertion to `src/app/App.test.tsx` for header/integration behavior or `src/workspace/TimeController.test.tsx` for controller behavior, then make the minimum CSS or component repair. If every check passes, leave the worktree unchanged and record the measured browser results in the final handoff.
