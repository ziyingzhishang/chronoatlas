# PersonDetail 人物关系证据追踪审计

## 审查范围

- 组件：`src/components/PersonDetail.tsx`
- 回归测试：`src/components/PersonDetail.test.tsx`
- 本轮没有修改 claims 数据语义、领域数据、`KnowledgeCoveragePanel`、`InfoPanel` 或 `RelationshipGraph`。

## 发现并修复的真实缺口

### 1. 非事件关系缺少逐项证据追踪字段

亲属、君臣、联盟和对立关系此前只显示“关系类型 · 目标”，只有事件参与关系显示时间精度与来源状态。现在所有关系项统一显示：

- 方向与目标；
- 有效期与时间精度；
- 证据类型与可信度；
- 来源解析状态及已收录来源名称。

来源缺失或无法解析时仍明确显示待解析/待补，不把关系提升为已核验事实。

### 2. 有证据支持的 `founded` 政权关系未进入人物详情分组

关系领域已定义 `founded`，但 `PersonDetail` 的君臣关系分组此前遗漏该类型，导致人物到政权的建立关系不可见，也无法继续打开政权详情。本轮仅补入既有关系分组和展示标签，未新增任何 claim。

## 已验证边界

- 关系仍由 `groupPersonRelationships(person.id, year, claims)` 按选定年份筛选；未改变有效期判断。
- 关系目标仍由既有 `person`、`polity`、`event` 映射解析；点击回调仍使用原始关系对象 ID。
- 事件参与关系保留原有事件详情导航；人物和政权关系分别验证可打开 `person` 与 `polity` 详情。
- 不可解析来源只展示其待解析状态与原始来源 ID，不推测来源名称。
- 不确定性说明继续单独展示；证据字段只呈现 claim 已提供的值。
- 关系类型、时间和证据文案走现有 i18n，不改变 claims 的事实或证据等级。

## 验证记录

- `npm test -- --run src/components/PersonDetail.test.tsx`：14/14 通过。
- 全量回归：298 个测试文件、980 个测试通过。
- `git diff --check` 通过。
- 构建仍受工作树中既有的 `src/components/KnowledgeCoveragePanel.tsx` TypeScript 错误阻断；该文件属于本轮明确禁止修改范围，错误与本轮 `PersonDetail` 改动无关。
