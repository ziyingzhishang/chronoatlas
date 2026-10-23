# Round 107 人物治理关系审计

## 结论

本轮针对当前 `buildPersonRelationshipCoverageReport()` 的 26 项 required governance 缺口，纳入 3 条由现有人物详情 `offices` 直接证明的 `ruled` 人物—政权关系。三条关系均有明确的“南诏王”职衔、`nanzhao` 政权端点、有效年代、可解析来源，并通过 `validateClaims`。治理缺口由 26 项降至 23 项。

| claim | 人物 | 政权 | 年代 | 直接 office 证据 | sourceIds |
| --- | --- | --- | --- | --- | --- |
| `claim-geluofeng-ruled-nanzhao-round107` | 阁罗凤 `geluofeng` | 南诏 `nanzhao` | 748–779 | `person-details.ts`：南诏王 | `zizhi-tongjian`, `china-chronology` |
| `claim-yimouxun-ruled-nanzhao-round107` | 异牟寻 `yimouxun` | 南诏 `nanzhao` | 779–808 | `person-details.ts`：南诏王 | `zizhi-tongjian`, `china-chronology` |
| `claim-quanfengyou-ruled-nanzhao-round107` | 劝丰祐 `quanfengyou` | 南诏 `nanzhao` | 824–859 | `person-details.ts`：南诏王 | `zizhi-tongjian`, `china-chronology` |

## 判定边界

- 只把现有人物详情明确标注为政权君主/国王、且有有效年代和政权端点的记录投影为 `ruled`。
- 不把南诏形成事件（738）或人物的 `participated-in`、继承关系单独当作治理证据。
- 不新增普通官员、将领或军政大臣的 `served` 边；本轮未修改 coverage 解析逻辑。
- 不根据同朝、同城、共同事件或政权语境推断人物—政权关系。

## 验证

- `src/data/person-relationship-round107-governance.test.ts`：3 tests passed。
- 三条新增 claim 的双方端点、有效区间、来源 ID 和 `uncertaintyNote` 均通过断言。
- 三条 claim 均通过 `validateClaims`。
- round107 断言治理 required 缺口为 23，并保留 `zhang-qian`、`ban-gu`、`octavian`、`franklin-roosevelt` 等边界候选。
- `person-relationship-coverage.test.ts` 与 round107 测试通过；既有 `person-relationship-round105-governance.test.ts` 仍硬编码缺口为 26，因本轮合法降至 23 而失败，按要求未修改该基线测试。
