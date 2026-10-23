# 遗产完整详情入口审计

日期：2026-10-23

## 审查范围

本轮只审查以下入口是否能进入统一的完整 `HeritageDetail` 抽屉：

1. 城市历史时间轴；
2. 政权详情中的“遗产与事件关联”；
3. 城市关系面板中的“遗产与城市记忆”；
4. 地图点击地点后打开的地点详情中的城市关系面板。

不修改遗产数据、`EventDetail`、`KnowledgeCoveragePanel`，也不改变 `EntityDrawer` 的 50vw 宽度、返回栈、来源或不确定性展示契约。

## 结果

四条路径均已通过应用级回归验证，未发现需要修改生产入口的真实缺口，因此本轮没有生产组件修复。

### 1. 城市历史时间轴

`CityHistoryTimeline` 的遗产节点通过 `onOpenEntity({ type: 'heritage', id })` 进入 `App.openDetail`。现有回归覆盖：城市抽屉 → 时间轴事件 → 返回城市 → 时间轴遗产，并验证遗产抽屉包含“建造沿革”。

### 2. 政权详情

`PolityDetail` 的遗产关联通过统一实体回调进入遗产抽屉。现有回归覆盖政权研究视图中的遗产入口，并验证 50vw 抽屉与完整建造沿革。

### 3. 城市关系面板

新增应用级回归覆盖城市抽屉的“遗产与城市记忆”入口，验证：

- 目标为 `entity-drawer-heritage`；
- 抽屉宽度为 `50vw`；
- 存在完整“建造沿革”；
- 返回上一个实体按钮存在；
- 不确定性信息仍在完整详情中展示。

### 4. 地图地点详情

新增应用级回归模拟地图地点命中，验证地图 → 地点详情 → “遗产与城市记忆” → 完整遗产抽屉，且保持 50vw 宽度。

## 证据与边界

- 来源链接和书目引文仍由 `HeritageDetail` 原有逻辑展示；本轮未改动。
- 建造阶段的不确定性仍由 `HeritageDetail` 原有逻辑展示；本轮未改动。
- `App.openDetail` 仍负责建立实体返回栈；本轮仅验证入口，不改变栈行为。
- 没有将摘要卡误判为完整详情；四条路径均验证了抽屉内的完整详情结构。

## 验证命令

```bash
npm test -- --run src/app/App.test.tsx src/components/StudyRelationsPanel.test.tsx src/components/StudyRelationsPanel.integration.test.tsx src/components/PolityDetail.test.tsx src/components/CityHistoryTimeline.test.tsx src/components/HeritageDetail.test.tsx
npm run build
git diff --check
```

结果：定向测试 35/35 通过，生产构建通过，差异空白检查通过。
