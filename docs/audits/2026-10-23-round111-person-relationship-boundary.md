# Round 111 人物关系缺口边界审计

日期：2026-10-23  
范围：当前 `buildPersonRelationshipCoverageReport()` 的 required `governance` 与 `eventParticipation` 缺口。  
结论：两类缺口均没有同时满足项目安全集成契约的候选；安全候选：0。本轮只新增边界测试与审计文档，不修改生产关系数据。

## 当前缺口

### governance：23 项

`zhang-qian` 张骞、`ban-gu` 班固、`du-fu` 杜甫、`yu-the-great` 禹、`jamukha` 札木合、`han-kangzi` 韩康子、`zhao-xiangzi` 赵襄子、`wei-huanzi` 魏桓子、`istemi` 室点密、`zhang-gui` 张轨、`wang-sengbian` 王僧辩、`li-gang` 李纲、`zong-ze` 宗泽、`feng-sufo` 冯素弗、`octavian` 屋大维、`mark-antony` 马克·安东尼、`constantine-xi` 君士坦丁十一世、`mehmed-ii` 穆罕默德二世、`guacanagari` 瓜卡纳加里克斯、`oxenstierna` 约翰·奥克森谢纳、`trauttmansdorff` 马克西米利安·冯·特劳特曼斯多夫、`chigi` 法比奥·基吉、`franklin-roosevelt` 富兰克林·德拉诺·罗斯福。

审计筛选条件是：

1. 人物详情 `offices` 中存在明确君主/统治职衔；
2. office 有可解析的政权端点；
3. `validFrom`、`validTo` 均存在且顺序有效；
4. office 的 `sourceIds` 非空且全部存在于来源目录。

23 项均未通过完整筛选，因此没有新增 `ruled` 或 `served` claim。不能用人物角色、同朝/同政权、同城、参与事件、继承关系或政治背景替代明确的 dated office 证据。尤其是部分人物虽有“皇帝”“君主”“可汗”等人物角色，但当前 `personDetails.offices` 没有满足全部闭合条件的可写入记录。

### eventParticipation：10 项

| 人物 | 当前事件候选 | 排除原因 |
| --- | --- | --- |
| 霍去病 `huo-qubing` | `changan-han-capital` | 生于前140年，晚于前202年事件；且详情没有其 participant 字段 |
| 张骞 `zhang-qian` | `changan-han-capital` | 生年未知，无法形成完整年代闭合；详情没有 participant 字段 |
| 班固 `ban-gu` | `changan-han-capital` | 生于32年，晚于前202年事件；详情没有 participant 字段 |
| 李治 `li-zhi` | `daming-palace-built` | 时间相容但该详情 participants 为空；其他营建记录均为 `contextual`，不是 direct participant |
| 元宏 `yuan-hong` | `northern-wei-founded` | 生于467年，晚于386年事件；详情没有其 participant 字段 |
| 拓跋焘 `tuoba-tao` | `northern-wei-founded` | 生于408年，晚于386年事件；详情没有其 participant 字段 |
| 宇文邕 `yuwen-yong` | 无 | 当前目录没有可挂接的事件详情端点 |
| 赵雍 `zhao-wuling` | 无 | 当前目录没有可挂接的事件详情端点 |
| 秃发乌孤 `tufa-wugu` | 无 | 当前目录没有可挂接的事件详情端点；不能把南凉人物关系误挂到502年南梁事件 |
| 蒙哥 `mongke` | `mongol-founded` | 生于1209年，晚于1206年事件；详情没有其 participant 字段 |

安全集成条件是：人物、事件和事件详情端点存在；详情 participant 为 direct 或未标记 contextual；人物生卒与事件时间相容；人物、事件、详情三者至少有一个已登记的共同来源。当前没有候选同时满足这些条件。

特别边界：李治在 `ximing-temple-built`、`shangyang-palace-built`、`shangyang-palace-completed-679` 中的记录均为 `contextual`，表达国家/宫苑背景或政治使用者，不升级为直接参与。元宏、拓跋焘和蒙哥的后续统治不能前推为政权形成事件参与。宇文邕、赵武灵王、秃发乌孤没有可审计的现有事件详情端点，不能从政权背景或已有 claim 新造参与关系。

## 验证

新增边界测试：`src/data/person-relationship-round111-boundary.test.ts`。

定向命令：

```text
npm test -- --run \
  src/data/person-relationship-round111-boundary.test.ts \
  src/data/person-relationship-round107-governance.test.ts \
  src/data/person-relationship-round108-governance.test.ts \
  src/data/person-relationship-round108-event-participation.test.ts \
  src/data/person-relationship-round110-event-participation-boundary.test.ts \
  src/data/person-relationship-coverage.test.ts
```

结果：新增边界测试与既有关系 coverage 定向测试全部通过；生产 `claims.ts`、`event-details.ts`、人物/政权/事件目录未修改；用户已有 `docs/audits/2026-10-20-short-gap-decisions.md` 改动保持不变。
