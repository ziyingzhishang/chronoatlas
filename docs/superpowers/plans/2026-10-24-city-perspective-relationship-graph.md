# 城市视角关系图谱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让城市详情抽屉复用现有关系图谱能力，展示城市、政权、人物、事件和遗产之间可导航、可展开证据的关系网络。

**Architecture:** 在 `src/components/relationship-graph-model.ts` 建立政权视图和城市视图到通用图谱输入的适配器；`RelationshipGraph` 只消费通用输入并负责分类、布局、证据和导航；`StudyRelationsPanel` 根据视图类型传入对应适配结果。城市关系继续由 `buildCityStudyView` 的当前年份 `claims` 与 `relations` 提供，不新增历史事实或覆盖统计实体。

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, 现有 i18n 与 `DetailEntity` 导航接口。

## Global Constraints

- 不新增第三方依赖。
- 不改变现有政权视角的筛选、证据和 50vw 抽屉行为。
- 不把无法分类的 claim 从数据中删除。
- 不因图谱展示而提升事件/人物的时间精度、置信度或政权归属。
- 城市视角默认只显示 `buildCityStudyView` 已按当前年份筛选的 claims。
- 所有新增节点必须通过现有 `DetailEntity` 联合类型导航。

---

### Task 1: 建立通用关系图谱输入适配器

**Files:**
- Create: `src/components/relationship-graph-model.ts`
- Create: `src/components/relationship-graph-model.test.ts`
- Modify: `src/domain/study-view.ts` only if an exported relation type is required by the adapter

**Interfaces:**
- Consumes: `PolityStudyView`, `CityStudyView`, `HistoricalClaim`, `DetailEntity`.
- Produces: `RelationshipGraphView`, `RelationshipGraphNode`, `toPolityRelationshipGraphView(view)`, `toCityRelationshipGraphView(view)`.

- [x] **Step 1: Write the failing domain tests**

```ts
it('adapts Chang’an into a graph with city, polity, person, event and heritage nodes', () => {
  const view = buildCityStudyView('changan', 650, completeStudyData)!;
  const graph = toCityRelationshipGraphView(view);
  expect(graph.subject).toEqual({ id: 'changan', label: '长安', kind: 'place' });
  expect(new Set(graph.currentNodes.map((node) => node.kind))).toEqual(
    new Set(['place', 'polity', 'person', 'event', 'heritage']),
  );
});

it('keeps only current-year city claims in currentClaims and deduplicates claim IDs', () => {
  const view = buildCityStudyView('changan', 650, completeStudyData)!;
  const graph = toCityRelationshipGraphView(view);
  expect(new Set(graph.currentClaims.map((claim) => claim.id)).size).toBe(graph.currentClaims.length);
  expect(graph.currentClaims.every((claim) =>
    (claim.validFrom === undefined || claim.validFrom <= 650)
    && (claim.validTo === undefined || 650 <= claim.validTo),
  )).toBe(true);
});

it('preserves the existing polity graph input through the same normalized contract', () => {
  const view = buildPolityStudyView('tang', 640, completeStudyData)!;
  const graph = toPolityRelationshipGraphView(view);
  expect(graph.subject.kind).toBe('polity');
  expect(graph.currentClaims.map((claim) => claim.id)).toEqual(view.claims.map((claim) => claim.id));
});
```

- [x] **Step 2: Run the focused tests and verify they fail**

Run: `npx vitest run --exclude '**/.worktrees/**' src/components/relationship-graph-model.test.ts`

Expected: FAIL because the normalized graph interfaces and adapters do not exist.

- [x] **Step 3: Implement the normalized model and adapters**

Use a single node shape with `id`, localized-ready `label`, and `kind`. The city adapter must include the city subject plus every entity present in `view.polities`, `view.people`, `view.events`, and `view.heritage`; it must derive `currentClaims` from `view.claims` and leave `detailClaims` empty unless a future view explicitly supplies detail-only claims. The polity adapter must include the polity subject, current people/events/heritage, detail-linked people/events/heritage, and use `view.claims` plus `view.detailLinkedClaims` without duplicate claim IDs.

- [x] **Step 4: Run the focused tests and type-check**

Run: `npx vitest run --exclude '**/.worktrees/**' src/components/relationship-graph-model.test.ts && npx tsc -b`

Expected: 3 tests pass and TypeScript exits 0.

- [x] **Step 5: Commit**

```bash
git add src/components/relationship-graph-model.ts src/components/relationship-graph-model.test.ts src/domain/study-view.ts
git commit -m "refactor: normalize relationship graph study inputs"
```

### Task 2: Refactor RelationshipGraph to consume both study views

**Files:**
- Modify: `src/components/RelationshipGraph.tsx`
- Modify: `src/components/RelationshipGraph.test.tsx`

**Interfaces:**
- Consumes: `RelationshipGraphView` and adapter functions from Task 1.
- Produces: a graph component that accepts `{ graph, onOpenEntity }` and preserves all current category, evidence, scope, and keyboard behavior.

- [x] **Step 1: Add failing city graph tests**

```tsx
it('renders a city-centered graph and navigates city graph nodes', async () => {
  const city = buildCityStudyView('changan', 650, completeStudyData)!;
  const onOpenEntity = vi.fn();
  render(<RelationshipGraph graph={toCityRelationshipGraphView(city)} onOpenEntity={onOpenEntity} />);
  expect(screen.getByRole('img', { name: '城市关系网络' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '长安' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: '隋' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'sui' });
});

it('keeps evidence expansion and source traceability for city graph edges', async () => {
  const city = buildCityStudyView('changan', 650, completeStudyData)!;
  render(<RelationshipGraph graph={toCityRelationshipGraphView(city)} />);
  const evidence = screen.getAllByRole('button', { name: /查看边证据/ })[0];
  await userEvent.click(evidence);
  expect(screen.getByRole('region', { name: /关系边证据/ })).toBeInTheDocument();
  expect(screen.getByText(/来源：/)).toBeInTheDocument();
});
```

