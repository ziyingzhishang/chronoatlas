# 第109轮任务B：隋唐遗产候选复核

## 复核范围

本轮只处理以下9项首都阶段遗产候选：

- 隋—长安：`taiji-palace-site`、`hanguang-gate-site`、`mingde-gate-site`
- 隋—洛阳：`dingding-gate-site`
- 唐—长安：`big-wild-goose-pagoda`、`qianling`、`ximing-temple-site`、`huaqing-palace`
- 唐—洛阳：`shangyang-palace-site`

安全闭合必须同时满足：单一政权归属、明确地点、明确年代、资产与详情来源可解析。本轮最多闭合1项；不把隋唐叠压遗址或武周／唐共享遗产拆成未经证实的单政权事实。

## 本轮安全闭合（1项）

### 唐—长安—大雁塔

闭合 `big-wild-goose-pagoda` → 唐政权详情的遗产引用。

- 单一政权归属：遗产详情 `associatedPolities` 严格为 `['tang']`，没有把武周或其他政权写入该遗产归属。
- 地点端点：遗产资产和详情均指向 `changan`，详情现代位置明确为今西安市雁塔区大慈恩寺内。
- 年代端点：资产始建年为652年，详情原建筑阶段从652年开始；唐长安首都阶段为618—907年，年代相交。
- 来源端点：资产、详情的来源 ID 均能在来源表解析；本次使用来源验证遗产—地点—年代链，不把未解析的玄奘译经事件当作闭合条件。
- 变更：将 `big-wild-goose-pagoda` 补入唐政权详情 `heritageIds`。

大雁塔详情仍保留 `xuanzang-translations` 关联及待核说明。该事件端点缺少统一起止年代、阶段链和覆盖五处遗产的独立来源，本轮不新增事件，也不以建筑年代替代译经事件。

## 其余8项：增强边界并保留待核

| 候选 | 暂不闭合原因 |
|---|---|
| `taiji-palace-site` | 详情同时关联隋、唐，且为隋唐宫城叠压层，不能整体归入隋。 |
| `hanguang-gate-site` | 详情年代覆盖隋唐，缺少只属于隋的独立遗产层。 |
| `mingde-gate-site` | 城门遗址是隋唐城市轴线延续层，不能据唐代称谓反推隋专属事实。 |
| `dingding-gate-site` | 605—907年跨隋、唐，属于叠压城址，不能拆出未经证实的隋专属层。 |
| `qianling` | 乾陵同时关联唐与武周，不能直接归入唐单一政权。 |
| `ximing-temple-site` | 具体位置为约址，且译经事件端点未解析，证据不足以闭合。 |
| `huaqing-palace` | 关中宫苑为多时期叠合空间，不能仅据唐代年代和长安关联认定为首都专属建筑。 |
| `shangyang-palace-site` | 同时关联唐与武周，不能未经分期拆分后归入唐。 |

回归测试：`src/data/heritage-reference-round109-task-b.test.ts`。同时收紧第107轮隋唐候选断言，确保大雁塔闭合后不再作为未处理候选出现。
