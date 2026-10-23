# 遗产地点关联与端点闭合审计

## 结论

本轮在 heritage/place 范围内安全闭合 1 项：`ximing-temple-site`。其遗产详情已有可解析的 `changan` 地点关联、现代位置约址说明、专属来源和两个专属阶段端点：`ximing-temple-built`（656年营建）与 `xuanzang-at-ximing-658`（658—659年玄奘西明寺阶段）。详情保留 `tang-founded` 作为唐代背景事件，但移除未收录的共享事件 ID `xuanzang-translations`。

这不是新增统一玄奘译经事件，也不是把西明寺约址升级为精确坐标。详情不确定性继续说明：跨五处遗产的统一译经事件端点尚未闭合，因此不挂接到西明寺详情。

## Coverage 变化

- 遗产总数：108 项，保持不变。
- complete：103 → 104。
- needs-review：5 → 4。
- data-missing：0，保持不变。
- 来源完整率：108/108，保持不变。

剩余 needs-review 为：

| 遗产 | 保留原因 |
| --- | --- |
| `big-wild-goose-pagoda` | 仍只有跨遗产的 `xuanzang-translations` 待核关联，缺少大雁塔专属译经阶段端点。 |
| `qinglong-temple-site` | 仍只有跨遗产的 `xuanzang-translations` 待核关联，不能以寺院交流传统推断专属事件。 |
| `xian-beilin` | 碑刻迁置和编次是跨时段收藏史，不能用玄奘或唐代背景事件替代碑林专属端点。 |
| `xiao-yan-ta` | 小雁塔始建与后世修缮已有阶段资料，但没有现有的、可直接闭合其专属事件的端点。 |

## 地点详情交互

遗产详情现在读取资产已有的 `placeId`，在现代位置旁显示结构化地点入口。点击后复用实体详情历史栈打开地点详情，例如西明寺进入 `changan`。地点资料本身未修改；约址、不确定性和现代城市参照仍按原数据展示。

## 未修改范围

- 未修改 `capital-*`、`city-*` 数据或相关 coverage。
- 未修改 `events.ts`、`event-details.ts`、人物数据、人物关系或政权关系。
- 未新增事件、人物、来源或地点记录。
- 未修改主 checkout 中用户已有的未提交文件 `docs/audits/2026-10-20-short-gap-decisions.md`。

## 验证

- RED：先验证 coverage 统计、西明寺共享事件移除和地点按钮测试均按预期失败。
- GREEN：`src/data/heritage-detail-coverage.test.ts`、`src/data/heritage-details.integration.test.ts`、`src/components/HeritageDetail.test.tsx`、`src/components/EntityDrawer.test.tsx` 定向测试通过。
- 追加验证：heritage/place 相关集成测试、App 集成测试、构建和 `git diff --check`。
