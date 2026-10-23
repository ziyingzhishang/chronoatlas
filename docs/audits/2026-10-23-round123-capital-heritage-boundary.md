# Round 123 首都—遗产—城市视角边界审计

## 结论

本轮复核 round110—round122 已记录的首都相关候选。没有新增安全闭合项，因此不修改首都阶段、遗产事实、地点目录或其他未授权数据范围。

round122 已将 `dingding-gate-site` 从隋—洛阳残余中移出：605年营建端点、洛阳地点、隋东都阶段和现有来源均闭合；唐代沿用层仍保留。其余残余维持 15 条。长乐宫虽然已有独立营建端点，但遗产对象仍同时关联西汉与新朝，因此从“端点未闭合”转为“跨政权遗产”而不移出清单。其余残余均已具备可解析的地点、政权、年代和来源字段，但至少还有一个不能被这些字段替代的语义阻断：跨政权归属、城市考古叠压、约址、共享转折、重复事件或阶段不相等。

## 当前剩余清单

| 候选 | 类别 | 本轮不关闭原因 |
| --- | --- | --- |
| `chu-han-contention` → 秦—咸阳 | `shared-transition-event` | 同时连接秦与西汉，咸阳是秦亡与分封背景，不是秦专属首都事件端点。 |
| `changle-palace-site` → 西汉—长安 | `cross-polity-heritage` | `changle-palace-built` 已闭合营建端点，但遗产详情仍同时关联西汉与新朝，不能写入单一政权遗产链。 |
| `white-horse-temple` → 东汉—洛阳 | `cross-polity-heritage` | 遗产整体同时关联东汉与唐；68年创建事件不能代表今日建筑群全部为东汉原构。 |
| `white-horse-temple-founded` → 东汉—洛阳 | `heritage-event-not-polity-chain` | 创建事件已闭合，但“事件可导航”不等于完整遗产对象可归入单一政权。 |
| `taiji-palace-site`、`hanguang-gate-site`、`mingde-gate-site` → 隋—长安 | `layered-capital-heritage` | 隋唐宫城、城门和道路为连续叠压城市层，缺少隋专属遗产分期。 |
| `qianling` → 唐—长安 | `cross-polity-heritage` | 唐高宗与武则天合葬，遗产详情同时关联唐与武周。 |
| `ximing-temple-site` → 唐—长安 | `location-approximate` | 西明寺专属营建和玄奘阶段事件已存在，但现代位置仍为约址，统一 `xuanzang-translations` 端点仍未闭合。 |
| `court-moves-luoyang` → 唐—洛阳 | `shared-transition-event` | 事件同时关联唐与后梁，且表达长安—洛阳迁廷转折。 |
| `five-dynasties` → 后梁—开封 | `shared-transition-event` | 事件为唐—后梁共享转折；后梁已有专属建政端点，不能重复挂接。 |
| `kaifeng-northern-song-city-site` → 后周—开封 | `cross-stage-city-layer` | 遗产主体为960—1127年北宋东京层，后周951—960年仅在边界相接，不能倒灌归属。 |
| `zhou-eastward` → 东周—洛阳 | `foundation-stage-boundary` | 表达西周—东周王室迁徙和分期转换，不是独立东周建政/建都端点。 |
| `guzang-baita-temple-site` → 后凉—姑臧 | `cross-polity-heritage` | 遗产同时关联前凉、北凉、后凉；401—403年的时间交集不足以拆出后凉专属层。 |
| `song-founded` → 北宋—开封 | `duplicate-event-node` | 与已采用的 `northern-song-founded` 同为960年开封建宋语义，重复挂接会制造双重叙事。 |

## 证据边界

本轮测试确认每条残余的地点、政权、年代窗口和来源 ID 都能解析；这只能证明候选可审计，不能自动证明可以写入单一政权详情。后续只有取得独立的单体地点端点、与首都阶段相容的明确年代、直接来源和不重复的事实语义，才可移出清单。

不得将共享事件改写为单政权事件，不得把连续考古层拆成未经证明的朝代专属遗产，不得用遗产整体的创建传统替代现存建筑分期，也不得用同城和时间相交替代政权详情关联。

## 验证

- `src/data/capital-reference-round123-boundary.test.ts`
- 复用并核对 `src/data/capital-reference-round114.residual-categories.test.ts` 及 round110—round122 已有边界测试。
- 定向测试：round110—round118 首都/遗产边界测试、`shangyang-palace-events.test.ts`、本轮 round123 测试。
