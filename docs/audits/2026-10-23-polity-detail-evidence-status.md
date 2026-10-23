# PolityDetail 证据状态审计（2026-10-23）

## 范围

本轮只审查 `PolityDetail` 的首都阶段、主要人物、关键事件和遗产关联列表。未修改 `PolityDetail` 数据模型、领域事实、`claims`、`KnowledgeCoveragePanel` 或首都/城市数据。

## 实施结论

- 首都阶段保留既有有效期和现代地名，并从已存在的地点来源显示来源解析计数；原有地点 `onOpenEntity` 入口不变。
- 主要人物从已有 `PersonDetail.offices` 显示与政权相关的任职有效期，并合并人物、详情和任职记录中的来源解析状态；已有人物抽屉入口不变。
- 关键事件从已有事件记录和 `HistoricalEventDetail` 显示有效期、来源解析状态及已有不确定性说明；转折点事件和关联事件均保留原事件抽屉入口。
- 遗产关联从已有遗产资产和 `HeritageDetail` 显示建造有效期、来源解析状态及已有不确定性说明；原有遗产抽屉入口不变。
- 没有可用的有效期或不确定性时不推断新值；来源解析只统计现有 `sourceIds` 在 `sourceById` 中的可解析情况。

## 验证

- `src/components/PolityDetail.test.tsx`：2/2 通过。
- `npm run build`：通过。
- `git diff --check`：通过。

## 边界

本轮只呈现已有数据，不把人物生卒年、事件单年或遗产建造期扩展为新的关系有效期，也不因来源缺失补写史实。来源解析状态是数据可达性提示，不等同于史料真实性或学术结论。
