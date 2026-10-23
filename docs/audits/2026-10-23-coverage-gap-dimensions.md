# 覆盖缺口维度浏览审计

日期：2026-10-23

## 本轮范围

在 `KnowledgeCoveragePanel` 中增加独立的“缺口明细”可展开区域。明细使用现有 `KnowledgeCoverageReport.gaps`，按当前浏览上下文选择全局、政权或城市报告，展示：

- 实体名称与实体类型；
- 缺口维度（摘要、详情、来源、关系、时间）；
- 原始缺口状态；
- 覆盖引擎提供的说明；
- 通过既有 `onOpenEntity` 打开实体详情抽屉。

## 状态边界

可行动任务区仍然只使用 `report.tasks`，本轮没有改变任务生成、筛选或计数。缺口明细区展示 `report.gaps` 中的非 `covered`、非 `not-applicable` 记录：

- `data-missing` 显示为“待补”；
- `relationship-missing` 显示为“关系待补”；
- `source-missing` 显示为“来源待补”；
- `uncertain` 显示为“待复核”，不标为“待补”；
- `not-applicable` 不会进入 `KnowledgeCoverageGap`，因此不在界面伪装成缺口。

## 验证边界

- 全局报告可展开并展示实体、维度、状态和说明；
- 政权/城市上下文只展示对应报告的缺口明细；
- 缺口实体复用详情抽屉回调；
- 可行动任务区域的数量和行为保持不变；
- 未修改覆盖引擎、历史数据或缺口判定逻辑。
