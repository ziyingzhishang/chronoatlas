# 第114轮首都引用残余分类审计

## 目的

把当前首都阶段审计发现、但尚未补入政权详情的 17 项候选集中登记。分类只描述当前证据边界，不把同城、年代重合或通用事件自动升级为政权专属引用。

## 分类结果

| 分类 | 候选数量 | 处理原则 |
| --- | ---: | --- |
| `shared-transition-event` | 3 | 保留在城市视角或共享事件视角，不重复写入单一政权链 |
| `construction-endpoint-unresolved` | 1 | 缺少遗产单体的独立营建事件端点，继续保留候选 |
| `cross-polity-heritage` | 4 | 遗产跨越多个政权，不能因首都阶段重合归入一个政权 |
| `layered-capital-heritage` | 4 | 隋唐叠压的都城遗产，需维持城市视角和分层年代 |
| `location-approximate` | 1 | 西明寺专属营建与玄奘阶段事件已补齐，但具体约址与统一译经事件仍不能合并 |
| `cross-stage-city-layer` | 1 | 城市遗产主体年代晚于后周政权阶段，不能倒灌引用 |
| `foundation-stage-boundary` | 1 | 东周东迁是分期与迁徙边界，不等于东周建政专属事件 |
| `duplicate-event-node` | 1 | 与已有规范建政事件重复，保留规范节点 |
| `heritage-event-not-polity-chain` | 1 | 白马寺已有东汉创建事件，但遗产整体跨越东汉与唐，不并入单一政权遗产链 |

## 本轮结论

17 项候选全部有明确分类。茂陵、杜陵已分别新增独立营建事件，并补入西汉政权详情；白马寺虽然已有东汉创建事件，但遗产整体跨越东汉与唐，仍不并入单一政权遗产链。后续只有在出现独立来源、专属地点、明确年代和不重复的事件语义时，才允许将对应候选从残余清单移出。

## 回归测试

- `src/data/capital-reference-round114.residual-categories.test.ts`
- 与既有 `capital-reference-round105.audit.test.ts` 的残余集合保持一致。
