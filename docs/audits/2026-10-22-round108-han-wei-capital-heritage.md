# 第108轮任务A：汉长安与汉魏洛阳遗产审计

## 核验范围

本轮只核验 `hanyangling`、`changle-palace-site`、`maoling`、`du-ling`、`white-horse-temple`、`yongning-temple-pagoda-site`。判断入口为遗产详情的 `associatedPolities`、遗产目录的 `placeId` 与 `constructionFrom`、首都阶段的政权／地点／年代，以及遗产和详情的来源字段。

本轮最多安全闭合一项；不得仅因“都在西安／洛阳”把跨政权遗产补入某一政权详情。

## 唯一闭合项：西汉—长安—阳陵

将 `hanyangling` 补入 `han_western` 的 `heritageIds`。

- `associatedPolities` 只有 `han_western`。
- 遗产目录地点为 `changan`，现代位置说明为今西安市北部渭城区与咸阳原一带，作为长安北部帝陵区的现代地理参照。
- 原始营建起点为前157年，落在西汉长安首都阶段（前201—公元9年）内。
- 遗产目录与详情来源均有 `modern-geography-reference`，详情来源覆盖遗产目录来源。
- 因此形成“西汉政权—长安地点—首都阶段—阳陵遗产详情”的单政权闭环；不把阳陵现存遗址或展示设施误写成西汉原建筑完整留存。

## 其余候选分类

| 遗产 | 分类 | 处理 |
|---|---|---|
| `changle-palace-site` | `cross-polity-heritage` | 详情同时关联 `han_western` 与 `xin`，不在本轮归入单一政权。 |
| `maoling` | `single-polity-heritage-deferred-by-round-limit` | 字段、地点和年代满足西汉长安阶段，但本轮已达到唯一闭合额度，保留候选供后续独立审计。 |
| `du-ling` | `single-polity-heritage-deferred-by-round-limit` | 字段、地点和年代满足西汉长安阶段，但本轮已达到唯一闭合额度，保留候选供后续独立审计。 |
| `white-horse-temple` | `cross-polity-heritage` | 详情同时关联 `han_eastern` 与 `tang`；公元68年的创建传统不能覆盖今日多时期建筑群，不能归为东汉专属现存建筑。 |
| `yongning-temple-pagoda-site` | `single-polity-heritage-deferred-by-round-limit` | 单列 `wei_northern`，地点为洛阳，516年落在北魏洛阳首都阶段；本轮额度已用尽，保留候选供后续审计。 |

回归测试：`src/data/capital-reference-round108-han-wei.test.ts`。测试固定唯一闭合项，并要求其他候选明确分类，防止后续以同城关系静默扩大政权遗产引用。
