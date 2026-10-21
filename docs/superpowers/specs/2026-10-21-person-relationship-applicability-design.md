# 人物关系类别适用性目录设计

## 目标

为 170 位人物的治理、亲属、联盟/对立、事件参与四类关系建立可审计的适用性目录，区分“必须补齐”“需要人工复核”和“经证据判断不适用”，避免把未知情况误标为不适用。

## 设计

`src/data/person-relationship-applicability.ts` 输出四类关系的逐人物目录。目录只保存适用性元数据、判断理由和证据 ID，不新增关系事实，也不修改 `claims.ts`、人物详情或 UI。默认目录由现有人物角色、事件参与目录和关系 claim 生成：无法安全判断时使用 `review`；只有角色语义与已有目录共同支持时使用 `not-applicable`。

`buildPersonRelationshipCoverageReport()` 默认消费该目录，同时保留测试和外部调用的显式覆盖参数。关系事实仍由现有 claims 与 event details 解析；报告增加适用性状态、真正待补项、待复核项和按类别覆盖率。`required` 缺失进入真正待补清单，`review` 缺失不伪装成已完成，`not-applicable` 不进入待补清单。

## 验收

- 目录覆盖全部 170 位人物和四类关系，每项状态只能是 `required`、`not-applicable` 或 `review`。
- 默认审计不依赖调用方手工传入适用性映射。
- 报告能分别列出 required 缺失、review 项和 not-applicable 项，并输出各类别覆盖率。
- 既有关系事实、`claims.ts`、UI 和人物详情组件不被修改。
- 专项测试、全量测试、构建和 `git diff --check` 通过。
