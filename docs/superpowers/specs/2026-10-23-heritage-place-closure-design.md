# 遗产地点关联与西明寺端点闭合设计

## 目标

在不修改 capital/city 数据、事件目录、人物关系或用户已有未提交文件的前提下，完成一次 heritage/place 边界审计：闭合唯一具备既有来源、现代地点参照和独立历史事件端点的遗产补全候选，并让遗产详情可以导航到其结构化地点。

## 当前边界

- `heritage-detail-coverage` 当前有 108 项遗产：103 项 complete，5 项 needs-review。
- 5 项待审项都残留共享事件 ID `xuanzang-translations`；它不是 `events` 目录中的已收录事件。
- `ximing-temple-site` 已有可解析的 `changan` 地点、已有来源，以及 `ximing-temple-built` 和 `xuanzang-at-ximing-658` 两个西明寺专属事件端点。
- `big-wild-goose-pagoda`、`qinglong-temple-site`、`xiao-yan-ta`、`xian-beilin` 没有同等闭合的既有专属事件端点，本轮不补。
- 西明寺现代位置仍是约址；本轮只确认其已有城市地点关联，不把约址升级为精确遗址坐标。

## 设计

### 数据闭合

在 `ximing-temple-site` 的 `associatedEvents` 中移除未收录的 `xuanzang-translations`，保留三个已有事件：

- `ximing-temple-built`
- `xuanzang-at-ximing-658`
- `tang-founded`

不新增或修改 `events.ts`、`event-details.ts`、人物数据、政权数据、capital/city 数据，也不删除其他四项遗产的共享待审关联。西明寺详情的不确定性说明继续明确“统一译经事件”尚未闭合，避免把专属阶段误写成覆盖五处遗产的统一事件。

### 地点交互

扩展 `HeritageDetail` 的导航目标为 `place | person | polity | event`，接收可选 `placeId`。详情头部在现代位置旁显示结构化历史地点按钮；点击后发出 `{ type: 'place', id: placeId }`，由现有 `EntityDrawer` 历史栈打开地点详情。`App` 从 `heritageById` 传入资产已有的 `placeId`，不复制或改写地点资料。

### Coverage 与测试

- 更新 coverage 期望：complete 从 103 增至 104，needs-review 从 5 减至 4；`ximing-temple-site` 不再有未解析事件。
- 增加回归断言，验证西明寺的地点存在、现代位置仍保留“约址”语义、专属事件均存在且来源可解析，并确认共享 `xuanzang-translations` 未被重新挂回。
- 增加详情交互测试，验证地点按钮导航到 `changan`。
- 保留既有阶段依据、来源完整性和四项未闭合候选的审计断言。

## 验收标准

1. 定向 heritage coverage、heritage detail、HeritageDetail 和相关集成测试通过。
2. `npm run build` 通过，确认导航类型和 App 传参一致。
3. 审计文档列出 1 个已闭合候选和 4 个明确不闭合边界，且写明未修改的范围。
4. 主 checkout 中已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 保持原样。
