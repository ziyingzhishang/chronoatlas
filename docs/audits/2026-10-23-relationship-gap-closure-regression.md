# 关系缺口闭环的证据与回归验收（2026-10-23）

## 当前结论

本审计读取当前工作树，不把历史审计快照直接当作当前状态。此前 round123 快照列出的 17 个“缺少明确人物—政权关系”目标，目前均已在 `auditPolityCoverage()` 中出现可解析的 `founded` 或 `ruled` 关系，因此当前开放集合为 0。

南凉的关联人物缺口也已关闭：人物目录包含 `tufa-wugu`，其 `polityIds` 包含 `southern_liang`，并有带来源、397 年有效区间的 `founded` claim 与人物详情。

此前涉及 7 个政权的目录外关联事件引用，目前在 `auditPolityCoverage()` 与 `buildPolityDetailCoverageReport()` 中均未再产生 unresolved event reference。该结论只表示当前 ID 可解析，不替代事件史实、年代精度和来源质量复核。

## 17 个关系目标

下表是本轮回归审计的固定目标集合。它固定的是“需要持续检查的范围”，不是把关系无证据地标为完成；测试会逐项检查人物端点、政权端点、关系语义、来源和有效年代，并在审计器仍报告缺口时失败并列出政权 ID。

| 政权 ID | 政权 | 当前证据关系 |
| --- | --- | --- |
| `chu_warring` | 楚 | `chu-we-wang` → `ruled` |
| `yan_warring` | 燕 | `yan-zhaowang` → `ruled` |
| `qi_warring` | 齐 | `qi-we-wang` → `ruled` |
| `qin` | 秦 | `qin-shi-huang` → `ruled` |
| `han_eastern` | 东汉 | `liu-xiu` → `ruled` |
| `wei_three` | 魏 | `cao-cao` → `ruled` |
| `shu_three` | 蜀汉 | `liu-bei` → `ruled` |
| `former_qin` | 前秦 | `fu-jian` → `ruled` |
| `tang_later` | 后唐 | `li-cunxu` → `ruled` |
| `tuyuhun` | 吐谷浑 | `murong-tuyuhun` → `ruled` |
| `turkic` | 突厥 | `asina-tumen` → `ruled` |
| `wu_zhou` | 武周 | `wu-zhao` → `ruled` |
| `later_liang` | 后凉 | `lv-guang` → `ruled` |
| `southern_liang` | 南凉 | `tufa-wugu` → `founded` |
| `western_liang` | 西凉 | `li-hao` → `ruled` |
| `yuan` | 元 | `kublai` → `ruled` |
| `jingnan` | 荆南 | `gao-jixing` → `ruled` |

### 南凉边界

南凉不能再使用南梁萧衍作为本政权人物端点。当前闭环使用秃发乌孤；397 年是政权形成节点，人物个人任期只记录到 399 年。南凉后续的秃发利鹿孤、秃发傉檀及 414 年覆亡不由本条关系自动推导。

南凉政权详情已同步使用 `tufa-wugu` 作为 `principalFigureIds`，并将 claim 入口切换为南凉自身的建政关系；不再把南梁萧衍作为南凉详情人物端点。

## 目录外事件引用

当前结果：

- `auditPolityCoverage()` 的 `unresolved-event-reference` 为 0；
- `buildPolityDetailCoverageReport()` 的 `unresolvedReferenceIds.events` 全部为空；
- 政权详情覆盖率仍为 87/87，且没有详情与知识覆盖状态不一致。

这项回归仍保留在测试中，防止后续新增城市史、政权阶段或长安事件时再次写入目录外 ID。既有 fixture 测试还会验证审计器对人为构造的 missing event 能明确报错，因此“当前为 0”不等于删除了检测能力。

## 详情抽屉导航核查

本轮未修改组件。现有通用行为已经覆盖关系导航：

- `PersonDetail` 的人物—政权关系通过 `onOpenEntity({ type: 'polity', id })` 打开政权详情；
- `PolityDetail` 的主要人物与事件关联通过同一回调打开人物/事件详情；
- `RelationshipGraph` 的文本关系项和 SVG 节点均能导航到人物或政权。

相关现有测试已在本轮一起运行：`PersonDetail.test.tsx`、`PolityDetail.test.tsx`、`RelationshipGraph.test.tsx`。由于通用行为已覆盖，本轮只新增数据审计回归，不重复增加 UI 测试。

## 回归入口

- 新增：`src/data/relationship-gap-closure.audit.test.ts`
- 既有目录外事件闭环：`src/data/polity-coverage-changan-related-events.test.ts`
- 审计实现：`src/data/polity-coverage.ts`、`src/data/polity-detail-coverage.ts`

本任务没有修改 `claims.ts`、`events.ts` 或 `event-details.ts`；当前工作树中这些文件若存在其他未提交改动，均不属于本审计文件的变更。
