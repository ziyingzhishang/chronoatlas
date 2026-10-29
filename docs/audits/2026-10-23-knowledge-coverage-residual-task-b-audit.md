# 2026-10-23 Knowledge Coverage residual task B 审计

## 结论

本轮以 `auditKnowledgeCoverage()` 的当前结果、`internal/audits/knowledge-coverage.json` 静态导出和现有主数据为准，确认 residual tasks 恰为 6 项。按当前报告的闭合契约，没有一项可以仅凭现有目录安全移除；安全闭合数为 **0/6**。

这不是说所有任务都没有任何相关线索，而是说现有线索尚不足以把任务转化为报告所要求的直接、可追踪关系。特别是 `changan-han-capital` 已有刘邦的人物导航线索，但仍缺少事件详情中的参与角色记录，因此只能列为“最接近闭合的候选”，不能在不改变主数据的情况下宣称已闭合。

本轮没有修改 `claims`、`events`、`event-details`、`heritage` 或 `heritage-details`，也没有修改用户已有的 `docs/audits/2026-10-20-short-gap-decisions.md`。

## 闭合判定标准

当前生成器在 `src/data/knowledge-coverage.ts:516-550` 使用以下判定：

- 事件参与人物：`eventDetails.participants` 必须存在至少一条记录；记录应包含已建模人物端点、角色和备注，并通过事件、详情、人物之间的来源与年代核验。
- 人物关系：必须存在以当前人物为一端、以另一个已建模人物为另一端的 claim；人物—政权的 `founded` / `ruled` 不替代人物—人物关系。
- 政权遗产：必须有 `HeritageDetail.associatedPolities` 直接包含该政权；同一城市、同一文化区域或同名政权不能替代直接关联。

因此，人物详情中的 `keyEvents`、事件的 `relatedEventIds`、同政权归属、共享来源或时间相容性，只能作为候选线索，不能单独关闭任务。

## 六项任务逐项审计

| 任务 | 当前明确证据 | 阻断结论 |
| --- | --- | --- |
| `event-participant-missing:changan-former-qin` | 事件详情 `src/data/event-details.ts:2521-2530` 的 `participants` 为空，事件年份为351年。当前唯一 `former_qin` 人物是苻坚；其任职区间从357年开始（`src/data/person-details.ts:43-45`），不能把后来的统治者回填为351年事件参与者。 | 没有同时满足事件年代、直接参与语义和来源交集的已建模人物端点。保持开放。 |
| `event-participant-missing:changan-han-capital` | 事件详情 `src/data/event-details.ts:2485-2494` 的 `participants` 为空。刘邦的人物描述和 `keyEvents` 明确指向长安及该事件（`src/data/people.ts:4`、`src/data/person-details.ts:7-10`），但这只是人物导航和摘要，没有事件详情中的角色/备注。萧何等人物也只有汉初任职或制度背景。 | 这是最接近闭合的候选，但现有数据仍缺少直接参与记录；不能把 `keyEvents` 直接等同于 event participant。需独立来源段落或明确的角色级事件证据后再关闭。 |
| `event-participant-missing:daming-palace-built` | 事件详情 `src/data/event-details.ts:2557-2566` 的 `participants` 为空；事件采用634年营建阶段约年。李治、武则天、玄奘、王维虽被 `keyEvents` 导航到该事件，但李治的任职从649年、武则天从690年开始（`src/data/person-details.ts:144-151`），玄奘的长安活动从645年开始（`src/data/person-details.ts:164-166`），均不能证明参与634年启动工程。 | 现有线索是后续使用、宫廷背景或城市活动，缺少634年营建参与者及角色的直接证据。保持开放。 |
| `event-participant-missing:white-horse-temple-founded` | 事件详情 `src/data/event-details.ts:1292-1301` 的 `participants` 为空；官方来源只明确68年创建传统、洛阳地点和历代重修边界（`src/data/events.ts:453-459`）。白马寺遗产详情中的关联人物是跨时期遗产关联，并非68年事件参与者（`src/data/heritage-details.ts:220-221`）。 | 不能从东汉政权、洛阳都城、刘秀或后世佛教人物的背景推断创建参与者。需直接点名并能核验年代的事件来源。保持开放。 |
| `person-person-relationship-missing:tufa-wugu` | 当前人物端点是秃发乌孤；现有 claims 只把他连接到 `southern_liang` 政权（`src/data/claims.ts:582-586`）。秃发利鹿孤、秃发傉檀只出现在说明文字中（`src/data/people.ts:106`、`src/data/person-details.ts:49-52`），没有已建模人物 ID，也没有人物—人物 claim。 | 不能把人物—政权关系改写成亲属、君臣、同僚、联盟或对立关系；也不能凭说明文字生成缺失的人物端点。保持开放。 |
| `polity-heritage-missing:southern_liang` | 南凉政权详情明确为 `heritageIds: []`（`src/data/polity-details.ts:268-273`）。西平、乐都目前只有首都／地点参照（`src/data/places.ts:22-23`），没有可核验的南凉遗产详情。现有 `southern-liang-jiangling-city-site` 属于另一个 `liang_southern`（`src/data/polity-details.ts:195-201`），不能因同名“南梁”或江陵历史层而复用。 | 当前没有直接的遗产—南凉关联；将区域参照或南朝梁遗产挂到十六国南凉会造成政权串接。需要西平／乐都的独立遗产证据，或明确跨政权遗产分层后再关闭。保持开放。 |

## 当前报告与回归证据

`internal/audits/knowledge-coverage.json` 当前 `tasks.length` 为6，任务键集合为：

```text
event-participant-missing:changan-former-qin
event-participant-missing:changan-han-capital
event-participant-missing:daming-palace-built
event-participant-missing:white-horse-temple-founded
person-person-relationship-missing:tufa-wugu
polity-heritage-missing:southern_liang
```

`src/data/residual-knowledge-tasks.test.ts:58-72` 对该集合进行精确断言；本轮运行：

```text
npm test -- --run src/data/residual-knowledge-tasks.test.ts src/data/knowledge-coverage.test.ts
Test Files  2 passed (2)
Tests       11 passed (11)
```

## 建议下一步

1. 保持六项任务开放，不用摘要、导航关系或同政权背景强行消除缺口。
2. 优先单独复核 `changan-han-capital`：若能取得明确记载“刘邦主持／决定定都长安”或同等角色语义的来源，再新增带角色、备注和来源交集的参与记录；在此之前不要把 `keyEvents` 直接升级为参与关系。
3. `daming-palace-built` 应寻找634年营建启动者、主持者或工程组织者的直接史料；后续宫廷使用者不应回填为营建参与者。
4. `white-horse-temple-founded` 应把68年创建传统与永平求法人物、寺院营造人物分层核验，避免把遗产关联人物误写成事件参与者。
5. `tufa-wugu` 只有在继承者被作为独立人物实体建模并有可靠关系来源后，才适合补人物—人物边；否则继续保留人物—政权闭环即可。
6. `southern_liang` 应另立西平／乐都遗产调查任务，优先确认城址、遗址层或可展示遗存的政权归属；不能复用 `liang_southern` 的江陵／建康节点。

