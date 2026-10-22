# 第108轮首都链路任务 C：高句丽早期都城遗产复核

## 复核对象

`wunvshan-goguryeo-early-capital-site` 与高句丽 `wunvshan` 首都阶段。

## 结论：安全闭合

本项满足“遗产详情政权归属、地点、年代和来源”四项硬条件，因此将遗产 ID 补入高句丽政权详情的 `heritageIds`。本轮没有新增事件，也没有把传统建国事件改写为遗址营建事件。

| 证据层 | 当前记录 | 复核结果 |
|---|---|---|
| 首都阶段 | 高句丽—纥升骨城／五女山，前37—2年 | 与遗产地点、年代重合 |
| 遗产资产 | `placeId: wunvshan`；`constructionFrom: -37`；`constructionTo: 2` | 地点和年代字段完整 |
| 遗产详情归属 | `associatedPolities: ['goguryeo']` | 明确归属高句丽 |
| 遗产详情阶段 | “早期中心形成”“山城遗址”，前37—2年 | 提供独立的阶段性遗产描述 |
| 来源 | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | 资产、详情与首都记录具备可追溯来源 |

## 语义边界

- `heritageIds` 表示该遗产是高句丽早期首都阶段的学习入口，不表示五女山全部遗存均在前37年完成。
- 遗产详情仍保留“纥升骨城、五女山与传统建国地点的对应关系需结合文献、考古分期理解”的不确定性说明。
- `goguryeo-founded` 继续作为传统建国节点；本轮没有新增虚构的山城营建事件，也没有把遗产年代等同于建国仪式日期。
- 国内城和平壤遗产仍分别对应后续首都阶段，未因本项闭合而改变其时段或归属。

回归测试：`src/data/capital-reference-round108.task-c.test.ts`。
