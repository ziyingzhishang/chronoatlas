# Round 110 事件参与专家核验

日期：2026-10-23  
基线：`abd514d`  
范围：round104/108 审计列出的 10 项 `eventParticipation` 缺口，以及当前事件详情参与字段和事件详情 coverage。

## 核验契约

本轮只有同时满足以下条件，才新增 `participated-in` claim 和事件详情 `participants` 字段：

1. 人物端点、事件端点和事件详情端点均已存在；
2. 事件详情中的参与字段明确表达该人物的直接角色，不能是 `contextual`；
3. 人物生卒年代与事件年份或阶段相容；
4. 人物、事件、事件详情存在可追溯的共同 `sourceId`；
5. 证据直接说明“该人物参与该事件”，不以同政权、同地点、同姓、后续统治或继承关系推断。

## 结论

本轮没有安全候选，不修改 `src/data/event-details*.ts` 或 `src/data/claims.ts`，不新增生产参与数据。新增回归测试 `src/data/person-relationship-round110-event-participation-boundary.test.ts`，将上述证据契约和边界固化。

## 逐项核验

| 人物 | 候选事件 | 直接参与字段 | 年代核验 | 结论 |
| --- | --- | --- | --- | --- |
| 霍去病 | `changan-han-capital`（前202） | 详情为空 | 生于前140，晚于事件 | 不补；不能由西汉身份、长安关联或后续军事经历倒推定都参与 |
| 张骞 | `changan-han-capital`（前202） | 详情为空 | 生年在当前目录不形成完整闭合 | 不补；现有出使与定都事件没有直接参与字段 |
| 班固 | `changan-han-capital`（前202） | 详情为空 | 生于32，晚于事件 | 不补；史学记录和长安关联不能回填前202年事件参与 |
| 李治 | `daming-palace-built`（634） | 详情为空；其他三条为 `contextual` | 628—683，与634年相容 | 不补；营建背景或政治使用者不等于该事件直接主持/参与角色 |
| 元宏 | `northern-wei-founded`（386） | 详情仅有拓跋珪 | 生于467，晚于事件 | 不补；后续统治不能前推为建政参与 |
| 拓跋焘 | `northern-wei-founded`（386） | 详情仅有拓跋珪 | 生于408，晚于事件 | 不补；继承和后续扩张不能替代参与证据 |
| 宇文邕 | 无 | 没有可挂接详情 | 543—578 | 不补；不能凭北周政权背景新造事件候选 |
| 赵武灵王 | 无 | 没有可挂接详情 | 前340—前295 | 不补；不能凭赵国背景或改革人物身份推导现有事件参与 |
| 秃发乌孤 | 无 | 没有可挂接详情 | 生年未知，卒于399 | 不补；南凉建国人物 claim 不能替代事件详情参与字段，且现有 `southern-liang-founded` 是502年南梁事件 |
| 蒙哥 | `mongol-founded`（1206） | 详情仅有铁木真 | 生于1209，晚于事件 | 不补；后续汗位继承不能前推为蒙古汗国形成参与 |

## 特别边界

- 李治在 `ximing-temple-built`、`shangyang-palace-built`、`shangyang-palace-completed-679` 中分别作为唐高宗时期的国家/宫苑背景人物或政治使用者出现，三条均为 `relationType: 'contextual'`。这些记录不升级为直接 `participated-in`。
- `tufa-wugu` 已有与 `southern_liang` 政权相关的 claim，但当前 `southern-liang-founded` 事件是502年萧衍建立南梁，不能把同名政权字段或建国者身份错误挂接到秃发乌孤的397年南凉建政。
- `yuan-hong`、`tuoba-tao`、`mongke` 的人物生年晚于对应事件年；同政权、后续统治和继承关系均不是时间相容的直接参与证据。

## Coverage 与回归结果

当前 event-detail coverage 基线保持：`covered = 102`、`needs-review = 31`、`unresolved = 0`；详情孤立记录仍按既有城市史辅助规则处理。

定向测试：

```text
npm test -- --run \
  src/data/person-relationship-round104-independent-audit.test.ts \
  src/data/person-relationship-round108-event-participation.test.ts \
  src/data/person-relationship-round110-event-participation-boundary.test.ts \
  src/data/event-detail-coverage.test.ts
```

结果：4 个测试文件通过，31 个测试通过。生产事件详情、`claims.ts`、UI、study-view、heritage、capital 文件均未修改。
