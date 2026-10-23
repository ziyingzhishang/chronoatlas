# Round 110 人物关系边界审计

## 结论

本轮只处理人物关系数据。结合现有 coverage 审计、Round 108 的事件参与/治理边界、Round 109 的联盟/对立边界，以及 Round 110 已记录的“只在独立端点、来源和时间语义同时闭合时才纳入”的原则，没有找到可安全新增的 kinship 或 alliance/conflict 候选。因此本轮不修改 `src/data/claims.ts`、`src/data/people.ts` 或其他生产数据。

当前基线保持为：治理 `23` 项 required 缺口、亲属 `110` 项、联盟/对立 `69` 项、事件参与 `10` 项。新增测试只锁定边界，不把未知标为不适用。

## 保留边界

| 候选 | 已有证据 | 不纳入原因 |
| --- | --- | --- |
| 司马炎—司马睿 | 两人均为人物端点，现有 claim 仅为双向 `related-to`，来源可解析 | 司马氏皇室跨代相关和西晋—东晋政权承接不能直接确定父子、祖孙、兄弟、配偶，也不能据此生成 `ally-of` 或 `enemy-of`。 |
| 王审知—未具名兄长 | `people.ts` 描述明确写“与兄长共同经营福建军政” | 第二端点没有姓名、人物 ID 和独立详情；不能为未建模人物创建 `sibling-of`。 |
| 呼韩邪—郅支单于 | 呼韩邪 alias 写明“郅支单于之兄” | 目录没有“郅支单于”人物端点；alias 不能单独扩展人物目录，也不能生成不完整的双端关系。 |

## 验证

新增回归测试：`src/data/person-relationship-round110-boundary.test.ts`。

测试核验：

1. 四个关系类别的 coverage 基线保持不变；
2. 司马炎—司马睿仍只有双向 `related-to`，没有直接 kinship 或 alliance/conflict 谓词；
3. 王审知与呼韩邪的缺失人物端点不会被 alias/描述线索补成生产 claim；
4. 所有涉及人物的现有来源 ID 均可解析。

定向命令：

```text
npm test -- --run src/data/person-relationship-round110-boundary.test.ts src/data/person-relationship-coverage.test.ts src/data/person-relationship-round109-alliance.test.ts
```

本轮不修改用户文件 `docs/audits/2026-10-20-short-gap-decisions.md`。
