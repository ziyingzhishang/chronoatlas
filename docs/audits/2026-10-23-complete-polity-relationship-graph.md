# 完整政权关系图谱增强审计

## 实施计划

目标：在不修改 `claims` 事实数据、不把详情关联伪装成本年事实的前提下，让政权详情明确引用的人物、事件、遗产及其已登记关系进入 `PolityStudyView` 与 `RelationshipGraph`。

范围：

- 生产代码：`src/domain/study-view.ts`、`src/components/RelationshipGraph.tsx`
- 测试：`src/domain/study-view.test.ts`、`src/components/RelationshipGraph.test.tsx`
- 本审计文档
- 不修改 `src/data/claims.ts` 或其他用户文件

语义契约：

- `PolityStudyView.claims` 仍只表示选定年份的当前事实。
- `PolityStudyView.detailLinkedClaims` 只解析 `PolityDetail.claimIds` 指向的既有 claim；它们不自动进入当前事实集合。
- `detailLinkedPeople`、`detailLinkedEvents`、`detailLinkedTransitionEvents`、`detailLinkedHeritage` 是详情导航上下文；详情明确引用不会因选定年份而消失。
- 关系图节点使用当前事实实体与详情关联实体的并集；关系边使用当前事实 claims 与详情 claims 的并集，并逐边标记 `current-fact` 或 `detail-linked`。
- 有 claim 的详情关联/非本年事实必须在 SVG 边和文本关系按钮中显式展示；没有 claim 的详情实体必须在图谱节点与独立清单中显式展示；不得由详情关联改写当前事实、政权归属或 claim 年代。
- `eventDetails.polityIds` 对事件归属的显式排除继续有效；过渡事件仍为详情关联上下文，不升级为本年事实。

TDD 证据：

- RED：定向运行 `src/domain/study-view.test.ts` 与 `src/components/RelationshipGraph.test.tsx`，新增断言失败，旧测试保持通过。

## 审计结果

已完成的变更文件：

- `src/domain/study-view.ts`：增加 `detailLinkedClaims`；详情遗产不再因当前年份的建设窗口被丢弃；当前事实 claims 与事件边界保持原规则。
- `src/components/RelationshipGraph.tsx`：合并当前事实和详情关联节点；合并当前事实与详情 claims；为关系边和文本按钮增加 `本年事实`／`详情关联／非本年事实` 标记；为无 claim 的详情实体增加独立的详情关联清单和导航入口。
- `src/domain/study-view.test.ts`、`src/components/RelationshipGraph.test.tsx`：覆盖非本年详情人物、事件、遗产、详情 claim、去重及语义标记。
- `src/data/polity-detail-round110-learning.integration.test.ts`：将详情遗产的审计结果更新为 111 个可学习详情入口、5 个仍受事件证据边界约束的引用。
- `docs/audits/2026-10-23-round110-polity-study-view-integration.md`：同步详情遗产边界和统计。

验证结果：

- 定向测试：4 个文件、30 tests passed。
- `npx tsc -b`：通过。
- `npm run build`：通过；Vite 仅报告既有的大 chunk warning。
- 全量测试：292/297 个测试文件通过，954/965 个测试通过；剩余 5 个文件的 11 个失败集中在 App／地图集成、语言集成和几何完整性测试的超时或时序失败，本次影响面的 4 个定向测试文件均通过。
- `git diff --check`：通过。
- `src/data/claims.ts`：无 diff；本轮没有新增、删除或修改 claim 事实数据。
- 用户已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 修改及其他非本轮文件未触碰。

语义边界：

1. `view.claims` 仍是截至所选年份的当前事实；`view.detailLinkedClaims` 是详情显式 `claimIds` 的独立上下文集合。
2. 详情 claim 即使有效年代早于所选年，也只显示为 `详情关联／非本年事实`，不会被回填为当前事实。
3. 详情人物、事件、过渡事件和遗产可作为图谱节点和文本入口存在；遗产不因当前年份过滤而消失，但不因此获得当前年份归属。
4. `eventDetails.polityIds` 的显式排除和过渡事件边界不被绕过；缺少独立 claim 的详情实体只进入明确标注的详情关联清单，不生成伪造的事实 claim。
