# 事件参与人物缺口独立审计（2026-10-21）

## 审计范围

本审计只读取当前工作树中的知识覆盖计算、事件目录、事件详情、人物目录、政权目录、来源目录和历轮事件详情测试；不修改 `event-details.ts`、人物、关系、遗产、首都或 UI 数据。

当前审计基线：

- `auditKnowledgeCoverage()` 的 `event-participant-missing`：19 条。
- 事件目录：99 条；人物目录：143 人。
- 参与人物冻结边界：12 条。项目目前没有单独的 participant-freeze JSON 注册表，冻结依据是历轮专项测试中的明确断言。
- 几何缺口冻结清单（`frozen-short-gaps.json`、`frozen-medium-gaps.json`）共 83 条；它们是疆域几何审计输入，不自动等同于事件参与人物冻结。本报告不把两类缺口混为一谈。

## 证据等级口径

- **A**：事件详情有专门的领域来源或两类以上可解析来源，且已有明确人物端点；仍需补角色和阶段说明。
- **B**：有《资治通鉴》/历史年表等项目来源和可用人物端点，但事件是形成阶段、政权转换或多中心过程，补录时必须写明角色边界。
- **C**：事件有详情来源，但缺少政权/人物端点，或属于跨文明、多方参与事件；当前不宜凭目录名称补人物。
- **F（冻结）**：已有专项测试明确要求保留空参与人物。括号内的 A/B/C 只表示未来若解冻后的资料准备度，不表示本轮可以直接修改。

## 一、剩余非冻结缺口（下一轮候选）

这 7 条没有被现有参与人物专项测试冻结，可作为下一轮候选。优先级按“已有端点且事件与项目主线关系强”排序。

| 优先级 | 事件 ID | 事件 | 政权/视角 | 可用人物端点 | 事件/详情来源 | 等级 | 下一轮建议 |
|---:|---|---|---|---|---|---|---|
| 1 | `song-southward` | 北宋覆亡与南宋开始（1127） | 北宋、南宋 | 赵构 `zhao-gou`；岳飞 `yue-fei`；秦桧 `qin-hui`；韩世忠 `han-shizhong`；赵匡胤 `zhao-kuangyin` | 详情：`china-chronology`、`capital-history-reference`；事件目录缺少 `sourceIds` | B | 首选补录赵构（南宋建立/南渡核心）、岳飞与韩世忠（抗金军政角色）；秦桧只在能明确放入后续阶段时加入，不把赵匡胤作为1127年参与者。先补事件目录来源，再写南渡、靖康后续与阶段角色。 |
| 2 | `southern-ming-founded` | 南明政权体系形成（1644，约年） | 南明，多政权并立 | 朱由崧 `zhu-yousong`；史可法 `shi-kefa` | 事件/详情：`china-chronology` | B | 可补朱由崧、史可法，但必须标注南明是多个阶段性政权的合称，不能把二人写成唯一“南明建国者”；参与时间应覆盖弘光阶段而非整个南明。 |
| 3 | `augustus-principate` | 屋大维获奥古斯都称号（前27） | 当前详情未关联政权 | 无可用人物端点 | 详情：`cliopatria`；事件目录无来源 | C | 暂缓。需要先建立奥古斯都/罗马政权及人物目录端点和来源边界；不得因事件标题直接新增人物或把罗马制度事件套入中国政权模型。 |
| 4 | `constantinople-1453` | 君士坦丁堡陷落（1453） | 当前详情未关联政权 | 无可用人物端点 | 详情：`cliopatria`；事件目录无来源 | C | 暂缓。需先确定东罗马、奥斯曼及君士坦丁十一世、穆罕默德二世等跨文明目录范围和来源，再决定是否纳入参与人物图谱。 |
| 5 | `columbus-caribbean` | 哥伦布抵达加勒比（1492） | 当前详情未关联政权 | 无可用人物端点 | 详情：`cliopatria`；事件目录无来源 | C | 暂缓。需先补西班牙、加勒比原住民政治实体和来源；不能只补哥伦布而制造单一叙事。 |
| 6 | `peace-westphalia` | 威斯特伐利亚和约（1648） | 当前详情未关联政权 | 无可用人物端点 | 详情：`cliopatria`；事件目录无来源 | C | 暂缓。应先定义条约签署方、谈判代表和政权实体，再补人物；不能把“和约”自动映射为单一人物事件。 |
| 7 | `un-founded` | 联合国成立（1945） | 当前详情未关联政权 | 无可用人物端点 | 详情：`cliopatria`；事件目录无来源 | C | 暂缓。需要国际组织、创始成员及会议代表的实体模型；现有人物目录不足以支持可靠闭环。 |

### 非冻结候选结论

下一轮若仍限定只改事件详情，建议只处理 `song-southward` 和 `southern-ming-founded` 两条；二者都有现成端点，且可以在不扩展人物目录的前提下写出阶段性角色。其余 5 条应先做跨文明实体范围审计，不宜直接补人物。

## 二、仍在冻结边界内的缺口

以下 12 条虽然部分已经有可用人物端点，但历轮测试明确要求保持空参与人物；本轮不能把“有端点”直接解释为“可实施”。

