# 覆盖缺口证据追踪审计

日期：2026-10-23

## 本轮目标

增强 `KnowledgeCoveragePanel` 的缺口明细，使每条缺口的 `evidenceIds` 与 `relatedIds` 都可被阅读者追踪，同时保持覆盖算法、历史数据和既有实体抽屉边界不变。

## 已实施

- 缺口明细分别展示“证据追踪”和“关联追踪”。
- `claim` ID 解析到其主体或客体实体，并显示该 claim 引用的来源 ID。
- `person`、`event-detail`、`heritage-detail` 以及目录中的政权、事件、遗产 ID 复用现有实体抽屉入口。
- 已登记的 source ID 在存在 HTTP(S) 地址时提供新窗口链接；仅有书目引文时保留可读的来源文本。
- 未知 ID 明确显示“未解析”，不猜测类型、不生成伪链接。
- `uncertain` 仍显示为“待复核”；`not-applicable` 仍由覆盖引擎排除，不在面板中伪装成待补项。
- 未修改 coverage 引擎、历史数据、`InfoPanel` 或 `RelationshipGraph`。

## 验证

- `src/components/KnowledgeCoveragePanel.test.tsx`：12/12 通过。
- 测试覆盖 claim、source、person、event-detail、heritage/entity 与未知 ID，以及实体抽屉回调和无回调时的来源链接。

## 边界

- 面板不对未知 ID 做模糊匹配；需要新增解析类型时，应先在数据目录或覆盖引擎建立明确契约。
- 书目引文不是 URL 时只能展示文本，不将其误标为可点击外链。
