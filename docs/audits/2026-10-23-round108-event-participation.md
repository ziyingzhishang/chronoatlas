# Round 108 eventParticipation 独立证据审计

日期：2026-10-23  
范围：`src/data/person-relationship-round104-boundary.test.ts` 中的10项 `eventParticipation` 缺口。  
结论：本轮没有发现同时满足“现有人物端点、现有事件详情 participant 字段、人物时间范围、事件/详情/人物共同来源、直接参与语义”的可安全集成候选；不写入生产数据。

## 审计契约

只有同时满足以下条件，才记录为“待主代理集成”：

1. 人物和事件端点已存在，且事件详情已存在。
2. 事件详情已有该人物的 participant 字段。
3. 事件年份或年份范围与人物生卒范围不冲突。
4. 人物、事件、事件详情三者存在已登记的共同 `sourceId`。
5. participant 不是仅用于政权背景、时代背景或继承关系的 `contextual` 字段。

## 十项缺口复核

| 人物 | 基线事件候选 | 现有 participant 字段 | 时间范围 | 来源交集 | 处置 |
| --- | --- | --- | --- | --- | --- |
| 霍去病 | `changan-han-capital`（前202） | 无 | 生于前140，晚于事件 | 事件与详情来源存在，但无参与字段 | 保持缺口；不可将西汉人物身份或后续军事经历回填为定都参与 |
| 张骞 | `changan-han-capital`（前202） | 无 | 生年未知，无法形成完整生卒闭合 | 有 `zizhi-tongjian`，但无参与字段 | 保持缺口；时间不完整且无详情参与记录 |
| 班固 | `changan-han-capital`（前202） | 无 | 生于32，晚于事件 | 有来源，但时间冲突且无参与字段 | 保持缺口；东汉史家身份不能回填西汉定都 |
| 李治 | `daming-palace-built`（634） | 无 | 628—683，时间重叠 | 人物、事件、详情均可交集到 `zizhi-tongjian` | 保持缺口；现有证据只到事件背景，未形成 participant 字段 |
| 元宏 | `northern-wei-founded`（386） | 无 | 生于467，晚于事件 | 有来源，但时间冲突且无参与字段 | 保持缺口；不能以北魏后期继承统治替代建政参与 |
| 拓跋焘 | `northern-wei-founded`（386） | 无 | 生于408，晚于事件 | 有来源，但时间冲突且无参与字段 | 保持缺口；不能以继承统治替代建政参与 |
| 宇文邕 | 无 | 无 | 543—578 | 无可审计的现有事件详情候选 | 保持缺口；当前目录没有完整候选端点 |
| 赵武灵王 | 无 | 无 | 前340—前295 | 无可审计的现有事件详情候选 | 保持缺口；不能从赵国政权背景推导个人事件参与 |
| 秃发乌孤 | 无 | 无 | 生年未知，卒于399 | 无可审计的现有事件详情候选 | 保持缺口；不能仅从南凉建政 claim 反推详情参与字段 |
| 蒙哥 | `mongol-founded`（1206） | 无 | 生于1209，晚于事件 | 有来源，但时间冲突且无参与字段 | 保持缺口；不能把后续汗位继承前推到蒙古汗国形成 |

## 现有 participant 字段专项核查

十名人物中，只有李治在其他现有事件详情出现 participant 字段：

- `ximing-temple-built`
- `shangyang-palace-built`
- `shangyang-palace-completed-679`

三条记录均标记为 `relationType: 'contextual'`，分别表达唐高宗时期的国家寺院/宫苑背景或政治使用者，不等同于亲自主持全部营建，也不满足直接 `participated-in` 语义。三条详情与李治人物来源 `zizhi-tongjian` 没有共同 `sourceId`：详情分别使用西明寺专属来源、`taiping-yulan-shangyang-palace`、`zizhi-tongjian-vol202-shangyang`。因此，即使时间范围均与李治生卒年重叠，也不能安全升级为人物关系证据。

## 待主代理集成清单

本轮清单为空。特别是李治与大明宫事件虽然时间和来源交集成立，但当前 `daming-palace-built` 详情的 `participants` 为空；这只能作为后续人工史料核验线索，不能在本审计中直接生成生产 claim 或 participant 数据。

## 验证

独立审计测试：

```text
npm test -- --run src/data/person-relationship-round108-event-participation.test.ts
```

结果：1 个测试文件通过，2 个测试通过。审计测试只读现有目录，并未修改 `events.ts`、`event-details.ts`、`claims.ts` 或 round-104 基线测试。
