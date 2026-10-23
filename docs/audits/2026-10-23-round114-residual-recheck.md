# 第114轮首都残余复核：证据边界与不可安全关闭项

## 结论

本轮按当前工作树复核 `src/data/capital-reference-round114.residual-categories.test.ts` 生成的 15 项残余。没有一项同时满足“可归入单一政权详情链、地点与年代相容、现有来源可解释、且不会重复已有规范事件或压缩跨政权遗产”的安全关闭条件，因此本轮不修改 `polity-details.ts`、`events.ts`、`event-details.ts`、`heritage.ts` 或 `heritage-details.ts`。

需要区分两种状态：

- `changle-palace-built`、`ximing-temple-built`、`xuanzang-at-ximing-658`、`white-horse-temple-founded` 等独立端点已经存在，说明相应的事件证据得到细化；
- 但独立端点存在，不等于可以把完整遗产对象写入单一政权的 `heritageIds`，也不等于可以把共享节点改造成单一政权的首都事件。

## 重点复核

| 候选 | 当前证据 | 是否关闭 | 边界 |
| --- | --- | --- | --- |
| `song-founded` | 与 `northern-song-founded` 同为960年、开封、赵匡胤建宋；北宋详情已使用 `northern-song-founded` | 否 | `song-founded` 是重复节点。新增到北宋详情会制造重复叙事；保留规范节点即可 |
| `white-horse-temple` | 有 `white-horse-temple-founded`（68年）独立创建端点；遗产详情仍关联 `han_eastern`、`tang`，并明确今日建筑为历代重建叠合 | 否 | 创建传统可单独建模，但不能把现存遗产整体归入东汉；事件闭合不等于遗产链闭合 |
| `qianling` | 遗产详情关联 `tang`、`wu_zhou`；乾陵为唐高宗与武则天合葬陵 | 否 | 同址、684年年代相交和唐代首都阶段不足以抹平唐/武周双重归属 |
| `guzang-baita-temple-site` | 遗产详情关联 `former_liang`、`northern_liang`、`later_liang`，主要阶段401—439年 | 否 | 后凉姑臧阶段的时间交集不能拆出后凉专属遗产层；需新的考古分层或独立文献端点 |
| `changle-palace-site` | `changle-palace-built` 已记录前202年启动、前200年建成，详情来源含《史记·高祖本纪》；遗产仍关联 `han_western`、`xin` | 否（遗产链） | 营建端点已闭合，但跨政权遗产不能因端点存在而写入西汉 `heritageIds` |

## 其余残余分类

| 候选 | 分类 | 本轮判断 |
| --- | --- | --- |
| `chu-han-contention` | `shared-transition-event` | 同时关联秦、西汉，咸阳只是秦亡—分封—战争背景，不能改写为秦专属首都端点 |
| `taiji-palace-site` | `layered-capital-heritage` | 隋唐宫城叠压层，不能整体归入隋或唐 |
| `hanguang-gate-site` | `layered-capital-heritage` | 隋唐连续城门与道路层，缺少单一政权的独立遗产分期 |
| `mingde-gate-site` | `layered-capital-heritage` | 城门位置和年代重合不能证明隋专属层 |
| `ximing-temple-site` | `location-approximate` | 西明寺营建和玄奘阶段端点已拆分，但现代位置仍为约址，不能合并成覆盖多寺院的统一译经事件 |
| `court-moves-luoyang` | `shared-transition-event` | 同时关联唐、后梁且含长安—洛阳迁廷转折，不是唐单一首都端点 |
| `kaifeng-northern-song-city-site` | `cross-stage-city-layer` | 遗产主体为960—1127年北宋东京层，不能以开封同址和960年边界倒灌后周 |
| `zhou-eastward` | `foundation-stage-boundary` | 同时关联西周、东周，表达王室东迁和分期转换，不是独立东周建政端点 |
| `later_liang|guzang-baita-temple-site` | `cross-polity-heritage` | 与前凉、北凉共享的遗产层，后凉时段交集不足以完成单政权归属 |

## 基线数量说明

当前 round114 测试的生成集合是 15 项，其中 `layered-capital-heritage` 实际为三项：太极宫、含光门、明德门。历史 round114 审计文档的表格曾把该分类写为四项并称候选总数16；本复核以当前未修改的 round114 基线测试为准，不修改该基线文件，也不把数量差异当作新增史实证据。

## 判定门槛

后续只有在新增证据同时提供以下内容时，才可从残余集合安全关闭：

1. 遗产对象或事件对象的专属地点端点，而不是城市同址；
2. 明确的营建、迁都或政权行为年代，且与首都阶段相容；
3. 独立来源与详情端点互相指向；
4. 不与已有规范事件重复；
5. 不把跨政权、跨阶段或连续城市考古层压缩成单一政权事实。

本轮验证的长乐宫、西明寺和白马寺结果表明，补齐事件端点后仍必须单独审查遗产归属；两者不能互相替代。

## 验证

- `src/data/capital-reference-round114.residual-categories.test.ts`
- `src/data/capital-reference-round112-han.test.ts`
- `src/data/capital-reference-round112-task-b-sui-tang.test.ts`
- `src/data/capital-reference-round111.task-c.test.ts`
- `src/data/heritage-event-round106-xuanzang-boundary.test.ts`
- `src/data/event-details-round91-batch.test.ts`

以上针对性测试共 5 个测试文件、13 个测试通过。
