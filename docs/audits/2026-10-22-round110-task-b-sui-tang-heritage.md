# 第110轮任务B：隋唐首都遗产候选复核

## 复核范围

本轮只处理以下8项首都阶段遗产候选：

- 隋—长安：`taiji-palace-site`、`hanguang-gate-site`、`mingde-gate-site`
- 隋—洛阳：`dingding-gate-site`
- 唐—长安：`qianling`、`ximing-temple-site`、`huaqing-palace`
- 唐—洛阳：`shangyang-palace-site`

安全闭合必须同时满足：单一政权归属、明确地点、明确年代、资产与详情来源可解析，并且不能以叠压层、共享政权或未解析事件端点替代分期证据。本轮最多闭合1项。

## 安全闭合（1项）

### 唐—长安—华清宫

闭合 `huaqing-palace` → 唐政权详情的遗产引用。

- 单一政权归属：遗产详情 `associatedPolities` 为 `['tang']`，没有把隋或武周写入该遗产的政权归属。
- 地点端点：资产指向 `changan`；详情定位为今西安市临潼区骊山北麓，并明确说明其位于古长安城以东。
- 年代端点：资产始建年为618年，详情原建筑阶段为618—907年；唐长安首都阶段为618—907年，时间相交。
- 来源端点：资产与详情的来源 ID 均能在来源表解析。
- 变更：将 `huaqing-palace` 补入唐政权详情 `heritageIds`。

本次闭合表达的是唐长安政治中心关联下的关中宫苑遗产观察点，不宣称华清宫现存景区建筑为唐代原构，也不抹平历代重建与叠合层。

## 其余7项：保留边界审计

| 候选 | 暂不闭合原因 |
|---|---|
| `taiji-palace-site` | 详情同时关联隋、唐，是隋唐宫城叠压层，不能整体归入隋。 |
| `hanguang-gate-site` | 年代覆盖隋唐，缺少只属于隋的独立遗产层。 |
| `mingde-gate-site` | 城门遗址属于隋唐城市轴线延续层，不能据城门名称反推隋专属事实。 |
| `dingding-gate-site` | 605—907年跨隋、唐，属于叠压城址，不能拆出未经证实的隋专属层。 |
| `qianling` | 乾陵同时关联唐与武周，不能直接归入唐单一政权。 |
| `ximing-temple-site` | 遗产详情已由专属事件端点闭合为 `complete`；具体位置仍为约址，且 `xuanzang-translations` 统一事件端点仍未解析，不能用建筑年代替代译经事件证据。 |
| `shangyang-palace-site` | 同时跨唐与武周，不能未经分期拆分后归入唐。 |

回归测试：`src/data/heritage-reference-round110-task-b.test.ts`。测试同时验证华清宫的地点、年代、政权归属和来源可解析性，并防止其余7项被强行纳入隋或唐的单政权遗产列表。
