# 人物关系证据可解释性审计（2026-10-23）

## 审计结论

本轮不新增、改写或推断任何人物关系事实。改进对象是 coverage/applicability 的证据表达：把已有证据 ID 结构化为证据类型与稳定 ID，并在 `PersonDetail` 的覆盖审计区展示。

这项改进不把同姓、同政权、同事件、角色、继承顺序或 contextual participant 记录升级为人物关系 claim。

## 证据类型边界

| 类型 | ID 形式 | 允许表达的含义 |
| --- | --- | --- |
| `claim` | `claim:<claimId>` | 已存在且端点可解析的关系 claim；不改变 predicate、年代、来源或置信度。 |
| `event-detail` | `event-detail:<eventId>` | 已存在事件详情中该人物的 `direct` participant 记录；不从 contextual participant 推导人物参与。 |
| `role` | `role:<personId>:<role>` | applicability 判断使用的人物角色依据；只说明“需要/不适用/待复核”的判断依据，不是关系事实。 |

现有 `evidenceIds` 字段保持兼容；新增结构化 `evidence` 字段，包含 `kind`、原始 `id` 和完整 `evidenceId`。coverage 的事件参与证据仍严格使用 direct participant 过滤；applicability 保留既有目录语义，并额外标记其 claim、event-detail 或 role 依据。

## UI 验收

`PersonDetail` 的“人物关系覆盖审计”区域现在对已有证据显示：

- `直接关系证据 · claim:<claimId>`；
- `事件详情参与证据 · event-detail:<eventId>`。

缺口、`not-applicable` 和 `review` 的状态语义未改变；没有证据时不渲染虚假的证据项。

## 验证

定向测试：

```text
npm test -- --run src/data/person-relationship-coverage.test.ts src/data/person-relationship-applicability.test.ts src/components/PersonDetail.test.tsx
```

结果：3 个测试文件、24 个测试通过。

本轮未编辑 `docs/audits/2026-10-20-short-gap-decisions.md`；该文件原有的未提交修改仍保留。未触碰 study-view、capital、heritage，也未新增关系 claim。
