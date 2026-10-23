# Round 124 首都／城市视角安全闭合边界审计

日期：2026-10-23

范围：`capitalHistory`、城市研究视图所需的地点／事件／遗产端点、政权详情关联和现有来源解析；不修改人物关系、事件详情、遗产事实、地点事实或政权事实主文件。

## 当前覆盖基线

| 审计项 | 当前结果 | 依据 |
| --- | ---: | --- |
| 首都政权目录 | 87 | `getCapitalCoverageReport()` |
| 首都合格政权 | 79 | 当前首都覆盖测试与第十六轮复核 |
| 首都证据边界 | 8 | 匈奴、吐谷浑、夏（约年）、商、西秦、北元、南明、突厥 |
| 政权详情覆盖 | 87/87 | `buildPolityDetailCoverageReport()` |
| round123 后城市／首都残余 | 15 | `capital-reference-round123-boundary.test.ts` |

## 本轮结论

没有发现最多 3 个可安全补全的候选。

15 项残余都已经具备可解析的来源、时间窗口、地点端点和政权端点；但“字段齐全”尚不足以证明可以写入单一政权详情。round124 新增测试要求每项同时通过端点解析和语义边界检查，结果为 15 项全部保留、0 项进入安全闭合集合。

本轮因此不修改 `capital-history.ts`、`polity-details.ts`、`events.ts`、`event-details.ts`、`heritage.ts`、`heritage-details.ts`、`places.ts`、人物关系或任何事件详情主文件。

## 精确边界清单

| 候选 | 分类 | 不关闭原因 |
| --- | --- | --- |
| `qin|xianyang|chu-han-contention|` | `shared-transition-event` | 事件同时连接秦与西汉，咸阳是秦亡、分封和楚汉竞争的共享转折，不是秦专属首都事件。 |
| `han_western|changan||changle-palace-site` | `cross-polity-heritage` | 长乐宫遗产详情同时关联西汉与新朝；前200年建成端点不能抹去跨政权沿用。 |
| `han_eastern|luoyang||white-horse-temple` | `cross-polity-heritage` | 白马寺遗产详情同时关联东汉与唐，今日建筑群经历后世重建，不能归入东汉单一遗产链。 |
| `han_eastern|luoyang|white-horse-temple-founded|` | `heritage-event-not-polity-chain` | 68年创建事件本身是东汉端点，但创建事件可导航不等于现存遗产整体只属于东汉。 |
| `sui|changan||taiji-palace-site` | `layered-capital-heritage` | 太极宫详情同时关联隋唐，宫城遗址是连续叠压城市层，缺少隋专属遗产分期。 |
| `sui|changan||hanguang-gate-site` | `layered-capital-heritage` | 含光门详情同时关联隋唐，门址和道路层不能由隋首都阶段单独切出。 |
| `sui|changan||mingde-gate-site` | `layered-capital-heritage` | 明德门详情同时关联隋唐，现有门址与展示资料不足以形成隋专属端点。 |
| `tang|changan||qianling` | `cross-polity-heritage` | 乾陵为唐高宗与武则天合葬陵墓，遗产详情跨唐与武周。 |
| `tang|changan||ximing-temple-site` | `location-approximate` | 西明寺具体现代位置仍标为约址；专属营建和玄奘阶段已有，但不能以单寺院端点替代待核的统一译经事件。 |
| `tang|luoyang|court-moves-luoyang|` | `shared-transition-event` | 904年迁廷事件同时连接唐与后梁，且是长安—洛阳转折，不是唐单一首都详情专属事件。 |
| `liang_later|kaifeng|five-dynasties|` | `shared-transition-event` | 五代转折事件同时连接唐与后梁；后梁已有独立建政端点，重复挂接会混淆阶段。 |
| `zhou_later|kaifeng||kaifeng-northern-song-city-site` | `cross-stage-city-layer` | 遗产主体是960—1127年北宋东京城市层，后周阶段只在边界相接，不能倒灌归入后周遗产列表。 |
| `zhou_eastern|luoyang|zhou-eastward|` | `foundation-stage-boundary` | 事件同时连接西周与东周，表达王室东迁和分期转换，不是东周独立建政或建都端点。 |
| `later_liang|guzang||guzang-baita-temple-site` | `cross-polity-heritage` | 白塔寺详情同时关联前凉、北凉、后凉，401—439年遗产层与386—403年后凉阶段不能按同城关系切分。 |
| `song_northern|kaifeng|song-founded|` | `duplicate-event-node` | 与已采用的 `northern-song-founded` 同为960年开封建宋语义；重复挂接会制造双重规范事件。 |

## 允许未来关闭的条件

仅当新增或核实的材料同时提供以下全部条件，才可把残余移入单一政权详情：

1. 独立且可解析的来源 ID，直接支持该条事实，而不是只支持同城或同一时代背景。
2. 与首都阶段相容的明确起止年代，且能说明是营建、使用、迁都、建政或其他具体语义。
3. 明确地点端点，不能以代理坐标、约址或现代行政区替代精确地点结论。
4. 明确且不冲突的政权归属；跨政权遗产必须先有可独立分期的政权层。
5. 不与既有规范事件重复，也不把共享转折、城市叠压或遗产整体误写成单一政权事实。

## 验证

```bash
npm test -- --run src/data/capital-city-round124-boundary.test.ts
npm test -- --run src/data/capital-reference-round123-boundary.test.ts src/data/capital-coverage.test.ts src/data/polity-detail-global-coverage.test.ts src/data/city-perspective-round103.audit.test.ts
npm run audit:coverage
```

round124 定向测试结果：2 tests passed；当前覆盖审计命令仍输出 87 个政权、90 条覆盖决策及既有决策摘要哈希。工作树已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 改动未纳入本轮。
