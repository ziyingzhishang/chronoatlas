# RelationshipGraph 分类展示设计

## 目标

增强政权视角的 `RelationshipGraph`，让同一组既有 `HistoricalClaim` 以治理/君臣、亲属、联盟与对立、事件参与、遗产关联五类展示；边和文本清单都显示方向、关系类型、有效年代、时间精度与来源可用状态，同时保留实体详情抽屉和键盘访问。

## 设计

- 在组件内部建立纯函数关系展示模型，不改变 `claims` 数据和 `HistoricalClaim` 类型。
- 分类映射复用现有关系分类语义：`served`、`appointed`、`succeeded`、`ruled` 属于治理/君臣；`parent-of`、`child-of`、`sibling-of`、`spouse-of` 属于亲属；`ally-of`、`enemy-of` 属于联盟与对立；`participated-in` 属于事件参与；`left-heritage`、`commissioned` 属于遗产关联。其余 predicate 不进入本图。
- 方向始终按 claim 的 `subject → object` 显示；时间格式保留缺失字段，不把未知时间推成精确年份。来源可用状态由 `sourceNotes` 的实际 ID 解析，分为“有来源”和“来源待解析”。
- SVG 边使用可访问的文本等价信息，文本清单按五类分组；节点和清单按钮仍调用现有 `onOpenEntity`，节点保留 Enter/Space 键盘激活。
- 所有新增界面词汇走现有 `t()` i18n 入口，并为英文词典补齐对应词条。

## 验证

- 纯展示模型测试覆盖五类、方向、时间精度、来源可用状态和未知 predicate 过滤。
- React 测试覆盖分组呈现、边/文本元信息、节点键盘打开、清单点击打开。
- 运行定向测试、全量测试、生产构建和 `git diff --check`。
