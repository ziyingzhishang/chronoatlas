# Round 125 政权建立事件详情参与端点闭合审计

日期：2026-10-23

## 审计结论

本轮关闭 3 条已有政权建立相关事件详情的参与人物端点：

| 事件详情 | 人物端点 | 时间与地点 | 来源状态 | 结果 |
| --- | --- | --- | --- | --- |
| `changan-xin-founded` | 王莽 `wang-mang` | 公元9年，长安 | 事件与详情来源均可解析，且与人物来源相交 | 补入直接参与记录；保留 `verification: partial` 的复核边界 |
| `changan-later-qin` | 姚苌 `yao-chang` | 384年形成、386年前后据长安 | 事件与详情来源均可解析，且与人物来源相交 | 补入直接参与记录；不把形成与据城合并为同日 |
| `tang-founded-changan` | 李渊 `li-yuan` | 618年，长安 | 事件与详情来源均可解析，且与人物来源相交 | 补入直接参与记录，coverage 进入 `covered` |

角色说明均限定在已有事件节点，不把后续战争、后期疆域或城市延续推回建政时刻。没有新增人物关系 claim，也没有改写人物目录。

## Coverage 结果

- 政权建政节点覆盖仍为 87/87（100%）。
- 事件详情 coverage 从 `covered 102 / needs-review 31 / unresolved 0` 变为 `covered 103 / needs-review 30 / unresolved 0`。
- `changan-xin-founded`、`changan-later-qin` 仍为 `needs-review`，原因是既有事件核验状态为 `partial`，不是参与端点缺失。
- 三条详情的 participants、locations、polities、relatedEvents 和 sources 均可解析；没有新增 unresolved 引用。

## 范围边界

本轮只修改 `src/data/event-details.ts`、事件详情 coverage 相关测试和本审计文档。未修改 `events.ts`、`people.ts`、`claims.ts`、capital/city 数据或人物关系。约年、跨年和 partial verification 的历史不确定性继续按原有 coverage 规则保留。

## 验证

定向测试覆盖新增回归、事件详情 coverage、政权 coverage 以及全部既有政权建立事件批次测试；结果为 14 个测试文件、58 个测试全部通过。新增回归确认李渊节点为 `covered`、王莽和姚苌节点仍为 `needs-review`。
