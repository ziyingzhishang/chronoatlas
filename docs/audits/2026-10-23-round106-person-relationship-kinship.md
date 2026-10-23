# Round 106 人物亲属关系边界审计

日期：2026-10-23

本轮目标是从现有人物详情、aliases、任职和现有来源中，为 required kinship 缺口挑选最多 3 条能够直接证明的 `parent-of`、`child-of`、`grandparent-of`、`grandchild-of`、`sibling-of` 或 `spouse-of` 关系。

结论：本轮没有安全候选，因此不修改 `src/data/claims.ts`。required kinship 缺口仍保留 110 项。新增的独立测试只验证边界，不把间接线索升级为亲属边。

## 逐项边界

| 候选 | 现有线索 | 保留原因 |
| --- | --- | --- |
| 呼韩邪单于—郅支单于 | 呼韩邪的人物 alias 是“郅支单于之兄”，来源为 `zizhi-tongjian`、`china-chronology` | 现有人物目录没有“郅支单于”这一人物端点，不能生成双方端点完整的 claim；不新增人物、不以 alias 单独扩展数据模型。 |
| 王审知—未具名兄长 | 王审知人物详情写“与兄长在福建经营军政资源”，来源为 `zizhi-tongjian` | 兄长没有姓名、人物 ID 或独立详情，无法满足双方端点要求；不能把“共同经营”改写成对某个虚构端点的 sibling-of。 |
| 魏桓子—魏文侯 | 两人同属魏氏政治承接链，现有详情只说明权力重组、承认和继承分期 | 同族、继承顺序和共同政权不足以直接证明亲等；当前审计继续拒绝父子或兄弟推断。 |
| 司马炎—司马睿 | 两人为司马氏皇室人物，现有 claim 仅使用 `related-to` | 跨代皇室关联没有现成的直接亲等证据，不能把 `related-to` 改写为 parent/grandparent/sibling。 |
| 高云—冯跋 | 两人均处于北燕形成与权力转换阶段，现有来源支持政权转换/对立，不支持亲属 | 同一政权、先后掌权或姓氏相近不是亲属直接证据；不新增 kinship 边。 |

## 验证

新增 `src/data/person-relationship-round106-kinship.test.ts`，验证：

- 上述候选没有 direct kinship claim；
- 呼韩邪 alias 指向的郅支人物端点不存在；
- 王审知详情中的兄长没有可用人物端点；
- 不产生任何 `round106` claim；
- required kinship 基线仍为 110，联盟/冲突仍为 73，事件参与仍为 10。

本轮没有新增关系，因而没有新增 claim 可单独调用 `validateClaims`；既有 claims 未被改写。未修改联盟、治理或遗产文件。
