# 第110轮任务 A：汉长安与东汉洛阳候选审计

本轮只核验四项第109轮遗留候选：`changle-palace-site`、`maoling`、`du-ling`、`white-horse-temple`。闭合条件为：遗产详情明确归属于单一政权、目录与详情地点对应首都阶段、年代与首都阶段相交、目录与详情存在来源交集，并且关联事件中存在地点、政权和营建年代均相容的独立事件端点。本轮最多闭合一项。

## 核验结果

| 遗产 | 政权归属 | 地点与年代 | 独立营建事件端点 | 结论 |
| --- | --- | --- | --- | --- |
| `changle-palace-site` | `han_western`、`xin` | 长安；前200年至未设终点；与西汉长安阶段相交 | 不作为单一政权候选核验 | 跨政权，保留边界 |
| `maoling` | `han_western` | 长安；前139年至未设终点；与西汉长安阶段相交 | 无；`han-imperial-accession` 为前202年政权重建背景，地点和年代不构成茂陵营建端点 | 保留边界，不补入西汉详情 |
| `du-ling` | `han_western` | 长安；前74年至未设终点；与西汉长安阶段相交 | 无；`han-imperial-accession` 为前202年政权重建背景，地点和年代不构成杜陵营建端点 | 保留边界，不补入西汉详情 |
| `white-horse-temple` | `han_eastern`、`tang` | 洛阳；68年至未设终点；与东汉洛阳阶段相交 | 不作为单一政权候选核验；详情明确今日建筑为历代叠合 | 跨政权，保留边界 |

## 本轮决定

本轮闭合 0 项。四项均未满足完整闭环，因而没有修改政权、遗产或事件事实数据。尤其不能把茂陵、杜陵的地点、年代和现代地理来源交集，等同于独立营建事件；也不能把白马寺 68 年创建传统等同于今日建筑群的东汉原构。

新增测试 `src/data/capital-reference-round110-han.test.ts`，固定以下边界：

- 长乐宫和白马寺的多政权归属不能被压缩为单一政权遗产。
- 茂陵和杜陵必须同时满足单一政权、长安首都阶段、来源交集与独立营建事件端点后，才可进入西汉政权详情。
- `han-imperial-accession` 仅作为西汉政权重建背景，不能替代两座帝陵各自的营建事件。
- 本轮四项均不应被计为已闭合首都遗产关联。

验证命令：

```text
npm test -- --run src/data/capital-reference-round110-han.test.ts src/data/capital-reference-round109-han-wei.test.ts
npm run build
git diff --check
```
