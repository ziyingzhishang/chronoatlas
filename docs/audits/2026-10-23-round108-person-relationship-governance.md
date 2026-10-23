# Round 108 人物治理关系边界审计

## 结论

本轮复核当前 `buildPersonRelationshipCoverageReport()` 的 23 项 required governance 缺口。没有找到同时满足以下条件的候选，因此不新增 `round108` 治理 claim：

- 现有人物详情明确记录君主、国王或同等统治者职衔；
- office 具有有效的 `polityId` 政权端点；
- office 具有有效的 `validFrom` / `validTo` 年代；
- office 的全部 `sourceIds` 都能在来源目录中解析；
- 关系可以安全表达为 `ruled`、`appointed` 或 `served`，而不是由同朝、同城或事件参与推断。

## 逐类边界

| 条目 | 处理 | 原因 |
| --- | --- | --- |
| `zhang-qian`, `ban-gu` | 排除 | 使者、史家与官员详情没有有效君主职衔和完整治理边 |
| `du-fu`, `li-gang`, `zong-ze`, `wang-sengbian`, `feng-sufo` | 排除 | 有年代官职，但分别是官员、军政将领、留守或大臣，不是明确君主/国王职衔 |
| `han-kangzi`, `zhao-xiangzi`, `wei-huanzi` | 排除 | “氏族领袖/早期政治人物”不是现有人物详情中的明确国君职衔，不能据此推断 `ruled` |
| `istemi` | 排除 | “突厥西部统治者”虽有年代和来源，但缺少政权端点之外的明确国王/君主职衔证据，且不能把区域统治者概括为 `ruled` 政权关系 |
| `octavian`, `mark-antony` | 排除 | 现有 office 不是明确君主/国王职衔；屋大维的人物详情也没有政权端点 |
| `constantine-xi`, `mehmed-ii` | 排除 | 分别有“拜占庭皇帝”“奥斯曼苏丹”和有效年代，但 office 缺少 `polityId`，不能构造可解析的政权关系 |
| `yu-the-great`, `jamukha`, `guacanagari` | 排除 | office 年代不完整或不确定，且不是满足本轮条件的可解析君主—政权边 |
| `oxenstierna`, `trauttmansdorff`, `chigi`, `franklin-roosevelt` | 排除 | 谈判代表、调停代表或总统/倡议者身份不构成本轮要求的君主—政权关系 |

## 保留的边界

- 不修改 `src/data/claims.ts`。
- 不把现有 `participated-in`、`related-to`、事件参与或同朝关系升级为治理关系。
- 不修改组件、亲属、联盟、事件参与关系或既有基线测试。
- `src/data/person-relationship-round108-governance.test.ts` 仅锁定 23 项缺口及“无 round108 claim、无合格 office 候选”的边界。

## 验证

- 定向测试：`src/data/person-relationship-round108-governance.test.ts`，2 tests passed。
- 本轮没有生产数据变更；治理 required 缺口保持 23 项。
