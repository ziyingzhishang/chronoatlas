# 关系图谱边证据交互审计

日期：2026-10-23

## 目标

关系图谱中的节点继续负责打开实体详情；每条文本关系边另提供可访问的证据展开区，使摘要与 claim 证据分层呈现，不改变 `HistoricalClaim` 的语义或数据来源。

## 实施边界

- 修改范围仅包含 `RelationshipGraph.tsx`、`RelationshipGraph.test.tsx`、必要 i18n 文案和本审计文档。
- SVG 边继续显示摘要与 `<title>`，不承担交互状态。
- 文本关系项保留原有目标节点按钮；新增独立的“查看边证据／收起边证据”按钮。
- 展开区使用现有 `sourceById` 解析 `sourceIds`，不新增数据。

## 展示与可达性

展开后显示：

- 有效期与时间精度；
- 证据类型与可信度；
- 不确定性说明；
- 来源状态：HTTP(S) 来源为键盘可访问外链，非 URL 内容标为书目引文，未知来源 ID 标为来源未解析。

按钮使用 `aria-expanded`、`aria-controls`，详情区域使用独立 `region` 名称；Enter 与 Space 均可切换展开状态。

## 验证

`RelationshipGraph.test.tsx` 覆盖：

1. 键盘 Enter 展开边证据；
2. 五类证据字段和不确定性呈现；
3. URL 来源外链及目标地址；
4. 非 URL 书目引文不误渲染为链接；
5. 未解析来源状态。

本轮不涉及 `PersonDetail`、`InfoPanel`、claims 数据或 claims 语义。
