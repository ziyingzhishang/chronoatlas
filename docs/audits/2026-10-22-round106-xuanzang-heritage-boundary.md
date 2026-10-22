# 第106轮玄奘遗产事件端点复核

## 复核范围

本轮只复核 `heritage detail coverage` 中因 `xuanzang-translations` 未解析而处于 `needs-review` 的 5 项：

| 遗产 | 当前关联事件 | 当前状态 |
| --- | --- | --- |
| 大雁塔 `big-wild-goose-pagoda` | `tang-founded`、`xuanzang-translations` | `needs-review` |
| 青龙寺遗址 `qinglong-temple-site` | `tang-founded`、`xuanzang-translations` | `needs-review` |
| 西安碑林 `xian-beilin` | `tang-founded`、`xuanzang-translations` | `needs-review` |
| 小雁塔 `xiao-yan-ta` | `tang-founded`、`xuanzang-translations` | `needs-review` |
| 西明寺遗址 `ximing-temple-site` | `tang-founded`、`xuanzang-translations` | `needs-review` |

## 事件目录核验

- `src/data/events.ts` 不含 `xuanzang-translations`。
- `src/data/event-details.ts` 不含 `xuanzang-translations` 的详情。
- 现有事件叙事中没有可作为玄奘译经事件的语义候选，现有事件详情中也没有 `xuan-zang` 参与者端点。
- `tang-founded` 只能表达唐建立及其政治背景，不能替代玄奘译经活动。

因此，当前事件目录不能提供一个具备稳定事件记录和完整详情的可执行端点。

## 来源核验

现有来源的证据范围是分散的：

- `xian-local-chronicle-big-wild-goose` 支持大雁塔652年始建、玄奘与大慈恩寺关联及今西安位置。
- `xiao-yan-ta-official-digital` 支持小雁塔707—710年始建、震损、修缮和荐福寺位置。
- `qinglong-temple-official` 支持青龙寺582年前身、711年定名、考古与现代保护。
- `zizhi-tongjian` 与 `modern-geography-reference` 分别是通用编年和现代地理参照，不能单独提供译经活动的完整端点。
- 碑林和西明寺目前只有通用历史/地理来源与详情叙述，没有一条来源同时覆盖五处遗产的译经年代、阶段、地点和参与者。

本轮要求的完整端点契约为：

1. `events` 中有稳定事件记录；
2. `eventDetails` 中有对应详情；
3. 有可核验的起止年代与日期精度；
4. 有分阶段过程；
5. 有玄奘及其他参与者的事件角色；
6. 有覆盖五处遗产关系的地点证据；
7. 有覆盖上述断言的已收录来源。

现有资料未同时满足这些条件，尤其缺少统一译经活动的时间范围、阶段链、地点集合、完整参与者和共同来源。因此不新增 `xuanzang-translations`，也不把多个遗产的建筑年代拼接成一个译经事件。

## 可执行边界

新增 `src/data/heritage-event-round106-xuanzang-boundary.test.ts` 固化以下规则：

- 五项仍必须是 `needs-review`，且唯一未解析事件为 `xuanzang-translations`；
- 事件记录、事件详情、时间、阶段、参与者、地点和来源任一缺失，都不能升级为完整事件端点；
- 现有语义事件和人物参与者目录不能被误当作译经事件；
- 建筑始建年、寺院定名年、碑林迁置/编次年、考古发掘年和现代保护年不得替代译经事件年代。

## 结论

第106轮不修改事件或遗产数据，不补录 `xuanzang-translations`，不新增人物参与、地点或事件替代关系。五项遗产继续保留显式待核关联和 `needs-review` 状态；后续只有在取得专门译经史料并能逐项满足完整端点契约时，才进入事件数据补录。
