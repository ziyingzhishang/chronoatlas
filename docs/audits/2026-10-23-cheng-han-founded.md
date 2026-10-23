# 成汉 `cheng-han-founded` 时间节点升级审计

## 结论

本轮仅升级 `cheng-han-founded` 及其直接相关的来源、详情、时间复核、覆盖测试和边界审计。

- 304 年明确建模为李雄即成都王位、成汉政权形成的单年节点。
- 306 年称帝保留为详情中的后续阶段，不回填为 304 年事件。
- 304 年的单年节点只表达成都政治中心与政权形成，不推断李雄在当年已经控制整个巴蜀。

## 依据

《资治通鉴》卷八十五·晋纪七记载：304 年十月李雄即成都王位，大赦、改元并设置官属；同卷将 306 年称帝作为后续阶段处理。项目新增来源 `zizhi-tongjian-vol85-cheng-han`，与原有 `zizhi-tongjian`、`china-chronology` 并列绑定到事件及详情。

## 覆盖影响

`cheng-han-founded` 的 `datePrecision` 从 `approximate` 升为 `year`，`verification` 从 `partial` 升为 `checked`，时间复核策略从 `approximate-marker` 改为 `year-marker`。因此事件详情覆盖统计由 `covered: 96 / needs-review: 25` 更新为 `covered: 97 / needs-review: 24`；时间复核状态由 `confirmed: 4 / approximate: 20` 更新为 `confirmed: 5 / approximate: 19`。

## 边界与未决事项

304 年节点不提供逐年疆域几何，也不证明整个巴蜀在同年完成直接控制。304—305 年草创期、306 年称帝及其后州郡整合仍在详情阶段中分开表达；相关短缺边界决策文档保持不变。
