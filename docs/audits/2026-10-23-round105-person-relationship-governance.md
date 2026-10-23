# Round 105 人物治理关系审计

## 结论

本轮审阅 `buildPersonRelationshipCoverageReport()` 的 29 项 required governance 缺口。仅纳入 3 条由现有人物详情 `offices` 字段直接支持、且端点、年代和来源均可闭环的 `ruled` 边：

| claim | 人物 | 政权 | 年代 | 直接证据 |
| --- | --- | --- | --- | --- |
| `claim-tufa-wugu-ruled-southern-liang-round105` | 秃发乌孤 | 南凉 | 397–399 | `person-details.ts`：南凉君主；`zizhi-tongjian` |
| `claim-yuan-shanjian-ruled-eastern-wei-round105` | 元善见 | 东魏 | 534–550 | `person-details.ts`：东魏皇帝；`zizhi-tongjian`、`china-chronology` |
| `claim-yuri-goguryeo-ruled-goguryeo-round105` | 琉璃明王 | 高句丽 | 前19–18 | `person-details.ts`：高句丽国王；`china-chronology` |

本轮不新增 `served` 的人物—政权边：当前 coverage 的端点解析会把 `served` 优先按人物—人物关系判定，无法让人物—政权 `served` 边覆盖 governance 类别；为保持本轮只修改责任数据文件和独立测试/文档，不扩展 coverage 解析逻辑。特别是杜甫的 `唐代官员`任职字段因此保留为候选证据，不写入本批次。

## 29 项逐项边界

| personId | 决定 | 理由 |
| --- | --- | --- |
| `zhang-qian` | 保留 | 有“汉使者”任职与政权端点，但年代为 `unknown`，不能形成有效时间边。 |
| `ban-gu` | 保留 | 有东汉官员角色，但任职年代仅为 `approximate`，本轮不把生卒年或长安语境改写为任职区间。 |
| `du-fu` | 保留 | 现有详情有 757–759 年唐代官员任职，但 `served` 人物—政权边当前不能被 coverage 解析为治理覆盖；不改解析器。 |
| `yu-the-great` | 保留 | 传统夏代先王字段没有有效年代，且详情明确要求区分传说、文献与考古证据。 |
| `jamukha` | 保留 | 有蒙古草原部落联盟首领角色，但年代为约略值，且不能把部落首领直接等同于蒙古政权君主。 |
| `tufa-wugu` | 纳入 | 详情直接给出南凉君主及 397–399 年，端点为有效南凉政权。 |
| `han-kangzi` | 保留 | 详情是“韩国早期政治人物”，虽有年代和政权端点，但不是明确君主统治字段；本轮不从卿族政治资源推断 ruled。 |
| `zhao-xiangzi` | 保留 | 详情是“赵国先导”，不能把三家分晋前的政治先导角色直接等同于赵国统治者。 |
| `wei-huanzi` | 保留 | 详情是“魏国早期政治人物”，不能把卿族领袖字段直接改写为 ruled。 |
| `geluofeng` | 保留 | 有南诏王 748–779 年任职证据，但本轮最多 3 条，优先选择已有更清晰继承/君主边界的三项。 |
| `yuan-shanjian` | 纳入 | 详情直接给出 534–550 年东魏皇帝；不确定性只保留名义皇统与实际军政权力的分层。 |
| `yuri-goguryeo` | 纳入 | 详情直接给出前19–18 年高句丽国王，年代和政权端点完整。 |
| `istemi` | 保留 | 有突厥西部统治者 552–576 年字段，但“西部统治者”与突厥整体 ruled 的范围需要更专门的政权分层证据；本轮不扩展。 |
| `zhang-gui` | 保留 | 有前凉地方统治/刺史角色，但其政权形成是地方军镇连续演变，当前详情不足以安全选定本轮统治边。 |
| `wang-sengbian` | 保留 | 有梁末军政领袖角色，但不是明确君主或单一政权统治者。 |
| `li-gang` | 保留 | 有北宋/南宋宰相与官员任职，但缺少本轮要求的直接人物—政权 claim 选择必要性，且不能从同朝关系推断。 |
| `zong-ze` | 保留 | “东京留守”是具体职务，但不能把留守开封直接扩大为对宋政权的 ruled 边。 |
| `feng-sufo` | 保留 | 有北燕军政大臣任职，但大臣职务支持 served/appointed 方向，当前本轮不新增人物—政权 served。 |
| `yimouxun` | 保留 | 有南诏王 779–808 年字段，但受本轮 3 条上限约束，未纳入。 |
| `quanfengyou` | 保留 | 有南诏王 824–859 年字段，但受本轮 3 条上限约束，未纳入。 |
| `octavian` | 保留 | 现有人物没有政权端点，只有罗马政治主导者描述；不能凭罗马语境补 polity。 |
| `mark-antony` | 保留 | 没有政权端点，只有罗马将领/政治家角色；不能凭共同事件或同一政治环境推断 served/ruled。 |
| `constantine-xi` | 保留 | 有拜占庭皇帝角色但没有可解析 polityId；不能凭城市控制事件补政权端点。 |
| `mehmed-ii` | 保留 | 有奥斯曼苏丹角色但没有可解析 polityId；不能凭君士坦丁堡攻占事件补政权端点。 |
| `guacanagari` | 保留 | 有泰诺地方政治领袖角色但无政权端点、无有效年代；不能把地方政治主体泛化成未知 polity。 |
| `oxenstierna` | 保留 | 是瑞典谈判代表但无政权端点；不能从条约参与或国家语境推断本轮治理边。 |
| `trauttmansdorff` | 保留 | 是哈布斯堡谈判代表但无政权端点；不能从外交代表身份推断 ruled/served 边。 |
| `chigi` | 保留 | 是教廷调停代表但无政权端点；不能从外交角色补写治理关系。 |
| `franklin-roosevelt` | 保留 | 有美国总统任职，但现有人物没有 polityId；不能在本轮凭国家名称语境创建未建模的 polity 端点。 |

## 数据与验证边界

- 未修改现有基线测试。
- 未修改 `docs/audits/2026-10-20-short-gap-decisions.md`。
- `people.ts` 与 `person-details.ts` 已含本轮三条边所需的有效人物、政权和 office 证据，因此不重复改写事实源；本轮只在 `claims.ts` 建立关系投影。
- 新增测试验证双方端点、有效年代、有效 `sourceIds`、非空 `uncertaintyNote`、显式记录证据类型，以及治理缺口由 29 项降至 26 项。
