# 政权建立事件参与端点闭合设计

日期：2026-10-23

## 目标

为 3 条已经具备明确事件节点、年份、地点/政权端点和可解析来源的政权建立相关事件详情补入已有人物的直接参与记录，关闭可安全关闭的参与端点缺口：

- `changan-xin-founded` — 王莽 `wang-mang`
- `changan-later-qin` — 姚苌 `yao-chang`
- `tang-founded-changan` — 李渊 `li-yuan`

## 方案

只修改 `src/data/event-details.ts` 中上述 3 条详情的 `participants` 字段，并新增一组针对本批次的回归测试。人物 ID 均来自现有人物目录；事件时间、地点、政权、来源、事件标题和 `verification` 字段保持不变。

参与记录的角色和说明只表达对应建政/据城阶段的直接人物端点：

- 王莽：公元 9 年受禅、改国号并建立新朝；不把新末战争或全部旧汉疆域控制前推到该节点。
- 姚苌：384 年后秦形成及其后取得长安的连续阶段；不把 384 年与 386 年合并为同日，也不把长安节点扩展为后秦全域控制。
- 李渊：618 年在长安受禅即位、建立唐朝；不把建国节点扩展为唐已控制隋旧境全部地区。

不升级 `datePrecision` 或 `verification`，不新增关系 claim，不修改人物目录、首都/城市数据或其他事件节点。

## Coverage 预期

当前基线为政权建政节点 87/87，事件详情 coverage 为 `covered 102 / needs-review 31 / unresolved 0`。本轮补入 3 个已存在人物端点后：

- `tang-founded-changan` 的参与者复核项应关闭，并从 `needs-review` 进入 `covered`；
- `changan-xin-founded` 与 `changan-later-qin` 仍因事件本身 `verification: partial` 保留核验边界，不因补人物而升级；
- 所有 3 条的 participants、locations、polities、relatedEvents 和 sources 引用均应可解析。

## 测试设计

新增 `src/data/polity-foundation-participant-closure.test.ts`，测试三件事：

1. 三条事件详情各恰有指定人物的直接 participant，且角色/说明保留时间和范围边界。
2. 三条事件的事件字段和详情字段共同满足年份、地点、政权、来源和相关事件引用闭合。
3. coverage 状态只发生预期变化：唐长安节点变为 `covered`，另外两条仍为 `needs-review`，全局 `unresolved` 仍为 0，且政权建政覆盖仍为 87/87。

定向验证包括新增测试、`event-detail-coverage.test.ts`、`polity-coverage.test.ts` 以及已有政权建政事件测试。

## 审计边界

这 3 条是现有城市史辅助事件详情中的参与端点补全，不是新增城市事实或新增人物关系。其余缺少参与者的城市史事件仍不在本轮范围内；约年/跨年事件仍维持现有 `needs-review` 语义。
