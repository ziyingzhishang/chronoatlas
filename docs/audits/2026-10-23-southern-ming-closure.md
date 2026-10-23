# 南明多阶段数据闭环审计

## 决策

`southern-ming-founded` 保留 `year: 1644`、`datePrecision: approximate`、`verification: partial`。

1644 年表示明廷北方崩解后南明体系开始形成的约年，不虚构一个统一的“南明建国日”。南明在项目中拆为四个可导航阶段：弘光南京、隆武福州、绍武广州、永历肇庆；绍武与永历明确标为 1646 年同期并立的不同阶段。

## 阶段闭环

| 阶段 | 事件 | 阶段中心 | 今日地点 | 人物 | 遗产节点 |
| --- | --- | --- | --- | --- | --- |
| 弘光 | `hongguang-nanjing-founded` | 应天府／南京 | 江苏省南京市 | 朱由崧、史可法 | 南明应天府明故宫遗址 |
| 隆武 | `longwu-fuzhou-founded` | 福州／天兴府 | 福建省福州市 | 朱聿键、郑芝龙、黄道周 | 南明隆武福州行宫遗址关联空间 |
| 绍武 | `shaowu-guangzhou-founded` | 广州 | 广东省广州市 | 朱聿鐭、苏观生 | 广州绍武君臣墓 |
| 永历 | `yongli-zhaoqing-founded` | 肇庆 | 广东省肇庆市 | 朱由榔、瞿式耜 | 肇庆永历行宫与万寿宫历史空间 |

每个阶段均已接入事件详情、政权详情、资本／首都历史、现代地点、遗产详情、人物详情、人物关系 claim 和来源 ID。现代遗产说明区分原始历史空间、后世叠加、迁移和当代保护状态。

## 来源链

- 总览与阶段分期：[故宫博物院：永历政权](https://www.dpm.org.cn/court/event/160186.html)
- 弘光南京：[故宫博物院：南明弘光政权及其覆灭](https://www.dpm.org.cn/court/event/159031.html)
- 隆武福州：[故宫博物院：隆武政权](https://www.dpm.org.cn/court/event/159831.html)
- 永历肇庆：[中国国家博物馆：康熙元年三月十二日俘获永历帝宣捷诏谕](https://www.chnmuseum.cn/zp/zpml/gjwxbt/202008/t20200824_247135.shtml)
- 隆武城市空间：[福州市人民政府：国姓来自鼓屏路](https://www.fuzhou.gov.cn/zgfzzt/zjrc/mdfc/lswh/201610/t20161024_129420.htm)
- 绍武君臣墓：[广州市文化广电旅游局：绍武君臣墓考古资料](https://wglj.gz.gov.cn/zwpd/2.5.6/201904/8f2cc8ddb1764ea78283ee4f0c84601c/files/cbdf2782b10e49478acf3c2fd51b3cde.pdf)
- 肇庆遗产关联：[广东省人民政府：肇庆七星岩](https://www.gd.gov.cn/zjgd/lyxx/lydt/content/post_110913.html)
- 人物与明室谱系：[《明史》卷一百二十](https://zh.wikisource.org/zh-hans/明史_%28四庫全書本%29/卷120)

## 验证

- `npx vitest run src/data/southern-ming-closure.test.ts src/data/event-time-review.test.ts`：通过，7/7。
- `npm test -- --run`：229 个测试文件通过、46 个测试文件失败；失败主要是既有批次测试对人物、遗产和事件覆盖总数的固定基线仍为旧值，以及共享工作树中既有西辽专项测试与其未提交修改的断言不一致。本任务新增专项测试和时间审计均已通过，未为无关历史批次扩散修改。
- 已执行 `git diff --check`；完成后未创建 commit。

## 边界

本轮闭环覆盖南明最主要的四个阶段，不声称已经穷尽鲁王监国、靖江王等所有并行政治实体，也不把阶段性中心误写成南明全期唯一首都。肇庆遗产节点表达城市历史空间和遗存关联，不把现存阅江楼或相关建筑整体断言为 1646 年原构。
