# 第121轮上阳宫事件端点审计

## 本轮范围

本轮由都城与宫城史专家核查上阳宫的年代、政权归属、洛阳现代地点和遗产关联，目标是把“唐、武周共享遗产”拆成可解释的阶段，而不是把上阳宫错误写成武周重新营建。

## 已入库端点

| 事件 | 年代 | 政权 | 语义 | 状态 |
| --- | --- | --- | --- | --- |
| `shangyang-palace-built` | 674—676 | 唐 | 上元年间营造；675年保留为通行整理年 | `partial`，范围审查 |
| `shangyang-palace-completed-679` | 679 | 唐 | 宫成、唐高宗移御，首次明确使用端点 | `checked` |

主要依据为[《太平御览》卷一七三引《东京记》](https://zh.wikisource.org/zh-hans/%E5%A4%AA%E5%B9%B3%E5%BE%A1%E8%A6%BD/0173)的“上元中”营造记载，以及[《资治通鉴》卷二〇二](https://zh.wikisource.org/zh-hans/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91_%28%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC%29/%E5%8D%B7202)关于679年“宫成、上徙御之”的记载。

## 边界

- 675年不升级为绝对始建单年；原始材料只稳定支持674—676年范围。
- 679年是宫成与政治使用端点，不等于所有建筑单元同年完成，也不等于永久迁都。
- 武周（690—705）只关联上阳宫的沿用和政治功能，不新增“武周营建上阳宫”事件。
- 现代地点继续表达为今河南省洛阳市西工区、隋唐洛阳城宫城西部及洛河沿线相关考古区域；保护范围不等于完整唐代宫苑边界。

## 验收

- `src/data/shangyang-palace-events.test.ts`
- `src/data/capital-reference-round114.residual-categories.test.ts`
- `src/data/event-time-review.test.ts`
