# 第111轮任务 C：跨政权首都候选复核

本轮复核 8 项候选：楚都寿春城址、秦楚汉争、唐洛阳行幸、后梁五代转折、后周开封城市层、东周东迁、后凉姑臧白塔寺、北宋建政节点。

执行边界：默认保守；最多闭合 1 项。只有现有数据已经同时具备政权归属、地点、年代、首都阶段和可解析来源，并且端点语义不与其他政权或既有事件重复时，才补入政权详情。共享事件、重复事件、跨政权遗产和跨阶段城市层只增强审计，不新造事实。

## 本轮闭合

### 楚—寿春—楚都寿春城址历史层

`chu-shouchun-city-site` 满足以下闭环：

- 遗产目录端点明确指向 `shouchun`，年代为前278—前223年；
- 遗产详情的 `associatedPolities` 只有 `chu_warring`，不是跨政权共享节点；
- 详情已有楚国晚期迁都寿春的历史分期、楚国人物与来源字段；
- `capitalHistory` 中楚战国政权的寿春阶段同为前278—前223年，年代重合；
- 资产和详情来源 ID 均可解析。

因此将 `chu-shouchun-city-site` 补入楚战国政权详情。该关联表达的是楚晚期寿春都城的城市历史层，不声称现存古城建筑是战国楚王宫原构，也不把前403年的楚战国分期事件改写成寿春迁都事件。

## 保留审计边界的 7 项

| 候选 | 现有阻断证据 | 分类 | 本轮处理 |
| --- | --- | --- | --- |
| 秦—楚汉之争 | `chu-han-contention` 同时关联秦与西汉，咸阳只是秦亡与分封背景，不能作为秦首都专属端点 | `shared-transition-event` | 不补入秦事件链 |
| 唐—洛阳行幸 | `court-moves-luoyang` 同时关联唐、后梁，并涉及长安—洛阳迁廷 | `shared-transition-event` | 不补入唐事件链 |
| 后梁五代转折 | `five-dynasties` 是唐—后梁共享转折，后梁已有 `later-liang-five-dynasties-founded` 独立端点 | `shared-transition-event` | 不重复引用 |
| 东周东迁 | `zhou-eastward` 同时关联西周、东周，表达王室迁徙和分期转换 | `foundation-stage-boundary` | 不把迁徙节点重复为东周建政 |
| 北宋建政 | `song-founded` 虽仅关联北宋，但与 `northern-song-founded` 表达同一 960 年建政事实 | `duplicate-event-node` | 保留规范事件链，不重复引用 |
| 后凉姑臧白塔寺 | `guzang-baita-temple-site` 同时关联前凉、北凉、后凉，主要阶段为401—439年，不能据同城关系归入386—403年的后凉 | `cross-polity-heritage` | 不补入后凉遗产列表 |
| 后周开封城市层 | `kaifeng-northern-song-city-site` 覆盖后梁、后晋、后汉、后周、北宋，主体是960年后的北宋城市层 | `cross-stage-city-layer` | 不补入后周遗产列表 |

## 验证

- 回归测试：`src/data/capital-reference-round111.task-c.test.ts`
- 测试覆盖 1 项闭合链路、4 项共享/分期事件、1 项重复事件、2 项跨政权/跨阶段遗产。
- 不新增事件端点，不拆分共享事件，不以同城关系替代政权归属。
