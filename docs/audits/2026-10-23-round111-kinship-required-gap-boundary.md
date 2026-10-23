# Round 111 kinship required-gap boundary audit

## Scope and result

本轮只审计当前 `kinship` category 的 required gaps。审计前 required kinship 缺口为 110；本轮未发现同时满足以下条件的安全候选，因此不修改 `claims` 或其他生产关系数据：

1. 双方人物端点均能解析到 `people` 中的明确人物 ID；
2. 来源文字表达的是直接亲属关系，并且能映射到当前模型支持的直接 kinship predicate：`parent-of`、`child-of`、`grandparent-of`、`grandchild-of`、`sibling-of`、`spouse-of`；
3. 关系时间范围自洽，且与双方人物年代相容；
4. 关系 claim 的来源 ID 可解析，并且双方人物至少共享一个可解析来源；
5. 不依赖未命名人物、同政权/同姓/继承关系、泛化的 `related-to`，或把不支持的亲属级别压缩成错误的直接 predicate。

本轮新增精确边界测试，锁定缺口基线仍为 110，并覆盖以下拒绝理由。结论为：安全补全候选 0 条，生产 claims 变更 0 项。

## Audited boundaries

| 人物端点 | 可核验事实 | 结论 |
| --- | --- | --- |
| 王审知（`wang-shenzhi`）—其未命名兄长 | 人物材料只出现“兄长”语义；`wang-chao` 不是可解析人物端点。 | 拒绝：缺少明确双方人物端点。 |
| 呼韩邪（`huhanye`）—郅支单于 | `huhanye` 的别名含“郅支单于之兄”；`zhizhi-chanyu` 不是可解析人物端点。 | 拒绝：别名不能替代缺失的人物端点。 |
| 陈顼（`chen-xu`）—陈霸先（`chen-baxian`） | 双方端点存在，关系 claim 的时间范围为 530–559，且人物共享可解析来源 `zizhi-tongjian`；现有关系 predicate 是 `related-to`，注释明确保留泛关系以避免指定亲等。 | 拒绝：语义未达到当前直接 kinship predicate 的精度。 |
| 慕容超（`murong-chao`）—慕容德（`murong-de`） | 双方端点存在，现有关系 claim 覆盖 405–410，来源 `zizhi-tongjian` 与 `china-chronology` 可解析且双方共享；注释提及“侄辈”，但模型没有 `uncle-of`/`nephew-of` predicate。 | 拒绝：不能把未被当前 predicate 集合精确表达的级别臆改为 `child-of`、`sibling-of` 等错误关系。 |
| 乞伏乾归（`qifu-gangui`）—乞伏国仁（`qifu-guoren`） | 双方端点存在，现有关系 claim 覆盖 388–412，来源 `zizhi-tongjian` 与 `china-chronology` 可解析且双方共享；注释只表达早期部族亲属/继承语境，未分层到具体亲等。 | 拒绝：泛化 `related-to` 与继承语义不足以安全生成直接 kinship edge。 |

## Guardrail

测试文件 `src/data/person-relationship-round111-kinship-boundary.test.ts` 断言：

- required kinship 缺口维持 110；
- 未命名端点不会生成直接 kinship edge；
- 已命名但仍为泛关系或不受支持的亲属语义不会被升级为直接 kinship；
- 关系时间范围有效、来源 ID 可解析，并且每个审计关系至少使用双方共享来源中的一个。

因此本轮只新增 kinship 边界测试与本审计文档，没有修改 alliance、governance、event participation，亦未触碰用户已有未提交文件。
