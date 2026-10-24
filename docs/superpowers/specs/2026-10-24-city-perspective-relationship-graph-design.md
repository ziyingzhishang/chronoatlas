# 城市视角关系图谱设计

## 目标

让城市视角与政权视角拥有同等的关系研究能力：在城市详情抽屉中，以城市为中心展示“城市—政权—人物—事件—遗产”的可交互关系，并沿用现有 50% 宽度实体抽屉、来源证据和不确定性表达。

## 背景与现状

- `buildCityStudyView` 已经生成城市相关的 `polities`、`people`、`events`、`heritage`、`claims` 和 `relations`。
- `StudyRelationsPanel` 目前只在 `PolityStudyView` 下渲染 `RelationshipGraph`；城市视角只有时间轴、政权列表、事件列表和遗产列表。
- `RelationshipGraph` 内部把节点、关系分类、来源可用性、当前事实/详情关联边界和抽屉导航绑定在 `PolityStudyView` 类型上。
- 城市关系数据已经存在，因此本阶段主要是图谱适配与交互呈现，不新增历史事实，不改变现有政权视角筛选语义。

## 方案选择

采用“通用图谱输入适配器 + 复用现有图谱组件”的方案。

1. **推荐：通用输入适配器**
   - 把关系图所需的节点和边抽象为组件内部通用模型。
   - 为 `PolityStudyView` 和 `CityStudyView` 分别提供适配函数。
   - 复用现有 SVG、分类列表、证据展开、来源链接、键盘操作和 `onOpenEntity` 回调。
   - 优点是城市与政权的交互行为一致，避免两套图谱长期分叉。

2. **独立城市图谱组件**
   - 为城市单独复制一套图谱渲染器。
   - 初期改动直观，但分类、可访问性和来源展示容易出现行为漂移，不采用。

3. **只增加城市关系列表**
   - 实现成本最低，但不能满足“完整人物图谱”和可视化关系研究目标，不采用。

## 功能设计

### 城市关系图谱

在城市视角的城市时间轴和政权列表之后增加“城市关系网络”区块。图谱中心节点为当前城市，节点类型至少包括：

- 城市：当前研究城市；
- 政权：曾以该城市为政治中心或与城市关系明确的政权；
- 人物：与这些政权或城市事件有关的人物；
- 事件：发生于城市或详情明确关联城市的事件；
- 遗产：城市历史层中已收录的遗产对象。

城市已有 `relations` 的 claim 直接进入图谱。边沿用既有关系分类：治理／君臣、亲属、联盟与对立、事件参与、遗产关联、历史关联。无法由现有分类识别的 claim 不显示为图边，但不从数据中删除。

### 交互

- 点击任一节点调用现有 `onOpenEntity({ type, id })`，打开对应实体的 50vw 详情抽屉。
- 点击边证据展开有效期、时间精度、证据类型、可信度、不确定性和来源。
- 城市图谱边标记“本年事实”或“详情关联／非本年事实”，与政权图谱保持一致。
- 无关系时显示现有空状态，不渲染空 SVG。
- 保持摘要卡片和城市时间轴的现有导航行为不变。

### 数据边界

- 当前年份默认只使用 `buildCityStudyView` 已筛选的有效 claims。
- 城市历史时间轴需要查看历史全貌时，继续使用其现有的 `includeHistoricalClaims` 逻辑，不改变默认城市详情的当前年份语义。
- 不把城市本身加入知识覆盖实体统计；城市覆盖与来源目录属于后续独立子项目。
- 不因为图谱显示而提升任何事件或人物的时间精度、置信度或政权归属。

## 组件与接口设计

将 `RelationshipGraph` 的输入从单一政权视图改为内部规范化模型，例如：

```ts
interface RelationshipGraphView {
  subject: GraphNode;
  currentNodes: GraphNode[];
  detailNodes?: GraphNode[];
  currentClaims: HistoricalClaim[];
  detailClaims?: HistoricalClaim[];
}
```

新增两个适配函数，分别把 `PolityStudyView` 和 `CityStudyView` 转为该模型。适配器负责节点去重和当前／详情边界；组件继续负责分类、布局、证据和导航。

`StudyRelationsPanel` 仅需在 `cityView` 分支渲染同一 `RelationshipGraph`，并传入现有 `onOpenEntity`。不新增第三方依赖，不改变 `DetailEntity` 联合类型。

## 测试与验收

### 领域层

- 城市关系适配器能把长安至少一条城市—政权、人物—事件、遗产关联转换为图节点和边。
- 当前年份过滤仍生效，过期 claim 不出现在当前事实边集合中。
- 同一节点和同一 claim 不重复。

### 组件层

- 城市视角出现“城市关系网络”区块和图谱中心城市。
- 长安图谱至少渲染城市、政权、人物、事件、遗产中的三类节点。
- 点击城市图谱节点分别触发正确的实体类型和 ID。
- 边证据可展开并显示来源与不确定性。
- 英文 locale 下图谱标题和分类仍可用。
- 现有政权图谱测试和城市时间轴测试全部保持通过。

### 验证命令

```bash
npx vitest run --exclude '**/.worktrees/**' \
  src/domain/study-view.test.ts \
  src/components/RelationshipGraph.test.tsx \
  src/components/StudyRelationsPanel.test.tsx \
  src/components/StudyRelationsPanel.integration.test.tsx
npx tsc -b
git diff --check
```

## 非目标与后续工作

- 本阶段不把 `place` 纳入 knowledge coverage 的实体类型。
- 本阶段不建立独立来源目录或改造 `CityHistoryTimeline` 的来源展示。
- 下一阶段可在本图谱稳定后，将城市作为一等覆盖实体，并为城市时间轴与图谱提供可展开的来源索引。
