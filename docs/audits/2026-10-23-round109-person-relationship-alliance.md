# Round 109 人物联盟/对立关系无候选边界审计

日期：2026-10-23  
范围：`src/data/person-relationship-round109-alliance.test.ts`  
基线：`required allianceConflict = 69`  
集成状态：本轮未发现满足直接政治协作或敌对证据契约的新增关系；未修改 `src/data/claims.ts` 与既有基线测试。

## 审计结论

本轮复核剩余人物及现有事件详情、人物详情和来源目录。候选必须同时具备：明确的 `ally-of` 或 `enemy-of` 语义、有效年代、双方人物端点、可解析且已登记的来源，以及 `uncertaintyNote`。在该严格标准下，没有可安全集成的新增关系。

因此本轮只保留边界审计，联盟/对立缺口维持 `69` 项。共同事件、共同政权、君臣任职、继承关系或同一谈判场景不自动转换为联盟或敌对关系。

## 边界样例

| 人物端点 | 现有事件 | 可证明内容 | 排除理由 |
| --- | --- | --- | --- |
| `liu-xuan` — `liu-xiu` | `gengshi-founded` | 更始集团参与与阶段性任职 | 不能从同一政治集团和 `served` 关系推断 `ally-of` |
| `zhu-yujian` — `huang-daozhou` | `longwu-fuzhou-founded` | 隆武朝廷任职、抗清政治活动 | 君臣任职和共同朝廷背景不等于联盟边 |
| `zhu-yuyue` — `su-guansheng` | `shaowu-guangzhou-founded` | 绍武朝廷君主与军政大臣同处阶段 | 同场任职缺少直接结盟语义 |
| `liu-bang` — `xiao-he` | `chu-han-contention` | 汉方核心领袖与行政后勤协作背景 | 事件参与和行政支持不能替代直接 `ally-of` 证据 |
| `ji-chang` — `zhou-gong-dan` | `zhou-conquest` | 周初王朝形成的前后阶段人物 | 宗室/王朝承接关系不能自动生成联盟边 |
| `oxenstierna` — `chigi` | `peace-westphalia` | 多方和谈中的谈判代表 | 共同谈判场景不证明双方政治同盟或敌对 |

以上组合均有双方人物、事件详情和登记来源，但现有材料没有足以独立证明 `ally-of` 或 `enemy-of` 的直接关系语义；本轮没有新增 claim。

## 验证结果

定向命令：

```text
npm test -- --run src/data/person-relationship-round109-alliance.test.ts
```

结果：1 个测试文件、2 个测试全部通过。测试确认：

1. `requiredMissingByCategory.allianceConflict` 仍为 `69`；
2. 6 组边界组合均没有现存或新增的 `ally-of` / `enemy-of` claim；
3. 每组组合的双方人物端点、事件端点、有效事件年代和来源 ID 均可解析；
4. `claims.ts` 未被修改，既有基线测试未被修改。