- [x] **Step 2: Run the focused component tests and verify the new tests fail**

Run: `npx vitest run --exclude '**/.worktrees/**' src/components/RelationshipGraph.test.tsx`

Expected: existing polity tests pass or compile against the old API while the new city tests fail until the component accepts normalized input.

- [x] **Step 3: Refactor the component without changing graph semantics**

Move node collection, claim de-duplication, category classification, source availability, current/detail scope, SVG layout, text categories, edge evidence, and keyboard handlers to consume the normalized `graph` prop. Keep `RelationshipGraphEdge`, `relationshipSummary`, category labels, and source rendering behavior unchanged. Use `graph.subject.kind` for the accessible graph label (`人物关系网络` for a polity subject and `城市关系网络` for a place subject).

- [x] **Step 4: Run all graph tests and type-check**

Run: `npx vitest run --exclude '**/.worktrees/**' src/components/RelationshipGraph.test.tsx src/components/relationship-graph-model.test.ts && npx tsc -b`

Expected: all graph tests pass and TypeScript exits 0.

- [x] **Step 5: Commit**

```bash
git add src/components/RelationshipGraph.tsx src/components/RelationshipGraph.test.tsx
git commit -m "feat: render city relationship graphs"
```

### Task 3: Mount the city graph in StudyRelationsPanel and add navigation regression coverage

**Files:**
- Modify: `src/components/StudyRelationsPanel.tsx`
- Modify: `src/components/StudyRelationsPanel.integration.test.tsx`
- Modify: `src/components/StudyRelationsPanel.test.tsx` only if the focused unit fixture needs the shared city graph assertion

**Interfaces:**
- Consumes: `CityStudyView`, `PolityStudyView`, `toCityRelationshipGraphView`, `toPolityRelationshipGraphView`, and the refactored `RelationshipGraph` API.
- Produces: city panel section titled `城市关系网络`, with existing `onOpenEntity` navigation.

- [x] **Step 1: Write failing panel integration tests**

```tsx
it('renders and navigates the city relationship graph', async () => {
  const view = buildCityStudyView('changan', 650, completeData)!;
  const onOpenEntity = vi.fn();
  render(<LocaleProvider><StudyRelationsPanel view={view} onOpenEntity={onOpenEntity} /></LocaleProvider>);
  expect(screen.getByRole('heading', { name: '城市关系网络' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: '隋' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'sui' });
});

it('keeps the city graph title and node labels available in English', () => {
  localStorage.setItem('history-locale', 'en');
  const view = buildCityStudyView('changan', 650, completeData)!;
  render(<LocaleProvider><StudyRelationsPanel view={view} /></LocaleProvider>);
  expect(screen.getByRole('heading', { name: 'City relationship network' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'City relationship network' })).toBeInTheDocument();
  localStorage.removeItem('history-locale');
});
```

- [x] **Step 2: Run the panel tests and verify the new assertions fail**

Run: `npx vitest run --exclude '**/.worktrees/**' src/components/StudyRelationsPanel.integration.test.tsx src/components/StudyRelationsPanel.test.tsx`

Expected: the existing city panel tests pass, while the new heading and graph navigation assertions fail because the city graph is not mounted.

- [x] **Step 3: Mount the adapter result in the city branch**

Import `toCityRelationshipGraphView` and `toPolityRelationshipGraphView`. Render one `study-block` after the city polity list and before the shared related-event block for city views; render the existing polity graph through the polity adapter in the same location as today. Pass through `onOpenEntity` unchanged.

- [x] **Step 4: Run the complete focused regression set**

Run:

```bash
npx vitest run --exclude '**/.worktrees/**' \
  src/domain/study-view.test.ts \
  src/components/relationship-graph-model.test.ts \
  src/components/RelationshipGraph.test.tsx \
  src/components/StudyRelationsPanel.test.tsx \
  src/components/StudyRelationsPanel.integration.test.tsx
npx tsc -b
git diff --check
```

Expected: all listed tests pass, TypeScript exits 0, and `git diff --check` emits no output.

- [x] **Step 5: Commit**

```bash
git add src/components/StudyRelationsPanel.tsx src/components/StudyRelationsPanel.integration.test.tsx src/components/StudyRelationsPanel.test.tsx
git commit -m "feat: expose city relationship graph in study panel"
```

### Task 4: Full verification and coverage artifact integrity

**Files:**
- Modify: `internal/audits/knowledge-coverage.json` only if the existing build command deterministically changes it

**Interfaces:**
- Consumes: all completed tasks and existing project test/build commands.
- Produces: verified working tree, unchanged coverage semantics, and full test evidence.

- [x] **Step 1: Rebuild the coverage artifact**

Run: `npm run build:knowledge-coverage`

Expected: the report remains a 4-type entity report; city graph work does not create `place` coverage entities or actionable tasks.

- [x] **Step 2: Run the full verification suite**

Run: `npx tsc -b && npx vitest run --exclude '**/.worktrees/**' && git diff --check`

Expected: TypeScript passes, all Vitest files/tests pass, and no whitespace errors are reported.

- [x] **Step 3: Inspect final state and commit generated output if required**

Run: `git status --short && git log -5 --oneline`.

If the coverage artifact changed, commit it with:

```bash
git add internal/audits/knowledge-coverage.json
git commit -m "chore: refresh knowledge coverage after city graph"
```

Otherwise leave the generated artifact unchanged and report the clean status.
