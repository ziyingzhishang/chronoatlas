# 上下文覆盖视图审计

## 本轮目标

当 `InfoPanel` 选中政权或城市时，学习覆盖面板应从同一份真实的 `KnowledgeCoverageReport` 中切换到对应的 `byPolity` 或 `byCity` 视图；未选中实体时继续显示全局报告。

## 实施边界

- `InfoPanel` 仅传递当前选中实体的上下文类型和 ID。
- `KnowledgeCoveragePanel` 负责从 `byPolity` / `byCity` 读取实体数、缺口数，并按 `polityIds` / `placeIds` 过滤可行动任务。
- 任务主体继续调用既有 `onOpenEntity`，不新增抽屉或数据访问路径。
- 上下文索引不存在时安全保留全局报告，不渲染空的伪造上下文数据。
- 未修改 `knowledge-coverage.ts`、历史数据、`study-view.ts` 和 `RelationshipGraph.tsx`。

## 验证范围

- `KnowledgeCoveragePanel`：政权上下文摘要、城市上下文摘要、两类任务抽屉导航、无任务安全状态。
- `InfoPanel`：选中秦政权和咸阳城市时分别显示对应覆盖摘要。
- 定向测试：21/21 通过。
- TypeScript 与生产构建：通过；仅保留既有的产物体积提示。
