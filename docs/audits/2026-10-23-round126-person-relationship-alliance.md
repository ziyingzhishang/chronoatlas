# Round 126 人物联盟/对立关系边界审计

日期：2026-10-23  
范围：当前 `requiredMissingByCategory.allianceConflict`  以及与其直接相交的事件详情人物端点。  
测试：`src/data/person-relationship-round126-alliance.test.ts`

## 审计结论

当前人物关系 coverage 报告中的 required `allianceConflict` 缺口为 **69**。本轮只检查这一类别，不把 `kinship`、`governance` 或 `eventParticipation` 缺口混入候选。

只保留同时满足以下条件的候选：

1. 双方都是当前 `allianceConflict` required 缺口人物端点；
2. 事件详情中双方均为 direct participant，且人物和事件端点可解析；
3. 事件有有效年代，详情来源 ID 均已登记；
4. 现有文本直接表达两人的政治协作、结盟、联军关系，或两人的政治敌对/交战关系；
5. 能够为 claim 提供双方人物、事件详情和不确定性说明的来源闭合。

只出现以下语义的组合不升级为 `ally-of` 或 `enemy-of`：父子/王统承接、同一政权、共同建国或册命事件、同场任职、共同战争背景、多方谈判参与、一般性的国家竞争或继承关系。

本轮扫描得到 20 组双方均处于 required 缺口的共享事件组合；没有一组同时满足直接双人政治关系语义。因此本轮**不修改 `src/data/claims.ts`**，required `allianceConflict` 缺口维持 69 项。

## 保留的边界组合

| 人物端点 | 事件 | 可解析证据 | 排除理由 |
| --- | --- | --- | --- |
| 皮罗阁 — 阁罗凤 | `nanzhao-founded` | 738 年事件、双方 direct participant、`zizhi-tongjian`/`china-chronology` | 父子王权承接与部族联盟背景，不是两人的直接联盟边。 |
| 朱蒙 — 大武神王 | `goguryeo-founded` | 前37年事件、双方 direct participant、`china-chronology` | 建国叙事与后续王权承接，不表达直接政治协作。 |
| 朱蒙 — 琉璃明王 | `goguryeo-founded` | 前37年事件、双方 direct participant、`china-chronology` | 王统承接、亲属与后续迁都阶段不能升级为联盟。 |
| 大武神王 — 琉璃明王 | `goguryeo-founded` | 前37年事件、双方 direct participant、`china-chronology` | 共同王统形成背景，没有双人协作或敌对行动。 |
| 广开土王 — 长寿王 | `goguryeo-moves-pyongyang` | 427年事件、双方 direct participant、`china-chronology`/`capital-history-reference` | 迁都前后两代君主的阶段承接，不是联盟/对立证据。 |
| 朴赫居世 — 南解次次雄 | `silla-founded` | 前57年事件、双方 direct participant、Silla 两项来源 | 即位与早期王统承接属于继承关系。 |
| 朴赫居世 — 内物王 | `silla-founded` | 前57年事件、双方 direct participant、Silla 两项来源 | 传统起点与数百年后王权整合跨阶段，不能证明双人关系。 |
| 南解次次雄 — 内物王 | `silla-founded` | 前57年事件、双方 direct participant、Silla 两项来源 | 王统连续性与后续整合背景，不是直接结盟或敌对。 |
| 朗日松赞 — 赤松德赞 | `tibetan-founded` | 618年事件、双方 direct participant、`china-chronology` | 前置统治与后续制度成熟是跨代政治背景。 |
| 张轨 — 张寔 | `former-liang-founded` | 314年事件、双方 direct participant、`zizhi-tongjian`/`china-chronology` | 父子和政权承接不能升级为 ally-of。 |
| 张轨 — 张茂 | `former-liang-founded` | 314年事件、双方 direct participant、`zizhi-tongjian`/`china-chronology` | 隔代政权延续，没有直接双人协作/敌对语义。 |
| 张寔 — 张茂 | `former-liang-founded` | 314年事件、双方 direct participant、`zizhi-tongjian`/`china-chronology` | 连续继承阶段不替代独立的联盟/对立证据。 |
| 韩虔 — 赵籍 | `partition-jin` | 前403年事件、双方 direct participant、`zizhi-tongjian` | 同获周王室册命是共同制度节点，不是结盟。 |
| 韩虔 — 魏斯 | `partition-jin` | 前403年事件、双方 direct participant、`zizhi-tongjian` | 共同诸侯确认与后续竞争背景不等于双人联盟。 |
| 赵籍 — 魏斯 | `partition-jin` | 前403年事件、双方 direct participant、`zizhi-tongjian` | 三晋制度性并立没有双人协作或敌对行动。 |
| 朱聿鐭 — 苏观生 | `shaowu-guangzhou-founded` | 1646年事件、双方 direct participant、`southern-ming-shaowu` | 君臣同场任职和抗清背景应由其他类别表达，缺少直接 ally-of 语义。 |
| 嬴任好 — 秦孝公 | `qin-state-founded-eighth-batch` | 前770年事件、双方 direct participant、`zizhi-tongjian`/`china-chronology` | 跨时代秦国发展线索不能推出两位君主互为盟友。 |
| 约翰·奥克森谢纳 — 马克西米利安·冯·特劳特曼斯多夫 | `peace-westphalia` | 1648年事件、双方 direct participant、Westphalia 两项来源 | 多方和谈中的谈判对手不等于 `enemy-of`，也不等于 `ally-of`。 |
| 约翰·奥克森谢纳 — 法比奥·基吉 | `peace-westphalia` | 1648年事件、双方 direct participant、Westphalia 两项来源 | 共同外交场景不证明直接政治同盟或敌对。 |
| 马克西米利安·冯·特劳特曼斯多夫 — 法比奥·基吉 | `peace-westphalia` | 1648年事件、双方 direct participant、Westphalia 两项来源 | 共同谈判与战争背景不能推导 `enemy-of`。 |

## 验证结果

本轮新增边界测试：

```text
npm test -- --run src/data/person-relationship-round126-alliance.test.ts
```

结果：1 个测试文件、2 个测试通过。测试确认：

- required `allianceConflict` 仍为 69；
- 20 组边界组合的双方人物、事件、详情、direct participant、年代和来源均可解析；
- 20 组均没有现存 `ally-of` 或 `enemy-of` claim；
- `src/data/claims.ts` 未修改。

定向回归命令：

```text
npm test -- --run \
  src/data/person-relationship-round126-alliance.test.ts \
  src/data/person-relationship-round109-alliance.test.ts \
  src/data/person-relationship-coverage.test.ts
```

本轮不改变 kinship、governance 或 eventParticipation 的数据、测试和 coverage 逻辑，也不修改用户已有未提交文件 `docs/audits/2026-10-20-short-gap-decisions.md`。