| 事件 ID | 事件 | 政权 | 可用人物端点 | 来源 | 等级 | 冻结依据与建议 |
|---|---|---|---|---|---|---|
| `former-liang-founded` | 前凉形成（314，约年） | 前凉 | 无 | `zizhi-tongjian`、`china-chronology` | F/C | 第二十九轮边界测试明确保留；张轨等可靠端点尚未进入人物目录。继续冻结。 |
| `western-qin-founded` | 西秦形成（385，约年） | 西秦 | 乞伏国仁 `qifu-guoren` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮位置批次要求保持参与人物缺口；可作为解冻后的首选，但需补“部族首领/政权形成”阶段语义。 |
| `southern-yan-founded` | 南燕形成（398，约年） | 南燕 | 慕容德 `murong-de`；慕容超 `murong-chao` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮边界仍有效；慕容德适合形成阶段，慕容超只能作为后续阶段，不得并列为同年建政者。 |
| `northern-yan-founded` | 北燕形成（407，约年） | 北燕 | 高云 `gao-yun`；冯跋 `feng-ba`；冯弘 `feng-hong` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮边界仍有效；高云与冯氏权力转换需分阶段表达，不能把三人写成同一时点共同建政。 |
| `southern-chen-founded` | 南陈建立（557） | 南陈 | 陈霸先 `chen-baxian`；陈顼 `chen-xu` | `zizhi-tongjian`、`china-chronology` | F/B | 第二十八轮明确保留陈霸先端点缺口；陈顼属于后续君主，不能替代557年建立者。需先解冻再补。 |
| `nanzhao-founded` | 南诏形成（738，约年） | 南诏 | 皮罗阁 `piluo-ge`；阁罗凤 `geluofeng` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮明确保持空参与者；皮罗阁较适合形成阶段，阁罗凤应标为继承/扩张阶段。 |
| `xiongnu-founded` | 匈奴联盟形成（前209，约年） | 匈奴 | 冒顿 `modu-chanyu`；呼韩邪 `huhanye` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮及第二十七轮均保留边界；呼韩邪远晚于前209年，只能作为后续阶段索引。 |
| `silla-founded` | 新罗建立（前57，传统纪年） | 新罗 | 朴赫居世 `park-hyeokgeose`；南解次次雄 `namhae-chachaung`；奈勿尼师今 `naemul-isageum` | `silla-encykorea`、`silla-samguksagi-db`、`capital-history-reference` | F/A | 第二十二轮明确冻结；朴赫居世是建国节点，后两人属于王统后续阶段，若解冻必须分期。 |
| `goguryeo-founded` | 高句丽建立（前37，传统纪年） | 高句丽 | 朱蒙 `jumong`；大武神王 `daemusin`；琉璃明王 `yuri-goguryeo` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮明确冻结；朱蒙为传统建国节点，后两人为后续王统，不能并列为前37年参与者。 |
| `tuyuhun-founded` | 吐谷浑形成（313，约年） | 吐谷浑 | 慕容吐谷浑 `murong-tuyuhun` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮明确冻结；迁徙型政治共同体不能用单一“建国者”叙事压平。 |
| `turkic-founded` | 突厥汗国建立（552） | 突厥 | 阿史那土门 `asina-tumen`；室点密 `istemi` | `turkic-history-db`、`turkic-orkhon-collection`、`capital-history-reference` | F/A | 第二十二轮明确冻结；阿史那土门与室点密需分别标注汗国建立与西向扩张/分支活动。 |
| `tibetan-founded` | 吐蕃形成（618，约年） | 吐蕃 | 松赞干布 `songtsen-gampo`；囊日松赞 `namri-songtsen`；赤德松赞 `tridu-songtsen` | `zizhi-tongjian`、`china-chronology`、`capital-history-reference` | F/B | 第二十二轮明确冻结；囊日松赞、松赞干布和赤德松赞属于连续阶段，不能把后世人物倒置到618年。 |

## 冻结边界审计结论

冻结不是“永远不能补”，而是当前版本的可追溯保护条件：

1. 第二十二轮专项测试对十个早期/草原政权事件保留空参与者断言。
2. 第二十七轮再次确认匈奴边界。
3. 第二十八轮确认南陈边界。
4. 第二十九轮确认前凉边界。

因此，本报告把“存在人物端点”和“允许本轮写入事件详情”分开记录。任何后续解冻都应先新增独立审计或更新边界测试，再进行事件详情修改。

## 下一轮建议

1. **首选两条可实施事件**：`song-southward`、`southern-ming-founded`。补录时要求每位人物有角色、阶段、来源和不确定性说明，并补齐北宋覆亡事件自身缺失的事件级来源。
2. **解冻后优先**：`western-qin-founded`、`southern-yan-founded`、`northern-yan-founded`、`southern-chen-founded`、`nanzhao-founded`；这些事件已有端点，但必须把后续君主与形成阶段拆开。
3. **继续冻结**：`former-liang-founded`、`xiongnu-founded`、`silla-founded`、`goguryeo-founded`、`tuyuhun-founded`、`turkic-founded`、`tibetan-founded`，直到人物端点、阶段来源和边界测试形成一致闭环。
4. **跨文明事件另立专题**：屋大维、君士坦丁堡、哥伦布、威斯特伐利亚和约、联合国成立不应混入下一轮中国政权事件批次；先建立政权/组织与人物目录范围。

## 复核命令

```bash
npm test -- --run src/data/knowledge-coverage.test.ts src/data/coverage-decisions.test.ts src/data/event-details-twenty-second-batch.test.ts src/data/event-details-twenty-seventh-batch.test.ts src/data/event-details-twenty-eighth-batch.test.ts src/data/event-details-twenty-ninth-batch.test.ts
npm run build
git diff --check
```

本次审计只新增本文件；现有 `docs/audits/2026-10-20-short-gap-decisions.md` 的未提交变更未覆盖、未回滚。
