# 第103轮遗产详情与事件端点审计

## 审计对象

本轮复核以下 4 个 `heritage detail coverage = needs-review` 条目，并回看已由专属事件端点闭合的西明寺：

- 大雁塔 `big-wild-goose-pagoda`
- 青龙寺遗址 `qinglong-temple-site`
- 西安碑林 `xian-beilin`
- 小雁塔 `xiao-yan-ta`
- 西明寺遗址 `ximing-temple-site`（`complete`，不再属于本轮共享端点边界）

## 当前结论

四个共享边界遗产详情的现代位置、历史关联、至少三段历史阶段、现存特征、现代价值、人物、政权和来源端点均已具备；它们共同引用 `xuanzang-translations`，但全局事件目录中没有这个事件节点，因此仍为 `needs-review`，不是详情字段缺失。西明寺已改用 `ximing-temple-built` 与 `xuanzang-at-ximing-658` 两个专属事件端点，coverage 状态为 `complete`；其具体位置仍为约址，统一译经端点不确定性继续保留在详情文本中。

本轮没有新增 `xuanzang-translations` 事件。现有资料可以支持玄奘在长安译经及其与大慈恩寺、荐福寺、唐代寺院网络的关联，但还不能在当前事件模型中同时确认：

1. 一个可复核的统一起止年代；
2. 四个共享边界遗产都适用的同一地点集合；
3. 译经活动的分阶段过程、参与者和事件影响；
4. 能覆盖上述断言的独立、明确来源端点。

把长期文化活动压成一个覆盖多处遗产的完整事件，会把人物活动、寺院沿革和遗产建筑年代混为同一历史节点。因此四个共享边界详情继续保留关联 ID，并用第103轮测试固定该证据边界；西明寺只确认自身专属端点，等待补入专门译经史料后再决定是否建立统一事件节点。

## 验收边界

- 4 个共享边界条目仍有详情，且 `missingFields` 为空；西明寺详情为 `complete`。
- 仅 4 个共享边界条目因 `xuanzang-translations` 未解析而处于 `needs-review`。
- 西明寺关联 `ximing-temple-built`、`xuanzang-at-ximing-658` 和 `tang-founded`，不再挂接 `xuanzang-translations`。
- 不把唐建立事件替代玄奘译经事件。
- 不从大雁塔、小雁塔、青龙寺、西明寺或碑林的建筑年代反推译经事件年代。
