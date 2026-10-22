# 第104轮玄奘遗产事件边界审计

## 审计对象

本轮复核以下 5 个 `heritage detail coverage = needs-review` 条目：

- 大雁塔 `big-wild-goose-pagoda`
- 青龙寺遗址 `qinglong-temple-site`
- 西安碑林 `xian-beilin`
- 小雁塔 `xiao-yan-ta`
- 西明寺遗址 `ximing-temple-site`

它们都保留 `tang-founded` 与 `xuanzang-translations` 两个关联事件，其中后者是当前事件目录中的待核端点。

## 现有事件与来源核验

本轮直接检查了 `events`、`eventDetails`、`heritageDetails` 和 `sourceNotes`：

1. 全局事件目录没有 `xuanzang-translations`；事件详情目录也没有同 ID 的详情。
2. 五个遗产的现有关联事件集合只有已收录的 `tang-founded` 和未收录的 `xuanzang-translations`。因此不能用某个现有城市事件或唐建立事件伪装成玄奘译经事件。
3. 大雁塔地方志来源可以支持 652 年始建、大慈恩寺和玄奘关联；小雁塔数字资料可以支持 707—710 年始建及后世震损修缮；青龙寺来源可以支持 582 年前身、711 年定名、遗址考古与现代保护。它们分别说明建筑或寺院沿革，不提供一条同时覆盖五处遗产的译经活动事件。
4. `zizhi-tongjian` 与 `modern-geography-reference` 是历史编年和现代位置的通用来源，不能单独补出译经活动的统一起止年代、五处地点集合、分阶段过程及完整参与者名单。
5. 现有资料不能把碑林的后世收藏迁置、寺院遗址位置、大雁塔/小雁塔营建年代和青龙寺沿革拼接成同一事件；这会把建筑史、寺院史和人物活动混成一个节点。

## 结论

本轮没有足够证据安全拆出 `xuanzang-translations`。继续保留五个 `needs-review` 条目和未解析事件端点，未新增事件、人物参与或地点断言。

五个详情的不确定性说明已明确记录：当前缺少可共同适用于五处遗产的统一起止年代、地点集合、阶段链和独立来源；建筑年代不得拼接为译经事件。待获得专门译经史料后，应先分别建立活动阶段、地点和参与者证据，再决定是否新增事件节点。

## 验收边界

- 5 个条目仍有详情，且 `missingFields` 为空。
- 5 个条目仍是 `needs-review`，唯一未解析事件为 `xuanzang-translations`。
- `xuanzang-translations` 不存在于全局事件目录或事件详情目录。
- 不把 `tang-founded` 替代玄奘译经事件。
- 不凭建筑始建年、寺院定名年或现代遗址考古年推导译经事件年代。
