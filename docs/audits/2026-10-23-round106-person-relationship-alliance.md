# Round 106 人物联盟/对立关系隔离审计

日期：2026-10-23  
范围：`src/data/person-relationship-round106-alliance.test.ts`  
基线：`required allianceConflict = 73`  
集成状态：本轮纳入2条直接证据充分的阶段性 `ally-of` 关系，覆盖4个人物端点，当前缺口为69项。

## 审计结论

本轮从现有人物详情、事件参与字段和来源目录中筛出并集成2条阶段性政治协作关系。两条关系都有明确人物端点、有效年代、现有 `sourceIds` 与 `uncertaintyNote`，并通过 `validateClaims`；关系仅覆盖限定时期，不替代君臣任职或更广泛的军政网络。

本轮结束后联盟/对立缺口为69项；覆盖器按人物端点计数，2条边分别覆盖双方；其余共享事件、共享政权和谱系背景仍未自动升级为关系边。

## 已集成关系

| 关系 | 有效年代 | 直接证据 | sourceIds | 集成边界 |
| --- | --- | --- | --- | --- | --- |
| `zhu-yujian` — `zheng-zhi-long` | `ally-of` · 1645—1646 | `longwu-fuzhou-founded` 同时列出二人，事件角色说明郑芝龙支撑福州朝廷；双方人物详情均限定隆武阶段。 | `southern-ming-overview`、`southern-ming-longwu`、`ming-shi-vol120-southern-ming` | 仅表示阶段性军政协作；不等同于无条件同盟或隆武全期一致立场。 |
| `zhu-youlang` — `qu-shisi` | `ally-of` · 1646—1650 | `yongli-zhaoqing-founded` 明确记载瞿式耜拥立并辅佐永历政权；双方人物详情均覆盖永历初期。 | `southern-ming-overview`、`southern-ming-yongli`、`ming-shi-vol120-southern-ming` | 与 `served` 分层，仅表示永历初期政治协作，不替代具体任职和后续西南网络。 |

## 明确排除的推断边界

- `oxenstierna`、`trauttmansdorff`、`chigi` 同处威斯特伐利亚多方谈判，只能证明谈判参与或不同方面代表，不能由共同事件自动补 `ally-of`。
- `franklin-roosevelt`、`harry-truman`、`edward-stettinius` 同处联合国成立的倡议、签署和政治承接链条；罗斯福在签署前去世，不能由共同国际组织主题推断个人联盟。
- `liu-yan`、`liu-yin` 共享南汉政权谱系和兄弟/继承背景；这些证据应由亲属、继承或任职关系表达，不能因同一政权自动补 `ally-of`。

## 验证结果

定向命令：

```text
npm test -- --run src/data/person-relationship-round106-alliance.test.ts
```

结果：1 个测试文件、3 个测试全部通过。测试确认：

1. `requiredMissingByCategory.allianceConflict` 已由73降为69；
2. 2 条关系已写入 `claims.ts`，并由测试核验；
3. 候选双方端点、有效年代、来源、人物详情/事件详情证据及不确定性说明均存在；
4. 集成 claim 通过 `validateClaims`；
5. 共享事件、共享政权和谱系背景的边界样例仍保持未覆盖。

